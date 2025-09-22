-- Fix RLS policies for collections table
-- Run this in Supabase SQL Editor

-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can view collections" ON public.collections;
DROP POLICY IF EXISTS "Users can create collections" ON public.collections;
DROP POLICY IF EXISTS "Users can update own collections" ON public.collections;
DROP POLICY IF EXISTS "Users can delete own collections" ON public.collections;

-- Recreate policies with correct syntax
CREATE POLICY "Anyone can view collections" ON public.collections 
  FOR SELECT USING (true);

CREATE POLICY "Users can create collections" ON public.collections 
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own collections" ON public.collections 
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete own collections" ON public.collections 
  FOR DELETE USING (auth.uid() = creator_id);

-- Also fix profiles policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view all profiles" ON public.profiles 
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);
