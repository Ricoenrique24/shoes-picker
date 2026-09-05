import { createClient } from '@supabase/supabase-js';

const STORAGE_CONFIG_KEY = 'shoespicker_supabase_config';

/**
 * Get current Supabase credentials from ENV or LocalStorage
 */
export function getSupabaseCredentials() {
  // Check localStorage first (user-configured in UI)
  try {
    const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.key) {
        return { url: parsed.url, key: parsed.key, source: 'localStorage' };
      }
    }
  } catch (e) {
    console.error('Failed reading custom config from localStorage', e);
  }

  // Fallback to Vite Environment variables
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey && !envUrl.includes('your-project-id')) {
    return { url: envUrl, key: envKey, source: 'env' };
  }

  return { url: null, key: null, source: 'none' };
}

let supabaseInstance = null;
let currentUrl = null;
let currentKey = null;

/**
 * Get or create Supabase client
 */
export function getSupabaseClient() {
  const { url, key } = getSupabaseCredentials();

  if (!url || !key) {
    return null;
  }

  if (!supabaseInstance || currentUrl !== url || currentKey !== key) {
    try {
      supabaseInstance = createClient(url, key);
      currentUrl = url;
      currentKey = key;
    } catch (err) {
      console.error('Error creating Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
}

export function isSupabaseConfigured() {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key);
}

export function saveCustomSupabaseConfig(url, key) {
  if (!url || !key) return false;
  try {
    localStorage.setItem(
      STORAGE_CONFIG_KEY,
      JSON.stringify({ url: url.trim(), key: key.trim() })
    );
    // Reset instance to use new credentials
    supabaseInstance = null;
    return true;
  } catch (e) {
    console.error('Failed to save Supabase config', e);
    return false;
  }
}

export function clearCustomSupabaseConfig() {
  try {
    localStorage.removeItem(STORAGE_CONFIG_KEY);
    supabaseInstance = null;
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Compress an image file using browser Canvas before upload
 * Resizes large smartphone camera photos (e.g. 10MB down to < 300KB)
 */
export async function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    // If it's already an SVG or tiny image, return directly
    if (file.type === 'image/svg+xml' || file.size < 100 * 1024) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => reject(new Error('Failed to read file for compression'));
  });
}
