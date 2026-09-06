-- ==============================================================================
-- ShoesPicker Supabase Database & Storage Setup (Updated with GRANTs)
-- Jalankan skrip ini di SQL Editor Supabase Anda (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Buat Tabel 'shoes' jika belum ada
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

-- 2. Berikan Hak Akses (GRANT) ke role anon dan authenticated (WAJIB di Supabase)
grant usage on schema public to anon, authenticated;
grant all on table public.shoes to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;

-- 3. Aktifkan Row Level Security (RLS) & Berikan Kebijakan Akses Publik
alter table public.shoes enable row level security;

drop policy if exists "Allow public read access" on public.shoes;
create policy "Allow public read access" on public.shoes for select using (true);

drop policy if exists "Allow public insert access" on public.shoes;
create policy "Allow public insert access" on public.shoes for insert with check (true);

drop policy if exists "Allow public update access" on public.shoes;
create policy "Allow public update access" on public.shoes for update using (true) with check (true);

drop policy if exists "Allow public delete access" on public.shoes;
create policy "Allow public delete access" on public.shoes for delete using (true);

-- 4. Siapkan Supabase Storage Bucket untuk Foto Sepatu ('shoe-images')
insert into storage.buckets (id, name, public)
values ('shoe-images', 'shoe-images', true)
on conflict (id) do nothing;

drop policy if exists "Allow public read from shoe-images" on storage.objects;
create policy "Allow public read from shoe-images" on storage.objects for select using (bucket_id = 'shoe-images');

drop policy if exists "Allow public uploads to shoe-images" on storage.objects;
create policy "Allow public uploads to shoe-images" on storage.objects for insert with check (bucket_id = 'shoe-images');

drop policy if exists "Allow public updates to shoe-images" on storage.objects;
create policy "Allow public updates to shoe-images" on storage.objects for update using (bucket_id = 'shoe-images');

drop policy if exists "Allow public delete from shoe-images" on storage.objects;
create policy "Allow public delete from shoe-images" on storage.objects for delete using (bucket_id = 'shoe-images');
