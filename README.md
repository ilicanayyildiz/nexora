Nexora - Luxy benzeri NFT Landing

Kurulum

1) Bağımlılıkları kurun
```
npm install
```
2) Geliştirme sunucusunu çalıştırın
```
npm run dev
```
3) Tarayıcıda açın: http://localhost:3000

Yapı

- `src/components/Navbar.tsx`: Üst gezinme
- `src/components/Footer.tsx`: Altbilgi
- `src/app/page.tsx`: Ana sayfa bölümleri (Hero, Create, Launchpad, Token, Buy, Community)

Referans: [luxy.io](https://luxy.io/)

## Supabase Setup

1. Create a project at `https://supabase.com`.
2. Go to Project Settings → API and copy:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Create a `.env.local` in `web/` with:
```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
4. Restart dev server if running.

Auth is implemented with email/password using `@supabase/supabase-js`. Pages:
- `src/app/signin/page.tsx`
- `src/app/signup/page.tsx`
- `src/app/dashboard/page.tsx` (protected)

### OAuth (Google, GitHub)

Enable providers in Supabase Dashboard → Authentication → Providers:
- Google: set Client ID and Client Secret
- GitHub: set Client ID and Client Secret

Set authorized redirect URLs to:
```
http://localhost:3000/auth/v1/callback
```
Supabase will handle the callback path automatically for the JS client.

## On-ramp Webhook (Wert or similar)

Server env:
```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Webhook endpoint (POST): `/api/webhooks/onramp`

Expected JSON body:
```json
{ "user_id": "<uuid>", "amount": 25.00, "provider": "wert", "external_id": "pay_123" }
```

Behavior:
- Creates/updates a `topups` row with status `succeeded`
- Calls `credit_balance(user_id, amount, ref)` to credit the platform balance

UI:
- `/wallet` shows balance and ledger; includes a "Finance" button
