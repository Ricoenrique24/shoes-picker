import React from 'react';
import { useShoes } from '../context/ShoeContext';
import { Cloud, Database, RefreshCw, Sparkles, Smartphone } from 'lucide-react';

export default function Header() {
  const { isCloud, setIsCloudModalOpen, refreshShoes, loading, statusCounts } = useShoes();

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/10 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-2 ring-white/20">
            <span className="text-xl">👟</span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
                ShoesPicker
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Sortir Sepatu Impian
            </p>
          </div>
        </div>

        {/* Right Actions: Cloud status & Refresh */}
        <div className="flex items-center space-x-2">
          {/* Cloud Status Pill */}
          <button
            onClick={() => setIsCloudModalOpen(true)}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
              isCloud
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60 shadow-sm shadow-emerald-950'
                : 'bg-slate-800/80 text-sky-300 border-sky-500/30 hover:bg-slate-800'
            }`}
            title="Klik untuk melihat konfigurasi Database Cloud (Supabase)"
          >
            {isCloud ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Cloud className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cloud Synced</span>
                <span className="sm:hidden">Cloud</span>
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Lokal Demo</span>
                <span className="sm:hidden">Lokal</span>
              </>
            )}
          </button>

          {/* Refresh Button */}
          <button
            onClick={refreshShoes}
            disabled={loading}
            className="p-2 rounded-full bg-slate-800/70 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-700 transition disabled:opacity-50 active:scale-95"
            title="Muat ulang data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
