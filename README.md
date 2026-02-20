# Lumina Books

A professional ebook selling platform built with React, Tailwind CSS, and Supabase.

## Setup Instructions

### 1. Supabase Configuration

1.  Create a new project at [Supabase](https://supabase.com).
2.  Go to **Project Settings > API** and copy your `URL` and `anon` public key.
3.  Update the `.env` file (or create one based on `.env.example`) with these values:

    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

### 2. Database Setup

1.  Go to the **SQL Editor** in your Supabase dashboard.
2.  Copy the contents of `SUPABASE_SETUP.sql` from this project.
3.  Paste it into the SQL Editor and run it. This will:
    *   Create the `books` table.
    *   Set up Row Level Security (RLS) policies.
    *   Create a storage bucket named `books` for covers and files.

### 3. Authentication

1.  Go to **Authentication > Providers** in Supabase.
2.  Enable **Email** provider (it's usually enabled by default).
3.  (Optional) Enable Google or other providers if you wish to use them.

## Features

*   **Storefront**: Browse and search for ebooks.
*   **Book Details**: View book info and "buy" (demo mode).
*   **Admin Dashboard**: Upload new books (requires login).
*   **Responsive Design**: Works on mobile and desktop.
