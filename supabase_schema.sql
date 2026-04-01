-- Rebuild Database Schema for Supabase
-- Run this script in your Supabase SQL Editor

-- 1. Drop existing tables if they exist (Be careful with this in production!)
DROP TABLE IF EXISTS public.pages CASCADE;
DROP TABLE IF EXISTS public.chapters CASCADE;
DROP TABLE IF EXISTS public.series CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.coin_packages CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;

-- 2. Create Tables

-- PROFILES (extends Supabase Auth users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  bio TEXT DEFAULT '',
  "profilePicture" TEXT DEFAULT '',
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'translator', 'proofreader', 'typesetter', 'editor')),
  favorites UUID[] DEFAULT '{}',
  bookmarks UUID[] DEFAULT '{}',
  banned BOOLEAN DEFAULT false,
  coins INTEGER DEFAULT 0,
  "unlockedChapters" UUID[] DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SERIES
CREATE TABLE public.series (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  "coverImage" TEXT NOT NULL,
  "backgroundImage" TEXT,
  status TEXT DEFAULT 'Ongoing' CHECK (status IN ('Ongoing', 'Completed', 'Hiatus', 'Dropped')),
  type TEXT DEFAULT 'Manga' CHECK (type IN ('Manga', 'Manhwa', 'Novel')),
  genres TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  author TEXT DEFAULT '',
  artist TEXT DEFAULT '',
  "releaseYear" INTEGER DEFAULT extract(year from now()),
  rating NUMERIC DEFAULT 0,
  "ratingCount" INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  "dailyViews" INTEGER DEFAULT 0,
  "weeklyViews" INTEGER DEFAULT 0,
  "monthlyViews" INTEGER DEFAULT 0,
  "lastUpdated" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CHAPTERS
CREATE TABLE public.chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "seriesId" UUID REFERENCES public.series(id) ON DELETE CASCADE NOT NULL,
  "chapterNumber" NUMERIC NOT NULL,
  title TEXT DEFAULT '',
  content TEXT[] DEFAULT '{}', -- For novels, this holds text paragraphs. For manga/manhwa, it holds image URLs.
  "pageCount" INTEGER DEFAULT 0,
  "publishDate" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  views INTEGER DEFAULT 0,
  "teamId" UUID, -- References teams table if implemented
  "isPremium" BOOLEAN DEFAULT false,
  "coinPrice" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE("seriesId", "chapterNumber")
);

-- PAGES (Optional: if you want to store pages individually instead of in the chapter's content array)
CREATE TABLE public.pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "chapterId" UUID REFERENCES public.chapters(id) ON DELETE CASCADE NOT NULL,
  "pageNumber" INTEGER NOT NULL,
  content TEXT NOT NULL, -- Image URL or text
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE("chapterId", "pageNumber")
);

-- COMMENTS
CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "seriesId" UUID REFERENCES public.series(id) ON DELETE CASCADE NOT NULL,
  "chapterId" UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  "userId" UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  "userAvatar" TEXT,
  text TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  "parentId" UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  "isFlagged" BOOLEAN DEFAULT false,
  "isSpoiler" BOOLEAN DEFAULT false,
  "imageUrl" TEXT,
  "gifUrl" TEXT,
  reactions JSONB DEFAULT '{}'::jsonb,
  "isPinned" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TRANSACTIONS
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT CHECK (type IN ('purchase', 'unlock_chapter', 'support_creator')),
  description TEXT,
  "chapterId" UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  "seriesId" UUID REFERENCES public.series(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TEAMS
CREATE TABLE public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  members JSONB DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- COIN PACKAGES
CREATE TABLE public.coin_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  coins INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  "bonusCoins" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('chapter', 'reply', 'announcement')),
  read BOOLEAN DEFAULT false,
  link TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- IMPORT SOURCES
CREATE TABLE public.import_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'Website' CHECK (type IN ('Website', 'RSS', 'API')),
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Error')),
  "lastSync" TEXT DEFAULT 'Never',
  cookies TEXT DEFAULT '',
  "userAgent" TEXT DEFAULT 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  "lastUpdated" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- STATIC PAGES
CREATE TABLE public.static_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT DEFAULT '',
  "lastUpdated" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Set up Row Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.static_pages ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Series Policies
CREATE POLICY "Series are viewable by everyone." ON public.series FOR SELECT USING (true);
CREATE POLICY "Admins can insert series." ON public.series FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update series." ON public.series FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can delete series." ON public.series FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Chapters Policies
CREATE POLICY "Chapters are viewable by everyone." ON public.chapters FOR SELECT USING (true);
CREATE POLICY "Admins can insert chapters." ON public.chapters FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update chapters." ON public.chapters FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can delete chapters." ON public.chapters FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Pages Policies
CREATE POLICY "Pages are viewable by everyone." ON public.pages FOR SELECT USING (true);
CREATE POLICY "Admins can insert pages." ON public.pages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update pages." ON public.pages FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can delete pages." ON public.pages FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Comments Policies
CREATE POLICY "Comments are viewable by everyone." ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert comments." ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own comments." ON public.comments FOR UPDATE USING (auth.uid() = "userId");
CREATE POLICY "Users can delete their own comments or admins can delete any." ON public.comments FOR DELETE USING (auth.uid() = "userId" OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Transactions Policies
CREATE POLICY "Users can view their own transactions." ON public.transactions FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "System can insert transactions." ON public.transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated'); -- Adjust based on your payment flow

-- Teams Policies
CREATE POLICY "Teams are viewable by everyone." ON public.teams FOR SELECT USING (true);
CREATE POLICY "Admins can manage teams." ON public.teams FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Coin Packages Policies
CREATE POLICY "Coin packages are viewable by everyone." ON public.coin_packages FOR SELECT USING (true);
CREATE POLICY "Admins can manage coin packages." ON public.coin_packages FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Notifications Policies
CREATE POLICY "Users can view their own notifications." ON public.notifications FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "Users can update their own notifications." ON public.notifications FOR UPDATE USING (auth.uid() = "userId");
CREATE POLICY "System can insert notifications." ON public.notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Import Sources Policies
CREATE POLICY "Admins can manage import sources." ON public.import_sources FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Static Pages Policies
CREATE POLICY "Static pages are viewable by everyone." ON public.static_pages FOR SELECT USING (true);
CREATE POLICY "Admins can manage static pages." ON public.static_pages FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. Create Triggers and Functions (Optional but recommended)

-- Function to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
