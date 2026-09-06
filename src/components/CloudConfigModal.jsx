import React, { useState, useEffect } from 'react';
import { useShoes } from '../context/ShoeContext';
import {
  getSupabaseCredentials,
  saveCustomSupabaseConfig,
  clearCustomSupabaseConfig
} from '../lib/supabase';
import { Cloud, Check, Copy, AlertCircle, Database, ExternalLink, X, ShieldCheck } from 'lucide-react';

export default function CloudConfigModal() {
  const { isCloudModalOpen, setIsCloudModalOpen, isCloud, refreshShoes } = useShoes();

  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [source, setSource] = useState('none');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isCloudModalOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url || '');
      setKey(creds.key || '');
      setSource(creds.source);
      setSavedSuccess(false);
    }
  }, [isCloudModalOpen]);

  if (!isCloudModalOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (url.trim() && key.trim()) {
      saveCustomSupabaseConfig(url.trim(), key.trim());
      setSavedSuccess(true);
      setTimeout(() => {
        refreshShoes();
        setIsCloudModalOpen(false);
      }, 1000);
    }
  };

  const handleResetToLocal = () => {
    clearCustomSupabaseConfig();
    setUrl('');
    setKey('');
    setSource('none');
    refreshShoes();
  };

  const copySqlSchema = () => {
    const sql = `-- Script Setup Supabase untuk ShoesPicker
create table if not exists public.shoes (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  brand text not null,
  category text default 'Sneakers',
  image_url text not null,
  status text check (status in ('belum_disortir', 'masih_dipakai', 'tidak_dipakai')) default 'belum_disortir',
  notes text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Hak Akses (GRANT) ke role anon dan authenticated (Wajib di Supabase)
grant usage on schema public to anon, authenticated;
grant all on table public.shoes to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;

-- 3. Row Level Security Policies
alter table public.shoes enable row level security;
drop policy if exists "Allow public read access" on public.shoes;
create policy "Allow public read access" on public.shoes for select using (true);
drop policy if exists "Allow public insert access" on public.shoes;
create policy "Allow public insert access" on public.shoes for insert with check (true);
drop policy if exists "Allow public update access" on public.shoes;
create policy "Allow public update access" on public.shoes for update using (true) with check (true);
drop policy if exists "Allow public delete access" on public.shoes;
create policy "Allow public delete access" on public.shoes for delete using (true);

-- 4. Storage Bucket & Policies
insert into storage.buckets (id, name, public) values ('shoe-images', 'shoe-images', true) on conflict (id) do nothing;
drop policy if exists "Allow public read from shoe-images" on storage.objects;
create policy "Allow public read from shoe-images" on storage.objects for select using (bucket_id = 'shoe-images');
drop policy if exists "Allow public uploads to shoe-images" on storage.objects;
create policy "Allow public uploads to shoe-images" on storage.objects for insert with check (bucket_id = 'shoe-images');
`;
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-white/15 rounded-3xl p-5 shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isCloud ? 'bg-emerald-500/20 text-emerald-400' : 'bg-sky-500/20 text-sky-400'
            }`}>
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight">
                Sinkronisasi Cloud Supabase
              </h3>
              <p className="text-[11px] text-slate-400">
                Akses bersama untuk Anda & Kakak
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCloudModalOpen(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status banner */}
        <div className={`p-3.5 rounded-2xl mb-4 border text-xs flex items-start gap-2.5 ${
          isCloud
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
            : 'bg-sky-950/40 border-sky-500/30 text-sky-200'
        }`}>
          {isCloud ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-white mb-0.5">
                  Terhubung ke Database Cloud!
                </strong>
                Data sepatu dan foto tersinkron secara real-time. Siapapun yang membuka web ini dapat melihat daftar yang sama.
              </div>
            </>
          ) : (
            <>
              <Database className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-white mb-0.5">
                  Berjalan di Mode Lokal Demo
                </strong>
                Data disimpan di browser Anda saat ini. Untuk berbagi data dengan kakak di HP lain, hubungkan ke akun Supabase gratis di bawah ini.
              </div>
            </>
          )}
        </div>

        {/* Form Config */}
        <form onSubmit={handleSave} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Supabase Project URL
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Supabase Anon Public Key
            </label>
            <textarea
              rows={2}
              required
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white font-mono text-[11px] placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold text-center flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Koneksi berhasil disimpan! Memuat ulang...</span>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 transition"
            >
              Simpan & Hubungkan
            </button>

            {source === 'localStorage' && (
              <button
                type="button"
                onClick={handleResetToLocal}
                className="px-3 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-white/10"
              >
                Reset
              </button>
            )}
          </div>
        </form>

        {/* Copy SQL Schema Helper */}
        <div className="mt-5 pt-4 border-t border-white/10 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-300">
              Belum buat tabel di Supabase?
            </span>
            <button
              onClick={copySqlSchema}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold flex items-center gap-1 border border-emerald-500/20 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Copy SQL Schema'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Copy script SQL di atas, lalu paste di <strong>SQL Editor</strong> di dashboard{' '}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 underline inline-flex items-center gap-0.5"
            >
              supabase.com <ExternalLink className="w-2.5 h-2.5" />
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
