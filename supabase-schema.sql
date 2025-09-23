-- Supabase Database Schema for Nexora NFT Platform
-- Run these in Supabase Dashboard → SQL Editor

-- Note: Do NOT alter auth.users; it's a system table and managed by Supabase.
-- RLS is already configured by Supabase for auth schema.

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  twitter TEXT,
  instagram TEXT,
  crypto_wallet_address TEXT,
  preferred_payment_method TEXT,
  is_kyc_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Collections table
CREATE TABLE public.collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  banner_url TEXT,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  contract_address TEXT,
  symbol TEXT,
  total_supply INTEGER DEFAULT 0,
  mint_price DECIMAL(18,8) DEFAULT 0,
  royalty_percentage DECIMAL(5,2) DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for collections
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Collections policies
CREATE POLICY "Anyone can view collections" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Users can create collections" ON public.collections FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update own collections" ON public.collections FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Users can delete own collections" ON public.collections FOR DELETE USING (auth.uid() = creator_id);

-- NFTs table
CREATE TABLE public.nfts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE NOT NULL,
  token_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  metadata_url TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  price DECIMAL(18,8),
  is_listed BOOLEAN DEFAULT false,
  is_sold BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, token_id)
);

-- Enable RLS for NFTs
ALTER TABLE public.nfts ENABLE ROW LEVEL SECURITY;

-- NFTs policies
CREATE POLICY "Anyone can view NFTs" ON public.nfts FOR SELECT USING (true);
CREATE POLICY "Users can create NFTs" ON public.nfts FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update own NFTs" ON public.nfts FOR UPDATE USING (auth.uid() = creator_id OR auth.uid() = owner_id);
CREATE POLICY "Users can delete own NFTs" ON public.nfts FOR DELETE USING (auth.uid() = creator_id);

-- Sales table (for tracking transactions)
CREATE TABLE public.sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nft_id UUID REFERENCES public.nfts(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  price DECIMAL(18,8) NOT NULL,
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for sales
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Sales policies
CREATE POLICY "Anyone can view sales" ON public.sales FOR SELECT USING (true);
CREATE POLICY "Users can create sales" ON public.sales FOR INSERT WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Favorites table
CREATE TABLE public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nft_id UUID REFERENCES public.nfts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, nft_id)
);

-- Enable RLS for favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- Function to automatically create profile on user signup
-- Note: This trigger needs to be created via Supabase Dashboard → Database → Functions
-- Or use the Supabase CLI with proper permissions

-- For now, we'll create profiles manually or via API calls
-- The trigger can be added later with proper admin access

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_nfts_updated_at BEFORE UPDATE ON public.nfts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for better performance
CREATE INDEX idx_collections_creator_id ON public.collections(creator_id);
CREATE INDEX idx_collections_created_at ON public.collections(created_at DESC);
CREATE INDEX idx_nfts_collection_id ON public.nfts(collection_id);
CREATE INDEX idx_nfts_owner_id ON public.nfts(owner_id);
CREATE INDEX idx_nfts_creator_id ON public.nfts(creator_id);
CREATE INDEX idx_nfts_is_listed ON public.nfts(is_listed);
CREATE INDEX idx_sales_nft_id ON public.sales(nft_id);
CREATE INDEX idx_sales_buyer_id ON public.sales(buyer_id);
CREATE INDEX idx_sales_seller_id ON public.sales(seller_id);
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);

-- BALANCES: per user in platform currency (e.g., USDC-equivalent)
CREATE TABLE IF NOT EXISTS public.balances (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(24,8) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own balance" ON public.balances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "update own balance via function" ON public.balances FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "insert own balance" ON public.balances FOR INSERT WITH CHECK (auth.uid() = user_id);

-- LEDGER: immutable entries of credits/debits
CREATE TABLE IF NOT EXISTS public.ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit','debit')),
  amount NUMERIC(24,8) NOT NULL,
  ref TEXT, -- external reference (payment id / order id)
  meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own ledger" ON public.ledger FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_user_id ON public.ledger(user_id);
CREATE POLICY "insert own ledger" ON public.ledger FOR INSERT WITH CHECK (auth.uid() = user_id);

-- TOPUPS: external onramp attempts (card->crypto). status managed by webhook
CREATE TABLE IF NOT EXISTS public.topups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- e.g., 'wert'
  status TEXT NOT NULL DEFAULT 'pending', -- pending/succeeded/failed
  fiat_currency TEXT NOT NULL DEFAULT 'USD',
  fiat_amount NUMERIC(24,2) NOT NULL,
  crypto_currency TEXT NOT NULL DEFAULT 'USDC',
  crypto_amount NUMERIC(24,8),
  external_id TEXT, -- provider session/payment id
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.topups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "manage own topups" ON public.topups FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_topups_user_id ON public.topups(user_id);

-- ORDERS: NFT purchase orders using balance
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nft_id UUID NOT NULL REFERENCES public.nfts(id) ON DELETE CASCADE,
  price NUMERIC(24,8) NOT NULL,
  status TEXT NOT NULL DEFAULT 'created', -- created/paid/failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "buyer reads own orders" ON public.orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "buyer inserts orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- FUNCTIONS: atomic credit/debit with ledger
CREATE OR REPLACE FUNCTION public.credit_balance(p_user UUID, p_amount NUMERIC, p_ref TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.ledger(user_id, type, amount, ref) VALUES (p_user, 'credit', p_amount, p_ref);
  INSERT INTO public.balances(user_id, amount)
  VALUES (p_user, p_amount)
  ON CONFLICT (user_id) DO UPDATE SET amount = public.balances.amount + EXCLUDED.amount, updated_at = NOW();
END;$$;

CREATE OR REPLACE FUNCTION public.debit_balance(p_user UUID, p_amount NUMERIC, p_ref TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.ledger(user_id, type, amount, ref) VALUES (p_user, 'debit', p_amount, p_ref);
  UPDATE public.balances SET amount = amount - p_amount, updated_at = NOW() WHERE user_id = p_user AND amount >= p_amount;
END;$$;

-- Trigger to keep balances.updated_at fresh
CREATE TRIGGER update_balances_updated_at BEFORE UPDATE ON public.balances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
