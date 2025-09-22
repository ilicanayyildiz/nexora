import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// This endpoint should be called by your on-ramp provider's webhook when a payment succeeds.
// IMPORTANT: Use SERVICE ROLE key server-side only. Never expose it to the client.

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const body = await req.json();
    // Expected payload (example): { user_id, amount, currency, provider, external_id }
    const { user_id, amount, provider, external_id } = body ?? {};
    if (!user_id || !amount) {
      return NextResponse.json({ error: "Missing user_id or amount" }, { status: 400 });
    }

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // Upsert topup record
    await admin.from("topups").upsert({
      user_id,
      provider: provider ?? "onramp",
      status: "succeeded",
      fiat_currency: "USD",
      fiat_amount: amount,
      crypto_currency: "USDC",
      crypto_amount: amount,
      external_id: external_id ?? null,
    });

    // Credit balance atomically via RPC
    const { error: rpcError } = await admin.rpc("credit_balance", {
      p_user: user_id,
      p_amount: amount,
      p_ref: external_id ?? provider ?? "onramp",
    });
    if (rpcError) throw rpcError;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}


