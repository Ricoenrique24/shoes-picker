import React, { useState, useRef } from 'react';
import { useShoes } from '../context/ShoeContext';
import { X, Upload, Camera, Image as ImageIcon, Sparkles, Check, AlertCircle } from 'lucide-react';

const POPULAR_BRANDS = ['Nike', 'Adidas', 'New Balance', 'Converse', 'Jordan', 'Vans', 'Puma', 'Salomon'];
const CATEGORIES = ['Sneakers', 'Casual', 'Running', 'Formal', 'Sandal', 'Boots', 'Lainnya'];

export default function UploadModal() {
  const { isUploadOpen, setIsUploadOpen, addNewShoe, setActiveTab, isCloud } = useShoes();

  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Nike');
  const [category, setCategory] = useState('Sneakers');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isUploadOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith('image/')) {
      setErrorMsg('Harap pilih file gambar (JPG, PNG, WebP)');
      return;
    }

    setErrorMsg('');
    setFile(selected);
    const objectUrl = URL.createObjectURL(selected);
    setPreviewUrl(objectUrl);
  };

  const handleRemovePhoto = () => {
    setFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama sepatu wajib diisi!');
      return;
    }
    if (!file && !previewUrl) {
      setErrorMsg('Harap pilih atau ambil foto sepatu terlebih dahulu!');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await addNewShoe({
        name,
        brand,
        category,
        notes,
        file: file,
        imageUrl: previewUrl
      });

      // Close modal and switch directly to Swipe Deck so user can swipe their new shoe
      setIsUploadOpen(false);
      setActiveTab('sortir');

      // Reset form
      setFile(null);
      setPreviewUrl('');
      setName('');
      setNotes('');
    } catch (err) {
      console.error('Error submitting shoe:', err);
      setErrorMsg('Terjadi kesalahan saat menyimpan sepatu. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-white/15 rounded-3xl p-5 shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight">
                Upload Sepatu Baru
              </h3>
              <p className="text-[11px] text-slate-400">
                {isCloud ? 'Akan tersinkron ke Supabase & terlihat oleh Kakak' : 'Akan tersimpan di koleksi lokal'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsUploadOpen(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Dropzone / Camera Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Foto Sepatu <span className="text-emerald-400">*</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-slate-950 group">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-semibold hover:bg-slate-800"
                  >
                    Ganti Foto
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[16/9] rounded-2xl border-2 border-dashed border-white/20 hover:border-emerald-500/60 bg-slate-950/50 hover:bg-slate-950 flex flex-col items-center justify-center cursor-pointer transition p-4 text-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 transition">
                  <Camera className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-white mb-0.5">
                  Klik untuk Ambil Foto atau Buka Galeri
                </p>
                <p className="text-[10px] text-slate-400">
                  Dukung format JPG, PNG, WebP (Otomatis dikompres)
                </p>
              </div>
            )}
          </div>

          {/* Shoe Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama Model Sepatu <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Nike Air Jordan 1 Low Grey"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Brand Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Brand / Merk
            </label>
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {POPULAR_BRANDS.map((b) => (
                <button
                  type="button"
                  key={b}
                  onClick={() => setBrand(b)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    brand === b
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-850 bg-slate-800/80 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Atau ketik merk lain..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Kategori Sepatu
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-medium text-center transition ${
                    category === c
                      ? 'bg-slate-200 text-slate-950 font-bold'
                      : 'bg-slate-800/70 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Catatan Kondisi / Keterangan (Opsional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Kondisi 9/10, jarang dipakai, sol masih tebal..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan Sepatu...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Tambahkan ke Sortir Sepatu</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
