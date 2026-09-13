import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Sparkles, Trash2, Tag, Info, Check, X, Maximize2 } from 'lucide-react';
import { useShoes } from '../context/ShoeContext';

export default function ShoeCard({ shoe, isTop, onSwipe, cardIndex }) {
  const { openZoom } = useShoes();
  const [showDetails, setShowDetails] = useState(false);

  // Framer Motion gesture values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Physics rotation based on horizontal drag
  const rotate = useTransform(x, [-250, 0, 250], [-16, 0, 16]);

  // Stamp Opacity
  // Green "MASIH DIPAKAI" appears when swiping RIGHT (> 30px)
  const likeOpacity = useTransform(x, [30, 120], [0, 1]);
  // Red/Orange "TIDAK DIPAKAI" appears when swiping LEFT (< -30px)
  const dislikeOpacity = useTransform(x, [-120, -30], [1, 0]);

  // Card scaling and stacking depth
  // Top card: scale 1, y 0
  // Next card: scale 0.95, y 12
  // Third card: scale 0.90, y 24
  const scale = cardIndex === 0 ? 1 : cardIndex === 1 ? 0.95 : 0.90;
  const translateY = cardIndex === 0 ? 0 : cardIndex === 1 ? 12 : 24;

  const handleDragEnd = (_, info) => {
    const swipeThreshold = 100;
    const velocityThreshold = 400;

    if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      onSwipe(shoe.id, 'masih_dipakai');
    } else if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      onSwipe(shoe.id, 'tidak_dipakai');
    }
  };

  return (
    <motion.div
      style={{
        x: isTop ? x : 0,
        y: isTop ? y : translateY,
        rotate: isTop ? rotate : 0,
        scale: scale,
        zIndex: 10 - cardIndex,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.8}
      onDragEnd={isTop ? handleDragEnd : undefined}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: scale, opacity: 1, y: translateY }}
      exit={{
        x: x.get() > 0 ? 400 : -400,
        opacity: 0,
        rotate: x.get() > 0 ? 25 : -25,
        transition: { duration: 0.25, ease: 'easeOut' }
      }}
      className={`absolute inset-0 w-full h-full rounded-3xl overflow-hidden shadow-2xl select-none touch-none cursor-grab active:cursor-grabbing border border-white/10 bg-slate-900 ${
        isTop ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Background Shoe Image */}
      <div className="relative w-full h-full">
        <img
          src={shoe.image_url}
          alt={shoe.name}
          loading="eager"
          className="w-full h-full object-cover object-center pointer-events-none transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            // Fallback image if broken
            e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80';
          }}
        />

        {/* Dark Gradient Vignette for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/20 pointer-events-none" />

        {/* Top Badges & Zoom Trigger */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 flex-wrap pointer-events-none">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-md">
              {shoe.brand}
            </span>
            {shoe.owner_tag && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-600/85 backdrop-blur-md text-purple-100 border border-purple-400/40 shadow-md flex items-center gap-1">
                <Tag className="w-3 h-3 text-purple-200" />
                {shoe.owner_tag}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
              {shoe.category}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openZoom(shoe);
              }}
              className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-slate-200 hover:text-white border border-white/20 shadow-md transition active:scale-90"
              title="Perbesar Foto (Zoom)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SWIPE STAMPS (Tinder Indicators) */}
        {isTop && (
          <>
            {/* Green "MASIH DIPAKAI" Stamp (Right Swipe) */}
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-12 left-6 z-20 pointer-events-none transform -rotate-12 border-4 border-emerald-400 bg-emerald-500/30 backdrop-blur-md text-emerald-300 px-4 py-2 rounded-2xl font-black text-xl tracking-wider shadow-2xl flex items-center space-x-1.5"
            >
              <Sparkles className="w-6 h-6 text-emerald-300 stroke-[3]" />
              <span>MASIH DIPAKAI</span>
            </motion.div>

            {/* Red "TIDAK DIPAKAI" Stamp (Left Swipe) */}
            <motion.div
              style={{ opacity: dislikeOpacity }}
              className="absolute top-12 right-6 z-20 pointer-events-none transform rotate-12 border-4 border-rose-500 bg-rose-500/30 backdrop-blur-md text-rose-300 px-4 py-2 rounded-2xl font-black text-xl tracking-wider shadow-2xl flex items-center space-x-1.5"
            >
              <Trash2 className="w-6 h-6 text-rose-300 stroke-[3]" />
              <span>TIDAK DIPAKAI</span>
            </motion.div>
          </>
        )}

        {/* Shoe Information at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white z-10">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h2 className="text-2xl font-black leading-tight tracking-tight drop-shadow-md text-slate-50">
              {shoe.name}
            </h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(!showDetails);
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition pointer-events-auto"
              title="Lihat detail"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          {shoe.notes && (
            <p className="text-xs text-slate-300 line-clamp-2 mb-2 font-medium">
              {shoe.notes}
            </p>
          )}

          {/* Details Drawer if opened */}
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-lg border border-white/15 text-xs text-slate-200 space-y-2 pointer-events-auto shadow-2xl"
            >
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span className="text-slate-400">Brand / Merek:</span>
                <span className="font-semibold text-white">{shoe.brand}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span className="text-slate-400">Kategori:</span>
                <span className="font-semibold text-emerald-400">{shoe.category}</span>
              </div>
              {shoe.owner_tag && (
                <div className="flex justify-between border-b border-white/10 pb-1.5">
                  <span className="text-slate-400">Pemilik (Nametag):</span>
                  <span className="font-bold text-purple-300">{shoe.owner_tag}</span>
                </div>
              )}
              <div className="flex justify-between pb-0.5">
                <span className="text-slate-400">Keterangan:</span>
                <span className="font-medium text-right text-slate-200">{shoe.notes || '-'}</span>
              </div>
            </motion.div>
          )}

          {/* Swipe Hint Pills */}
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span className="flex items-center text-rose-400/90 gap-1">
              👈 Geser kiri: Tidak Dipakai
            </span>
            <span className="flex items-center text-emerald-400/90 gap-1">
              Geser kanan: Masih Dipakai 👉
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
