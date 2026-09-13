import React from 'react';
import { ShoeProvider, useShoes } from './context/ShoeContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import SwipeDeck from './components/SwipeDeck';
import ShoeList from './components/ShoeList';
import UploadModal from './components/UploadModal';
import CloudConfigModal from './components/CloudConfigModal';
import ImageZoomModal from './components/ImageZoomModal';

function MainApp() {
  const { activeTab } = useShoes();

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-start overflow-x-hidden">
      {/* Background ambient lighting for desktop luxury feel */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl" />
      </div>

      {/* 
        Mobile-First Frame Container:
        - Mobile screens: Full width & height, native phone experience
        - Desktop screens: Centered sleek smartphone frame with subtle glass shadow
      */}
      <div className="relative z-10 w-full max-w-md sm:my-6 min-h-screen sm:min-h-[840px] sm:max-h-[920px] bg-slate-950 sm:rounded-[36px] sm:border sm:border-white/10 sm:shadow-phone flex flex-col overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto overscroll-contain relative">
          {activeTab === 'sortir' && <SwipeDeck />}
          {activeTab === 'koleksi' && <ShoeList />}
        </main>

        {/* Bottom Navigation Bar */}
        <Navigation />

        {/* Modals */}
        <UploadModal />
        <CloudConfigModal />
        <ImageZoomModal />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ShoeProvider>
      <MainApp />
    </ShoeProvider>
  );
}
