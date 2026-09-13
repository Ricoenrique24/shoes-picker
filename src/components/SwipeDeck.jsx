import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useShoes } from '../context/ShoeContext';
import ShoeCard from './ShoeCard';
import {
  RotateCcw,
  Sparkles,
  Trash2,
  Check,
  CheckCircle2,
  Package,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Layers
} from 'lucide-react';

export default function SwipeDeck() {
  const {
    unswipedShoes,
    swipeShoe,
    undoLastSwipe,
    canUndo,
    statusCounts,
    setActiveTab,
    setIsUploadOpen,
    resetSortirStatus,
    loading
  } = useShoes();

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (unswipedShoes.length === 0) return;
      // If typing in input or modal open, don't trigger
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      const topShoe = unswipedShoes[0];
      if (e.key === 'ArrowRight') {
        swipeShoe(topShoe.id, 'masih_dipakai');
      } else if (e.key === 'ArrowLeft') {
        swipeShoe(topShoe.id, 'tidak_dipakai');
      } else if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey || canUndo)) {
        undoLastSwipe();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [unswipedShoes, canUndo, swipeShoe, undoLastSwipe]);

  // Trigger celebration confetti when deck becomes empty
  useEffect(() => {
    if (!loading && unswipedShoes.length === 0 && statusCounts.total > 0) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Ignore if confetti fails in some contexts
      }
    }
  }, [unswipedShoes.length, loading, statusCounts.total]);

  // Loading Skeleton
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center animate-pulse">
          <Layers className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-400">Memuat koleksi sepatu...</p>
      </div>
    );
  }

  // Deck Empty State (All shoes sorted or no shoes exist)
  if (unswipedShoes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto"
      >
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/10">
          <Sparkles className="w-10 h-10 text-emerald-400 animate-bounce" />
        </div>

        <h3 className="text-2xl font-black text-white tracking-tight mb-2">
          {statusCounts.total === 0 ? 'Belum Ada Sepatu' : 'Semua Selesai Disortir! 🎉'}
        </h3>

        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          {statusCounts.total === 0
            ? 'Koleksi sepatu masih kosong. Yuk upload foto sepatu pertamamu atau muat data awal!'
            : 'Kamu telah menyelesaikan sortir seluruh sepatu di lemarimu. Lihat hasilnya bersama kakakmu!'}
        </p>

        {/* Stats breakdown */}
        {statusCounts.total > 0 && (
          <div className="grid grid-cols-2 gap-3 w-full mb-6">
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 text-center">
              <div className="text-2xl font-extrabold text-emerald-400">
                {statusCounts.masihDipakai}
              </div>
              <div className="text-xs font-semibold text-emerald-200/80 flex items-center justify-center gap-1 mt-0.5">
                <Check className="w-3.5 h-3.5" /> Masih Dipakai
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/20 text-center">
              <div className="text-2xl font-extrabold text-rose-400">
                {statusCounts.tidakDipakai}
              </div>
              <div className="text-xs font-semibold text-rose-200/80 flex items-center justify-center gap-1 mt-0.5">
                <Trash2 className="w-3.5 h-3.5" /> Tidak Dipakai
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col w-full gap-2.5">
          <button
            onClick={() => setActiveTab('koleksi')}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
          >
            <span>Buka Daftar Barang</span>
          </button>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-white font-semibold text-sm border border-white/10 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Upload Sepatu Baru</span>
          </button>

          {statusCounts.total > 0 && (
            <button
              onClick={resetSortirStatus}
              className="w-full py-2.5 px-4 text-xs text-slate-400 hover:text-slate-200 transition flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ulangi Sortir Dari Awal</span>
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // Active Tinder Stack
  // We render the top 3 cards for stack elevation
  const visibleCards = unswipedShoes.slice(0, 3);
  const topShoe = visibleCards[0];

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-4 max-w-sm mx-auto w-full">
      {/* Top Counter Bar */}
      <div className="w-full flex items-center justify-between px-2 mb-2">
        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Tersisa: <strong className="text-white">{unswipedShoes.length}</strong> sepatu
        </span>

        <div className="flex items-center space-x-1">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/5">
            Keyboard: ⬅️ ➡️
          </span>
        </div>
      </div>

      {/* Card Deck Area (Relative container with fixed aspect ratio) */}
      <div className="relative w-full aspect-[3/4] max-h-[500px]">
        <AnimatePresence>
          {visibleCards.map((shoe, index) => (
            <ShoeCard
              key={shoe.id}
              shoe={shoe}
              isTop={index === 0}
              cardIndex={index}
              onSwipe={swipeShoe}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Interactive Controls Bar Below Cards */}
      <div className="w-full flex items-center justify-center gap-4 mt-4 pt-1">
        {/* 1. Undo Button */}
        <button
          onClick={undoLastSwipe}
          disabled={!canUndo}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 border ${
            canUndo
              ? 'bg-slate-800/90 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 active:scale-95 shadow-md'
              : 'bg-slate-900/50 text-slate-600 border-white/5 opacity-50 cursor-not-allowed'
          }`}
          title="Kembalikan swipe sebelumnya (Undo)"
        >
          <RotateCcw className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* 2. TIDAK DIPAKAI Button (Left Swipe Action) */}
        <button
          onClick={() => topShoe && swipeShoe(topShoe.id, 'tidak_dipakai')}
          className="w-16 h-16 rounded-full bg-slate-900/90 border-2 border-rose-500/50 hover:border-rose-400 hover:bg-rose-500/20 active:scale-90 text-rose-400 shadow-xl shadow-rose-950 flex flex-col items-center justify-center transition-all group"
          title="Tidak Dipakai (Swipe Kiri)"
        >
          <Trash2 className="w-7 h-7 stroke-[2.5] group-hover:scale-110 transition-transform" />
        </button>

        {/* 3. MASIH DIPAKAI Button (Right Swipe Action) */}
        <button
          onClick={() => topShoe && swipeShoe(topShoe.id, 'masih_dipakai')}
          className="w-16 h-16 rounded-full bg-emerald-500 border-2 border-emerald-300 hover:bg-emerald-400 active:scale-90 text-slate-950 shadow-xl shadow-emerald-500/30 flex flex-col items-center justify-center transition-all group"
          title="Masih Dipakai (Swipe Kanan)"
        >
          <Sparkles className="w-7 h-7 stroke-[2.5] group-hover:scale-110 group-hover:rotate-12 transition-transform" />
        </button>

        {/* 4. Quick Upload Button */}
        <button
          onClick={() => setIsUploadOpen(true)}
          className="w-12 h-12 rounded-full bg-slate-800/90 text-slate-300 border border-white/10 hover:bg-slate-700 active:scale-95 flex items-center justify-center transition shadow-md"
          title="Tambah Sepatu Baru"
        >
          <Plus className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>

      {/* Button labels helper */}
      <div className="flex items-center justify-center gap-6 mt-2 text-[11px] text-slate-400 font-medium">
        <span className="text-rose-400/90">Tidak Dipakai</span>
        <span className="text-emerald-400/90 font-semibold">Masih Dipakai</span>
      </div>
    </div>
  );
}
