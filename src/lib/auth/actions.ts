"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { createClient } from "@/lib/supabase/server";
import { signToken, verifyToken } from "@/lib/auth/jwt";

const SESSION_COOKIE = "blackjack_session";

export async function signup(formData: FormData) {
  const pseudo = (formData.get("pseudo") as string)?.trim();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!pseudo || pseudo.length < 3) {
    return { error: "Le pseudo doit contenir au moins 3 caractères." };
  }

  if (!password || password.length < 10) {
    return { error: "Le mot de passe doit contenir au moins 10 caractères." };
  }

  if (!/[a-z]/.test(password)) {
    return { error: "Le mot de passe doit contenir au moins une minuscule." };
  }

  if (!/[A-Z]/.test(password)) {
    return { error: "Le mot de passe doit contenir au moins une majuscule." };
  }

  if (!/[0-9]/.test(password)) {
    return { error: "Le mot de passe doit contenir au moins un chiffre." };
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    return { error: "Le mot de passe doit contenir au moins un caractère spécial." };
  }

  if (password !== confirm) {
    return { error: "Les mots de passe ne correspondent pas." };
  }

  const supabase = createClient();

  // Check if the pseudo is already taken
  const { data: existingUsers } = await supabase
    .from("users")
    .select("id")
    .eq("pseudo", pseudo);

  if (existingUsers && existingUsers.length > 0) {
    return { error: "Ce pseudo est déjà pris." };
  }

  // Hash the password
  const password_hash = await bcrypt.hash(password, 12);

  // Create the user
  const { data: user, error } = await supabase
    .from("users")
    .insert({ pseudo, password_hash })
    .select("id")
    .single();

  if (error || !user) {
    console.error("Signup error:", error);
    return { error: "Erreur lors de la création du compte." };
  }

  // Upload avatar if provided
  const avatarFile = formData.get("avatar") as File | null;
  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split(".").pop();
    const path = `${user.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile, { upsert: true });

    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      await supabase
        .from("users")
        .update({ avatar: urlData.publicUrl })
        .eq("id", user.id);
    }
  }

  // Generate JWT and create the session
  const token = await signToken(user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  redirect("/dashboard");
}

export async function login(formData: FormData) {
  const pseudo = (formData.get("pseudo") as string)?.trim();
  const password = formData.get("password") as string;

  if (!pseudo) {
    return { error: "Veuillez entrer votre pseudo." };
  }

  if (!password) {
    return { error: "Veuillez entrer votre mot de passe." };
  }

  const supabase = createClient();

  // Find the user
  const { data: user } = await supabase
    .from("users")
    .select("id, password_hash")
    .eq("pseudo", pseudo)
    .single();

  if (!user) {
    return { error: "Pseudo ou mot de passe incorrect." };
  }

  // Verify the password
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return { error: "Pseudo ou mot de passe incorrect." };
  }

  // Generate JWT and create the session
  const token = await signToken(user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/");
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const userId = await verifyToken(token);
  if (!userId) return null;

  const supabase = createClient();
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  return user;
}

export async function getDashboardData() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const userId = await verifyToken(token);
  if (!userId) return null;

  const supabase = createClient();

  // Fetch user, games, loans, and friends in parallel
  const [userRes, gamesRes, loansRes, friendsRes] = await Promise.all([
    supabase.from("users").select("*").eq("id", userId).single(),
    supabase.from("games").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("loans").select("*").eq("user_id", userId),
    supabase.from("friends").select("friend_id").eq("user_id", userId),
  ]);

  if (!userRes.data) return null;

  // Fetch friend details
  const friendIds = (friendsRes.data ?? []).map((a) => a.friend_id);
  let friends: { id: string; pseudo: string; avatar: string | null; tokens: number }[] = [];
  if (friendIds.length > 0) {
    const { data } = await supabase
      .from("users")
      .select("id, pseudo, avatar, tokens")
      .in("id", friendIds)
      .order("tokens", { ascending: false });
    friends = data ?? [];
  }

  // Active loans (not fully repaid)
  const activeLoans = (loansRes.data ?? []).filter(
    (p) => p.repaid < p.repayment
  );

  const parties = gamesRes.data ?? [];
  const totalParties = parties.length;
  const victoires = parties.filter((p) => p.result === "victoire" || p.result === "blackjack").length;

  // Calculate current streak and best streak
  let currentStreak = 0;
  let bestStreak = 0;
  let streak = 0;
  // Games sorted from most recent to oldest
  for (const p of parties) {
    if (p.result === "victoire" || p.result === "blackjack") {
      streak++;
      if (streak > bestStreak) bestStreak = streak;
    } else {
      if (currentStreak === 0 && streak > 0) currentStreak = streak;
      streak = 0;
    }
  }
  if (currentStreak === 0) currentStreak = streak;
  if (streak > bestStreak) bestStreak = streak;

  // Global rank
  const { count: globalRank } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .gt("tokens", userRes.data.tokens);

  // Friends rank
  const friendsRank = friends.filter((a) => a.tokens > userRes.data!.tokens).length + 1;

  // Token evolution (cumulative gains per day)
  const tokensPerDay = new Map<string, number>();
  // Iterate from oldest to most recent
  for (const p of [...parties].reverse()) {
    const jour = new Date(p.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    tokensPerDay.set(jour, (tokensPerDay.get(jour) ?? 0) + p.gain);
  }

  // Build cumulative history
  let balance = 200; // initial balance
  const tokensHistory = Array.from(tokensPerDay.entries()).map(([jour, gain]) => {
    balance += gain;
    return { jour, jetons: balance };
  });

  return {
    user: userRes.data,
    parties: parties.slice(0, 6), // last 6
    activeLoans,
    friends,
    stats: {
      totalGames: totalParties,
      wins: victoires,
      currentStreak,
      bestStreak,
      globalRank: (globalRank ?? 0) + 1,
      friendsRank,
    },
    tokensHistory,
  };
}
