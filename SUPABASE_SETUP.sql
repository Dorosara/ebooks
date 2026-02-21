-- Reset schema (optional, be careful in production)
-- drop table if exists public.books;
-- drop table if exists public.profiles;

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text default 'user' check (role in ('admin', 'user')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

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

-- Enable RLS for books
alter table public.books enable row level security;

-- Create policies for books
create policy "Public books are viewable by everyone"
  on public.books for select
  using ( true );

-- Only admins can insert books
create policy "Admins can insert books"
  on public.books for insert
  with check ( 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Only admins can update books
create policy "Admins can update books"
  on public.books for update
  using ( 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Only admins can delete books
create policy "Admins can delete books"
  on public.books for delete
  using ( 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id, 
    new.email, 
    -- Make the specific user 'admin', everyone else 'user'. 
    -- REPLACE 'your_admin_email@example.com' with your actual email if you want to hardcode it here,
    -- OR just manually update the role in the Supabase dashboard after signing up.
    'user' 
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create storage bucket for books
insert into storage.buckets (id, name, public) values ('books', 'books', true)
on conflict (id) do nothing;

-- Storage policies
drop policy if exists "Cover images are publicly accessible" on storage.objects;
create policy "Cover images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'books' );

drop policy if exists "Admins can upload files" on storage.objects;
create policy "Admins can upload files"
  on storage.objects for insert
  with check ( 
    bucket_id = 'books' 
    and auth.role() = 'authenticated'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
