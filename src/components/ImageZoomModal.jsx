import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShoes } from '../context/ShoeContext';
import { ZoomIn, ZoomOut, RotateCcw, X, Tag, Maximize2 } from 'lucide-react';

export default function ImageZoomModal() {
  const { zoomImage, closeZoom } = useShoes();
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Reset zoom & position whenever a new image is opened
  useEffect(() => {
    if (zoomImage) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [zoomImage]);

  // Keyboard navigation (Escape to close, + to zoom in, - to zoom out)
  useEffect(() => {
    if (!zoomImage) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeZoom();
      } else if (e.key === '+' || e.key === '=') {
        setScale((prev) => Math.min(prev + 0.5, 4));
      } else if (e.key === '-') {
        setScale((prev) => {
          const next = Math.max(prev - 0.5, 1);
          if (next === 1) setPosition({ x: 0, y: 0 });
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomImage, closeZoom]);

  if (!zoomImage) return null;

  const handleZoomIn = (e) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleReset = (e) => {
    e.stopPropagation();
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Double click / tap to toggle zoom
  const handleDoubleTap = (e) => {
    e.stopPropagation();
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2);
    }
  };

  // Drag pan handlers when zoomed
  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag handlers
  const handleTouchStart = (e) => {
    if (scale <= 1 || e.touches.length !== 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y
    };
  };

  const handleTouchMove = (e) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStartRef.current.x,
      y: e.touches[0].clientY - dragStartRef.current.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeZoom}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 backdrop-blur-xl p-4 select-none touch-none"
      >
        {/* Top Control Bar */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg flex items-center justify-between z-20 pt-2"
        >
          {/* Zoom Level Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              {Math.round(scale * 100)}%
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              (Ketuk 2x atau scroll untuk zoom)
            </span>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-white/15 p-1 rounded-2xl shadow-xl">
            <button
              onClick={handleZoomIn}
              disabled={scale >= 4}
              className="p-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 active:scale-95 disabled:opacity-40 transition"
              title="Perbesar (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              onClick={handleZoomOut}
              disabled={scale <= 1}
              className="p-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 active:scale-95 disabled:opacity-40 transition"
              title="Perkecil (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 active:scale-95 transition"
              title="Reset Ukuran (1:1)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-white/15 mx-0.5" />

            <button
              onClick={closeZoom}
              className="p-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white active:scale-95 transition"
              title="Tutup (Esc)"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Central Viewport with Pan / Zoom */}
        <div
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={handleDoubleTap}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`relative flex-1 w-full max-w-lg flex items-center justify-center overflow-hidden my-auto ${
            scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
          }`}
        >
          <motion.img
            src={zoomImage.url}
            alt={zoomImage.name || 'Foto Sepatu'}
            animate={{
              scale: scale,
              x: position.x,
              y: position.y
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="max-w-full max-h-[72vh] object-contain rounded-2xl shadow-2xl pointer-events-none"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80';
            }}
          />
        </div>

        {/* Bottom Caption Information */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-white/15 rounded-2xl p-3.5 z-20 shadow-2xl flex items-center justify-between gap-3"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              {zoomImage.owner_tag && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {zoomImage.owner_tag}
                </span>
              )}
              {zoomImage.brand && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {zoomImage.brand}
                </span>
              )}
            </div>
            <h3 className="font-extrabold text-sm text-white truncate">
              {zoomImage.name}
            </h3>
            {zoomImage.notes && (
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {zoomImage.notes}
              </p>
            )}
          </div>

          <button
            onClick={closeZoom}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-white/10 shrink-0 transition active:scale-95"
          >
            Selesai
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
