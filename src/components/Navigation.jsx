import React from 'react';
import { useShoes } from '../context/ShoeContext';
import { Layers, Plus, Grid, Sparkles, CheckCircle2, PackageX } from 'lucide-react';

export default function Navigation() {
  const { activeTab, setActiveTab, setIsUploadOpen, statusCounts } = useShoes();

  return (
    <nav className="sticky bottom-0 z-30 w-full glass-panel border-t border-white/10 px-4 py-2 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {/* Tab 1: Sortir (Swipe Deck) */}
        <button
          onClick={() => setActiveTab('sortir')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 relative ${
            activeTab === 'sortir'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Layers className={`w-6 h-6 transition-transform ${activeTab === 'sortir' ? 'scale-110 text-emerald-400' : ''}`} />
            {statusCounts.belumDisortir > 0 && (
              <span className="absolute -top-1 -right-2.5 min-w-[18px] h-[18px] px-1 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center shadow-lg animate-pulse">
                {statusCounts.belumDisortir}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight">Sortir Swipe</span>
        </button>

        {/* Action Button: Center Floating Upload */}
        <button
          onClick={() => setIsUploadOpen(true)}
          className="relative -top-4 flex flex-col items-center group"
          title="Upload Sepatu Baru"
        >
          <div className="w-13 h-13 p-3.5 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-xl shadow-emerald-500/30 flex items-center justify-center ring-4 ring-slate-950 transform group-hover:scale-110 group-active:scale-95 transition-all duration-200">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-semibold text-emerald-400 mt-0.5 tracking-tight">
            + Upload
          </span>
        </button>

        {/* Tab 2: Daftar Barang */}
        <button
          onClick={() => setActiveTab('koleksi')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 relative ${
            activeTab === 'koleksi'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Grid className={`w-6 h-6 transition-transform ${activeTab === 'koleksi' ? 'scale-110 text-emerald-400' : ''}`} />
            <span className="absolute -top-1 -right-2.5 min-w-[18px] h-[18px] px-1 bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-[10px] rounded-full flex items-center justify-center">
              {statusCounts.total}
            </span>
          </div>
          <span className="text-[11px] mt-1 tracking-tight">Daftar Barang</span>
        </button>
      </div>
    </nav>
  );
}
