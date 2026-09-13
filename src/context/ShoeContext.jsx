import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_SHOES } from '../data/defaultShoes';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  compressImage,
  getSupabaseCredentials
} from '../lib/supabase';

const ShoeContext = createContext(null);
const LOCAL_STORAGE_SHOES_KEY = 'shoespicker_local_shoes_v1';
const LOCAL_STORAGE_TAGS_KEY = 'shoespicker_custom_tags_v1';

const DEFAULT_TAGS = ['#PunyaKakak', '#PunyaMama', '#PunyaAdek', '#PunyaAyah'];

export function ShoeProvider({ children }) {
  const [shoes, setShoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCloud, setIsCloud] = useState(false);
  const [cloudError, setCloudError] = useState(null);
  const [swipeHistory, setSwipeHistory] = useState([]); // [{ id, prevStatus }]
  const [activeTab, setActiveTab] = useState('sortir'); // 'sortir' | 'koleksi'
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);

  // Nametag state: user-defined tags like #PunyaKakak, #PunyaMama, #PunyaAdek, #PunyaAyah
  const [customTags, setCustomTags] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_TAGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const updated = parsed.map((t) => {
            if (t === '#PunyaSaya') return '#PunyaAdek';
            if (t === '#PunyaPapa') return '#PunyaAyah';
            return t;
          });
          if (!updated.includes('#PunyaAdek')) updated.push('#PunyaAdek');
          if (!updated.includes('#PunyaAyah')) updated.push('#PunyaAyah');
          const unique = Array.from(new Set(updated));
          localStorage.setItem(LOCAL_STORAGE_TAGS_KEY, JSON.stringify(unique));
          return unique;
        }
      }
    } catch (e) {}
    return DEFAULT_TAGS;
  });

  // Photo Zoom state
  const [zoomImage, setZoomImage] = useState(null); // { url, name, brand, owner_tag, notes }

  const openZoom = (shoeOrData) => {
    if (!shoeOrData) return;
    if (typeof shoeOrData === 'string') {
      setZoomImage({ url: shoeOrData, name: 'Detail Foto', brand: '', owner_tag: '' });
    } else {
      setZoomImage({
        url: shoeOrData.image_url || shoeOrData.url,
        name: shoeOrData.name || 'Detail Foto',
        brand: shoeOrData.brand || '',
        owner_tag: shoeOrData.owner_tag || '',
        notes: shoeOrData.notes || ''
      });
    }
  };

  const closeZoom = () => setZoomImage(null);

  // User-defined tag manager
  const addCustomTag = (rawTag) => {
    if (!rawTag) return null;
    let formatted = rawTag.trim();
    if (!formatted.startsWith('#')) {
      formatted = '#' + formatted;
    }
    // Remove consecutive spaces
    formatted = formatted.replace(/\s+/g, '');
    if (formatted === '#') return null;

    setCustomTags((prev) => {
      if (prev.includes(formatted)) return prev;
      const updated = [...prev, formatted];
      try {
        localStorage.setItem(LOCAL_STORAGE_TAGS_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    return formatted;
  };

  const deleteCustomTag = (tagToDelete) => {
    setCustomTags((prev) => {
      const updated = prev.filter((t) => t !== tagToDelete);
      try {
        localStorage.setItem(LOCAL_STORAGE_TAGS_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Helper to ensure shoes have owner_tag and migrate old tags
  const normalizeShoesData = (items) => {
    return items.map((shoe, idx) => {
      let tag = shoe.owner_tag;
      if (tag === '#PunyaSaya') tag = '#PunyaAdek';
      if (tag === '#PunyaPapa') tag = '#PunyaAyah';
      if (!tag) {
        const def = DEFAULT_SHOES.find((d) => d.id === shoe.id || d.name === shoe.name);
        tag = def?.owner_tag || (idx % 2 === 0 ? '#PunyaKakak' : '#PunyaMama');
      }
      return {
        ...shoe,
        owner_tag: tag
      };
    });
  };

  // Initialize data (Fetch from Supabase if configured, otherwise from localStorage/defaultShoes)
  const loadShoes = useCallback(async () => {
    setLoading(true);
    setCloudError(null);

    const supabase = getSupabaseClient();
    const hasCloud = isSupabaseConfigured() && supabase !== null;
    setIsCloud(hasCloud);

    if (hasCloud) {
      try {
        const { data, error } = await supabase
          .from('shoes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase fetch error, falling back to local:', error);
          setCloudError(error.message);
          loadFromLocalStorage();
        } else if (data && data.length > 0) {
          setShoes(normalizeShoesData(data));
        } else {
          // If Supabase table is empty, seed it with default shoes
          console.log('Seeding initial shoes to Supabase...');
          const { data: seeded, error: seedErr } = await supabase
            .from('shoes')
            .insert(
              DEFAULT_SHOES.map((s) => ({
                name: s.name,
                brand: s.brand,
                category: s.category,
                owner_tag: s.owner_tag || '#PunyaKakak',
                image_url: s.image_url,
                status: s.status,
                notes: s.notes
              }))
            )
            .select();

          if (!seedErr && seeded) {
            setShoes(normalizeShoesData(seeded));
          } else {
            setShoes(DEFAULT_SHOES);
          }
        }
      } catch (err) {
        console.error('Exception connecting to Supabase:', err);
        setCloudError(err.message || 'Gagal terhubung ke Supabase');
        loadFromLocalStorage();
      }
    } else {
      loadFromLocalStorage();
    }
    setLoading(false);
  }, []);

  const loadFromLocalStorage = () => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_SHOES_KEY);
      if (cached) {
        setShoes(normalizeShoesData(JSON.parse(cached)));
      } else {
        setShoes(DEFAULT_SHOES);
        localStorage.setItem(LOCAL_STORAGE_SHOES_KEY, JSON.stringify(DEFAULT_SHOES));
      }
    } catch (e) {
      console.error('LocalStorage error:', e);
      setShoes(DEFAULT_SHOES);
    }
  };

  useEffect(() => {
    loadShoes();
  }, [loadShoes]);

  // Sync to localStorage as backup if not cloud or when offline
  useEffect(() => {
    if (shoes.length > 0 && !isCloud) {
      try {
        localStorage.setItem(LOCAL_STORAGE_SHOES_KEY, JSON.stringify(shoes));
      } catch (e) {
        console.warn('Failed to cache shoes to localStorage', e);
      }
    }
  }, [shoes, isCloud]);

  /**
   * Action: Swipe a shoe to either 'masih_dipakai' or 'tidak_dipakai'
   */
  const swipeShoe = async (shoeId, newStatus) => {
    const currentShoe = shoes.find((s) => s.id === shoeId);
    if (!currentShoe) return;

    const prevStatus = currentShoe.status;

    // Record in history for undo
    setSwipeHistory((prev) => [...prev, { id: shoeId, prevStatus }]);

    // Optimistic UI update
    setShoes((prev) =>
      prev.map((s) => (s.id === shoeId ? { ...s, status: newStatus } : s))
    );

    // Update in Supabase if online
    const supabase = getSupabaseClient();
    if (isCloud && supabase) {
      try {
        const { error } = await supabase
          .from('shoes')
          .update({ status: newStatus })
          .eq('id', shoeId);
        if (error) console.error('Error updating status in Supabase:', error);
      } catch (err) {
        console.error('Supabase update failed:', err);
      }
    }
  };

  /**
   * Action: Undo last swipe action
   */
  const undoLastSwipe = async () => {
    if (swipeHistory.length === 0) return;

    const lastAction = swipeHistory[swipeHistory.length - 1];
    setSwipeHistory((prev) => prev.slice(0, -1));

    // Optimistic revert
    setShoes((prev) =>
      prev.map((s) => (s.id === lastAction.id ? { ...s, status: lastAction.prevStatus } : s))
    );

    const supabase = getSupabaseClient();
    if (isCloud && supabase) {
      try {
        await supabase
          .from('shoes')
          .update({ status: lastAction.prevStatus })
          .eq('id', lastAction.id);
      } catch (err) {
        console.error('Supabase undo update failed:', err);
      }
    }
  };

  /**
   * Action: Update status directly (from shoe list or dropdown)
   */
  const updateShoeStatus = async (shoeId, newStatus) => {
    setShoes((prev) =>
      prev.map((s) => (s.id === shoeId ? { ...s, status: newStatus } : s))
    );

    const supabase = getSupabaseClient();
    if (isCloud && supabase) {
      try {
        await supabase
          .from('shoes')
          .update({ status: newStatus })
          .eq('id', shoeId);
      } catch (err) {
        console.error('Supabase status change failed:', err);
      }
    }
  };

  /**
   * Action: Delete shoe
   */
  const deleteShoe = async (shoeId) => {
    setShoes((prev) => prev.filter((s) => s.id !== shoeId));

    const supabase = getSupabaseClient();
    if (isCloud && supabase) {
      try {
        await supabase.from('shoes').delete().eq('id', shoeId);
      } catch (err) {
        console.error('Supabase delete failed:', err);
      }
    }
  };

  /**
   * Action: Upload & Add new shoe
   */
  const addNewShoe = async ({ name, brand, category, owner_tag, notes, file, imageUrl }) => {
    let finalImageUrl = imageUrl;
    const supabase = getSupabaseClient();

    if (file) {
      // Compress image for lightning fast loading
      const compressedFile = await compressImage(file);

      if (isCloud && supabase) {
        try {
          const fileExt = 'webp';
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `uploads/${fileName}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('shoe-images')
            .upload(filePath, compressedFile, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.warn('Storage upload error, using DataURL fallback:', uploadError);
            finalImageUrl = await fileToDataUrl(compressedFile);
          } else {
            const { data: urlData } = supabase.storage
              .from('shoe-images')
              .getPublicUrl(filePath);
            finalImageUrl = urlData.publicUrl;
          }
        } catch (storageErr) {
          console.error('Storage exception, using DataURL fallback:', storageErr);
          finalImageUrl = await fileToDataUrl(compressedFile);
        }
      } else {
        // Local mode fallback to Data URL
        finalImageUrl = await fileToDataUrl(compressedFile);
      }
    }

    if (!finalImageUrl) {
      finalImageUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80';
    }

    const formattedTag = owner_tag
      ? (owner_tag.startsWith('#') ? owner_tag.trim() : '#' + owner_tag.trim())
      : '#PunyaKakak';

    const newShoeData = {
      name: name.trim(),
      brand: brand.trim(),
      category: category || 'Sneakers',
      owner_tag: formattedTag,
      image_url: finalImageUrl,
      status: 'belum_disortir',
      notes: notes ? notes.trim() : '',
      created_at: new Date().toISOString()
    };

    if (isCloud && supabase) {
      try {
        const { data, error } = await supabase
          .from('shoes')
          .insert([newShoeData])
          .select();

        if (error) {
          // If Supabase table does not have 'owner_tag' column yet, fallback gracefully
          if (error.message?.includes('owner_tag') || error.code === '42703') {
            console.warn('owner_tag column not in Supabase, inserting without it...');
            const fallbackData = {
              name: newShoeData.name,
              brand: newShoeData.brand,
              category: newShoeData.category,
              image_url: newShoeData.image_url,
              status: newShoeData.status,
              notes: newShoeData.notes ? `${newShoeData.notes} [${formattedTag}]` : `[${formattedTag}]`,
              created_at: newShoeData.created_at
            };
            const retryRes = await supabase.from('shoes').insert([fallbackData]).select();
            if (retryRes.error) throw retryRes.error;
            if (retryRes.data && retryRes.data[0]) {
              setShoes((prev) => [{ ...retryRes.data[0], owner_tag: formattedTag }, ...prev]);
              return;
            }
          }
          console.error('Error adding shoe to Supabase:', error);
          throw new Error(`Gagal simpan ke Supabase: ${error.message}. ${error.hint || 'Pastikan sudah menjalankan SQL GRANT di Supabase.'}`);
        } else if (data && data[0]) {
          setShoes((prev) => [data[0], ...prev]);
        }
      } catch (err) {
        console.error('Supabase add shoe failed:', err);
        throw err;
      }
    } else {
      const localShoe = { ...newShoeData, id: 'local-' + Date.now() };
      setShoes((prev) => [localShoe, ...prev]);
    }
  };

  /**
   * Action: Update owner nametag
   */
  const updateShoeTag = async (shoeId, newTag) => {
    const formattedTag = newTag
      ? (newTag.startsWith('#') ? newTag.trim() : '#' + newTag.trim())
      : '';

    setShoes((prev) =>
      prev.map((s) => (s.id === shoeId ? { ...s, owner_tag: formattedTag } : s))
    );

    const supabase = getSupabaseClient();
    if (isCloud && supabase) {
      try {
        await supabase
          .from('shoes')
          .update({ owner_tag: formattedTag })
          .eq('id', shoeId);
      } catch (err) {
        console.warn('Supabase update tag notice:', err);
      }
    }
  };

  /**
   * Action: Reset all sorting states back to 'belum_disortir'
   */
  const resetSortirStatus = async () => {
    setSwipeHistory([]);
    setShoes((prev) => prev.map((s) => ({ ...s, status: 'belum_disortir' })));

    const supabase = getSupabaseClient();
    if (isCloud && supabase) {
      try {
        await supabase
          .from('shoes')
          .update({ status: 'belum_disortir' })
          .neq('status', 'belum_disortir');
      } catch (err) {
        console.error('Supabase reset failed:', err);
      }
    }
  };

  /**
   * Helper: Reset catalog back to default sample shoes
   */
  const restoreDefaultCatalog = async () => {
    setSwipeHistory([]);
    setShoes(DEFAULT_SHOES);
    try {
      localStorage.setItem(LOCAL_STORAGE_SHOES_KEY, JSON.stringify(DEFAULT_SHOES));
    } catch (e) {}

    const supabase = getSupabaseClient();
    if (isCloud && supabase) {
      try {
        await supabase.from('shoes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('shoes').insert(
          DEFAULT_SHOES.map((s) => ({
            name: s.name,
            brand: s.brand,
            category: s.category,
            owner_tag: s.owner_tag || '#PunyaKakak',
            image_url: s.image_url,
            status: 'belum_disortir',
            notes: s.notes
          }))
        );
      } catch (err) {
        console.error('Supabase restore failed:', err);
      }
    }
  };

  // Helper file to DataURL
  const fileToDataUrl = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  };

  // Derived queries
  const unswipedShoes = shoes.filter((s) => s.status === 'belum_disortir');
  const masihDipakaiShoes = shoes.filter((s) => s.status === 'masih_dipakai');
  const tidakDipakaiShoes = shoes.filter((s) => s.status === 'tidak_dipakai');

  const statusCounts = {
    total: shoes.length,
    belumDisortir: unswipedShoes.length,
    masihDipakai: masihDipakaiShoes.length,
    tidakDipakai: tidakDipakaiShoes.length
  };

  return (
    <ShoeContext.Provider
      value={{
        shoes,
        unswipedShoes,
        masihDipakaiShoes,
        tidakDipakaiShoes,
        statusCounts,
        loading,
        isCloud,
        cloudError,
        activeTab,
        setActiveTab,
        isUploadOpen,
        setIsUploadOpen,
        isCloudModalOpen,
        setIsCloudModalOpen,
        swipeShoe,
        undoLastSwipe,
        canUndo: swipeHistory.length > 0,
        updateShoeStatus,
        updateShoeTag,
        deleteShoe,
        addNewShoe,
        resetSortirStatus,
        restoreDefaultCatalog,
        refreshShoes: loadShoes,
        // Nametag additions
        customTags,
        addCustomTag,
        deleteCustomTag,
        // Zoom additions
        zoomImage,
        openZoom,
        closeZoom
      }}
    >
      {children}
    </ShoeContext.Provider>
  );
}

export function useShoes() {
  const context = useContext(ShoeContext);
  if (!context) {
    throw new Error('useShoes must be used within a ShoeProvider');
  }
  return context;
}
