import React, { useState } from 'react';
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
  X
} from 'lucide-react';

export default function ShoeList() {
  const {
    shoes,
    statusCounts,
    updateShoeStatus,
    deleteShoe,
    setIsUploadOpen,
    resetSortirStatus,
    restoreDefaultCatalog
  } = useShoes();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'masih_dipakai' | 'tidak_dipakai' | 'belum_disortir'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShoe, setSelectedShoe] = useState(null);

  // Filtered shoes
  const filteredShoes = shoes.filter((shoe) => {
    // Status filter
    if (activeFilter !== 'all' && shoe.status !== activeFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = shoe.name.toLowerCase().includes(q);
      const matchBrand = shoe.brand.toLowerCase().includes(q);
      const matchCategory = (shoe.category || '').toLowerCase().includes(q);
      return matchName || matchBrand || matchCategory;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col p-4 max-w-lg mx-auto w-full pb-20">
      {/* Page Header & Stats Summary */}
      <div className="mb-4">
        <h2 className="text-xl font-black text-white tracking-tight flex items-center justify-between">
          <span>Koleksi Sepatu</span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-white/10">
            {shoes.length} Total
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Lihat status sortir sepatu dan bagikan dengan keluargamu
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3.5">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari sepatu, merek (Nike, Adidas...), kategori..."
          className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-900/80 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Tabs (Horizontal Scrollable on Mobile) */}
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
              className="p-3 rounded-2xl glass-card border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center gap-3.5 group"
            >
              {/* Shoe Thumbnail */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-white/10">
                <img
                  src={shoe.image_url}
                  alt={shoe.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  onError={(e) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80';
                  }}
                />
              </div>

              {/* Shoe Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5">
                    {shoe.brand}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    • {shoe.category}
                  </span>
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
