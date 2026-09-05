-- ==============================================================================
-- ShoesPicker Supabase Database & Storage Setup
-- Jalankan skrip ini di SQL Editor Supabase Anda (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Buat Tabel 'shoes'
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

-- 2. Aktifkan Row Level Security (RLS) & Berikan Kebijakan Akses Publik
-- Memungkinkan Anda dan Kakak membaca, menambah, dan mengupdate status tanpa login rumit
alter table public.shoes enable row level security;

create policy "Allow public read access"
  on public.shoes for select
  using (true);

create policy "Allow public insert access"
  on public.shoes for insert
  with check (true);

create policy "Allow public update access"
  on public.shoes for update
  using (true)
  with check (true);

create policy "Allow public delete access"
  on public.shoes for delete
  using (true);

-- 3. Siapkan Supabase Storage Bucket untuk Foto Sepatu ('shoe-images')
insert into storage.buckets (id, name, public)
values ('shoe-images', 'shoe-images', true)
on conflict (id) do nothing;

create policy "Allow public read from shoe-images"
  on storage.objects for select
  using (bucket_id = 'shoe-images');

create policy "Allow public uploads to shoe-images"
  on storage.objects for insert
  with check (bucket_id = 'shoe-images');

create policy "Allow public updates to shoe-images"
  on storage.objects for update
  using (bucket_id = 'shoe-images');

create policy "Allow public delete from shoe-images"
  on storage.objects for delete
  using (bucket_id = 'shoe-images');
