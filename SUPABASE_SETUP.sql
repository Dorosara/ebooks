-- Create the books table
create table public.books (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  author text not null,
  description text not null,
  price decimal(10, 2) not null,
  cover_url text,
  file_url text,
  user_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.books enable row level security;

-- Create policies
create policy "Public books are viewable by everyone"
  on public.books for select
  using ( true );

create policy "Users can insert their own books"
  on public.books for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own books"
  on public.books for update
  using ( auth.uid() = user_id );

-- Create storage bucket for books
insert into storage.buckets (id, name, public) values ('books', 'books', true);

-- Storage policies
create policy "Cover images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'books' );

create policy "Authenticated users can upload files"
  on storage.objects for insert
  with check ( bucket_id = 'books' and auth.role() = 'authenticated' );
