# Supabase Database Setup

## 1. Create Tables
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire content of `supabase-schema.sql`
4. Click **Run** to execute all the SQL commands

## 2. What This Creates

### Tables:
- **profiles** - User profiles (extends auth.users)
- **collections** - NFT collections
- **nfts** - Individual NFTs
- **sales** - Transaction history
- **favorites** - User favorites

### Features:
- ✅ Row Level Security (RLS) enabled
- ✅ Automatic profile creation on signup
- ✅ Proper foreign key relationships
- ✅ Indexes for performance
- ✅ Updated_at timestamps
- ✅ Policies for data access control

## 3. Test the Setup
After running the SQL:
1. Try signing up a new user
2. Check if a profile was automatically created in the `profiles` table
3. Verify RLS policies are working

## 4. Next Steps
- Create collection creation form
- Add NFT minting functionality
- Build marketplace features
- Add admin panel for verification
