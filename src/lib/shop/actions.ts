"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { verifyToken } from "@/lib/auth/jwt";

const SESSION_COOKIE = "blackjack_session";

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// --- Loans ---

const LOAN_OFFERS = [
  { amount: 50, repayment: 75 },
  { amount: 100, repayment: 150 },
  { amount: 200, repayment: 300 },
  { amount: 500, repayment: 750 },
  { amount: 1000, repayment: 1500 },
];

export async function borrow(amount: number) {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  if (!Number.isInteger(amount) || amount < 1) {
    return { error: "Montant invalide." };
  }

  // Predefined offer or custom (50% rate)
  const offer = LOAN_OFFERS.find((o) => o.amount === amount)
    ?? { amount: amount, repayment: Math.ceil(amount * 1.5) };

  const supabase = createClient();

  // Create the loan
  const { error: loanError } = await supabase.from("loans").insert({
    user_id: userId,
    amount: offer.amount,
    repayment: offer.repayment,
    repaid: 0,
  });

  if (loanError) return { error: "Erreur lors de la création du prêt." };

  // Add tokens to the user
  const { data: user } = await supabase
    .from("users")
    .select("tokens")
    .eq("id", userId)
    .single();

  if (!user) return { error: "Utilisateur introuvable." };

  await supabase
    .from("users")
    .update({ tokens: user.tokens + offer.amount })
    .eq("id", userId);

  return { success: true };
}

export async function repay(loanId: string, amount: number) {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  if (amount <= 0) return { error: "Montant invalide." };

  const supabase = createClient();

  // Fetch the loan
  const { data: loan } = await supabase
    .from("loans")
    .select("*")
    .eq("id", loanId)
    .eq("user_id", userId)
    .single();

  if (!loan) return { error: "Prêt introuvable." };

  const remaining = loan.repayment - loan.repaid;
  if (amount > remaining) return { error: "Montant supérieur au reste dû." };

  // Check tokens
  const { data: user } = await supabase
    .from("users")
    .select("tokens")
    .eq("id", userId)
    .single();

  if (!user) return { error: "Utilisateur introuvable." };
  if (user.tokens < amount) return { error: "Pas assez de jetons." };

  // Repay
  await supabase
    .from("loans")
    .update({ repaid: loan.repaid + amount })
    .eq("id", loanId);

  await supabase
    .from("users")
    .update({ tokens: user.tokens - amount })
    .eq("id", userId);

  return { success: true };
}

// --- Skins ---

export async function buySkin(skinId: string, price: number) {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  const supabase = createClient();

  // Check tokens
  const { data: user } = await supabase
    .from("users")
    .select("tokens")
    .eq("id", userId)
    .single();

  if (!user) return { error: "Utilisateur introuvable." };
  if (user.tokens < price) return { error: "Pas assez de jetons." };

  // Check if already owned
  const { data: existing } = await supabase
    .from("skins")
    .select("id")
    .eq("user_id", userId)
    .eq("skin_id", skinId);

  if (existing && existing.length > 0) {
    return { error: "Vous possédez déjà ce skin." };
  }

  // Purchase
  await supabase.from("skins").insert({ user_id: userId, skin_id: skinId });
  await supabase
    .from("users")
    .update({ tokens: user.tokens - price })
    .eq("id", userId);

  return { success: true };
}

export async function sellSkin(skinId: string, price: number) {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  const supabase = createClient();

  // Check ownership
  const { data: existing } = await supabase
    .from("skins")
    .select("id")
    .eq("user_id", userId)
    .eq("skin_id", skinId);

  if (!existing || existing.length === 0) {
    return { error: "Vous ne possédez pas ce skin." };
  }

  const resalePrice = Math.floor(price / 2);

  // Sell
  await supabase
    .from("skins")
    .delete()
    .eq("user_id", userId)
    .eq("skin_id", skinId);

  const { data: user } = await supabase
    .from("users")
    .select("tokens")
    .eq("id", userId)
    .single();

  if (user) {
    await supabase
      .from("users")
      .update({ tokens: user.tokens + resalePrice })
      .eq("id", userId);
  }

  return { success: true };
}

export async function getShopData() {
  const userId = await getUserId();
  if (!userId) return null;

  const supabase = createClient();

  const [userRes, loansRes, skinsRes] = await Promise.all([
    supabase.from("users").select("id, pseudo, avatar, tokens").eq("id", userId).single(),
    supabase.from("loans").select("*").eq("user_id", userId),
    supabase.from("skins").select("skin_id").eq("user_id", userId),
  ]);

  if (!userRes.data) return null;

  const activeLoans = (loansRes.data ?? []).filter(
    (p) => p.repaid < p.repayment
  );

  return {
    user: userRes.data,
    activeLoans,
    ownedSkins: (skinsRes.data ?? []).map((s) => s.skin_id),
    hasActiveLoan: activeLoans.length > 0,
  };
}
