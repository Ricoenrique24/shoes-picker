import React, { useState, useRef, useEffect } from 'react';
import { useShoes } from '../context/ShoeContext';
import {
  Search,
  Sparkles,
  Trash2,
  Clock,
  CheckCircle2,
  RotateCcw,
  SlidersHorizontal,
  Plus,
  ChevronDown,
  X,
  Maximize2,
  Tag
} from 'lucide-react';

export default function ShoeList() {
  const {
    shoes,
    statusCounts,
    updateShoeStatus,
    updateShoeTag,
    deleteShoe,
    setIsUploadOpen,
    resetSortirStatus,
    restoreDefaultCatalog,
    openZoom,
    customTags
  } = useShoes();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'masih_dipakai' | 'tidak_dipakai' | 'belum_disortir'
  const [selectedOwnerTag, setSelectedOwnerTag] = useState('all'); // 'all' | '#PunyaKakak' | ...
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTagId, setEditingTagId] = useState(null);
  const searchInputRef = useRef(null);

  // Auto-focus search input when opening Daftar Barang
  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Quick keyboard shortcut: press "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered shoes based on status, owner tag, and search query
  const filteredShoes = shoes.filter((shoe) => {
    // Status filter
    if (activeFilter !== 'all' && shoe.status !== activeFilter) {
      return false;
    }
    // Owner Nametag filter
    if (selectedOwnerTag !== 'all' && shoe.owner_tag !== selectedOwnerTag) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = shoe.name.toLowerCase().includes(q);
      const matchBrand = shoe.brand.toLowerCase().includes(q);
      const matchCategory = (shoe.category || '').toLowerCase().includes(q);
      const matchTag = (shoe.owner_tag || '').toLowerCase().includes(q);
      return matchName || matchBrand || matchCategory || matchTag;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col p-4 max-w-lg mx-auto w-full pb-32">
      {/* Page Header & Stats Summary */}
      <div className="mb-4">
        <h2 className="text-xl font-black text-white tracking-tight flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span>Daftar Barang</span>
          </span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {shoes.length} Total Barang
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Kelola status sortir barang dan pemiliknya (#PunyaKakak, #PunyaMama, #PunyaAdek, dll.)
        </p>
      </div>

      {/* Search Bar with Focused Guidance & Shortcut */}
      <div className="relative mb-2.5">
        <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Cari nama barang (cth: Jordan, Samba), merk, atau #PunyaAdek..."
          className="w-full pl-10 pr-16 py-2.5 rounded-2xl bg-slate-900/90 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 shadow-inner transition"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-white/10 rounded">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Owner Nametag Filter Chips (#PunyaKakak, #PunyaMama, dll) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-2.5">
        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
          <Tag className="w-3 h-3 text-purple-400" />
          Pemilik:
        </span>
        <button
          onClick={() => setSelectedOwnerTag('all')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            selectedOwnerTag === 'all'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-slate-850 bg-slate-800/60 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          Semua
        </button>

        {customTags?.map((tag) => {
          const count = shoes.filter((s) => s.owner_tag === tag).length;
          return (
            <button
              key={tag}
              onClick={() => setSelectedOwnerTag(selectedOwnerTag === tag ? 'all' : tag)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition-all ${
                selectedOwnerTag === tag
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30 ring-1 ring-purple-300'
                  : 'bg-purple-950/40 text-purple-300 border border-purple-500/25 hover:bg-purple-900/40'
              }`}
            >
              <span>{tag}</span>
              <span className="text-[10px] opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Status Filter Tabs (Semua, Masih Dipakai, Tidak Dipakai, Belum) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeFilter === 'all'
              ? 'bg-slate-200 text-slate-950 shadow-md'
              : 'bg-slate-850 bg-slate-800/60 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          Semua ({statusCounts.total})
        </button>

        <button
          onClick={() => setActiveFilter('masih_dipakai')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeFilter === 'masih_dipakai'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
              : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/40'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Masih Dipakai ({statusCounts.masihDipakai})
        </button>

        <button
          onClick={() => setActiveFilter('tidak_dipakai')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeFilter === 'tidak_dipakai'
              ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20'
              : 'bg-rose-950/40 text-rose-300 border border-rose-500/30 hover:bg-rose-900/40'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Tidak Dipakai ({statusCounts.tidakDipakai})
        </button>

        <button
          onClick={() => setActiveFilter('belum_disortir')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeFilter === 'belum_disortir'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Belum ({statusCounts.belumDisortir})
        </button>
      </div>

      {/* Shoes Grid / List */}
      {filteredShoes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center glass-card rounded-3xl my-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-3 text-2xl">
            👟
          </div>
          <h4 className="font-bold text-base text-white mb-1">Tidak ada sepatu ditemukan</h4>
          <p className="text-xs text-slate-400 max-w-xs mb-4">
            {searchQuery
              ? `Tidak ada hasil untuk pencarian "${searchQuery}"`
              : 'Belum ada sepatu di kategori filter ini.'}
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-3.5 h-3.5" /> Upload Sepatu Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredShoes.map((shoe) => (
            <div
              key={shoe.id}
              className={`p-3 rounded-2xl glass-card border transition-all duration-200 flex items-center gap-3.5 group relative ${
                editingTagId === shoe.id
                  ? 'z-40 border-purple-500/50 shadow-xl shadow-purple-950/40 ring-1 ring-purple-500/30'
                  : 'z-0 border-white/10 hover:border-white/20'
              }`}
            >
              {/* Shoe Thumbnail with Zoom */}
              <div
                onClick={() => openZoom(shoe)}
                className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-white/10 cursor-pointer group/thumb shadow-md"
                title="Klik untuk melihat foto lebih besar (Zoom)"
              >
                <img
                  src={shoe.image_url}
                  alt={shoe.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover/thumb:scale-110 transition duration-300"
                  onError={(e) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition flex items-center justify-center">
                  <Maximize2 className="w-5 h-5 text-white drop-shadow-md" />
                </div>
              </div>

              {/* Shoe Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5">
                    {shoe.brand}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    • {shoe.category}
                  </span>

                  {/* Nametag chip with quick ownership switch */}
                  {shoe.owner_tag && (
                    <div className="relative inline-block ml-auto">
                      <button
                        type="button"
                        onClick={() => setEditingTagId(editingTagId === shoe.id ? null : shoe.id)}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 hover:bg-purple-500/35 text-purple-300 border border-purple-500/30 flex items-center gap-1 transition"
                        title="Klik untuk mengganti pemilik nametag"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        <span>{shoe.owner_tag}</span>
                        <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                      </button>

                      {/* Quick Tag Changer Popover */}
                      {editingTagId === shoe.id && (
                        <>
                          {/* Invisible backdrop to dismiss popover when clicking outside */}
                          <div
                            className="fixed inset-0 z-30 cursor-default"
                            onClick={() => setEditingTagId(null)}
                          />

                          <div className="absolute right-0 top-full mt-1.5 z-40 bg-slate-900/95 backdrop-blur-xl border border-purple-500/40 rounded-2xl p-2 shadow-2xl shadow-black/80 min-w-[160px] max-h-52 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-purple-500/40 animate-in fade-in zoom-in-95">
                            <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider px-2 py-1 border-b border-white/10 mb-1.5 flex items-center justify-between">
                              <span>Ganti Pemilik:</span>
                              <span className="text-[9px] text-slate-500 lowercase">(scroll)</span>
                            </div>
                            <div className="space-y-1">
                              {customTags?.map((tag) => (
                                <button
                                  key={tag}
                                  onClick={() => {
                                    updateShoeTag(shoe.id, tag);
                                    setEditingTagId(null);
                                  }}
                                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                                    shoe.owner_tag === tag
                                      ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                                  }`}
                                >
                                  <span className="truncate">{tag}</span>
                                  {shoe.owner_tag === tag && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 ml-1.5" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <h4 className="font-bold text-sm text-white truncate leading-tight mb-1">
                  {shoe.name}
                </h4>

                {shoe.notes && (
                  <p className="text-[11px] text-slate-400 truncate mb-1.5">
                    {shoe.notes}
                  </p>
                )}

                {/* Status Switcher Controls */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <button
                    onClick={() => updateShoeStatus(shoe.id, 'masih_dipakai')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                      shoe.status === 'masih_dipakai'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                        : 'bg-slate-800/80 text-slate-400 hover:text-emerald-400 border border-white/5'
                    }`}
                    title="Ubah status ke Masih Dipakai"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Masih Dipakai</span>
                  </button>

                  <button
                    onClick={() => updateShoeStatus(shoe.id, 'tidak_dipakai')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                      shoe.status === 'tidak_dipakai'
                        ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                        : 'bg-slate-800/80 text-slate-400 hover:text-rose-400 border border-white/5'
                    }`}
                    title="Ubah status ke Tidak Dipakai"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Tidak Dipakai</span>
                  </button>

                  <button
                    onClick={() => deleteShoe(shoe.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition ml-auto"
                    title="Hapus sepatu ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Utility Actions */}
      <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <button
          onClick={resetSortirStatus}
          className="hover:text-white flex items-center gap-1.5 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Ulangi Semua Sortir</span>
        </button>

        <button
          onClick={restoreDefaultCatalog}
          className="hover:text-amber-400 flex items-center gap-1.5 transition"
        >
          <span>Pulihkan 8 Sepatu Bawaan</span>
        </button>
      </div>
    </div>
  );
}
