# Supabase Setup Guide

## ✅ What's Done

1. **Supabase Client** - Configured and ready
2. **Template Service** - Full CRUD operations
3. **UI Components** - Save/Load/Delete buttons in editor toolbar
4. **Environment Variables** - Credentials stored in `.env`

## 🚀 Next Steps

### 1. Create the Database Table

Go to your Supabase project SQL Editor and run:

```sql
create table templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  html text,
  css text,
  components jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table templates enable row level security;

-- Allow all operations (you can add auth later)
create policy "Allow all" on templates for all using (true);
```

### 2. Test It Out

1. Start your dev server: `npm run dev`
2. Create an email template in the editor
3. Click **💾 Save** button
4. Enter a name and save
5. Click **📂 Load** to see your saved templates
6. Click **➕ New** to start fresh

## 📦 Features

- **Save** - Save current template (creates new or updates existing)
- **Load** - Browse and load saved templates
- **Delete** - Remove templates you don't need
- **New** - Start a fresh template

## 🔐 Security Notes

- Your `.env` file is gitignored (credentials are safe)
- Current setup allows anyone to read/write (good for development)
- For production, add user authentication and update RLS policies

## 🎯 Future Enhancements

- Add user authentication (Supabase Auth)
- Add template sharing/collaboration
- Add template categories/tags
- Add template preview thumbnails
- Export templates to different formats
