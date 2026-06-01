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

export async function getRankingData() {
  const userId = await getUserId();
  if (!userId) return null;

  const supabase = createClient();

  // Fetch current user
  const { data: currentUser } = await supabase
    .from("users")
    .select("id, pseudo, avatar, tokens")
    .eq("id", userId)
    .single();

  if (!currentUser) return null;

  // Global ranking (top 50 by tokens)
  const { data: globalRanking } = await supabase
    .from("users")
    .select("id, pseudo, avatar, tokens")
    .order("tokens", { ascending: false })
    .limit(50);

  // Friends ranking
  const { data: friendLinks } = await supabase
    .from("friends")
    .select("friend_id")
    .eq("user_id", userId);

  const friendIds = (friendLinks ?? []).map((f) => f.friend_id);

  let friendsRanking: { id: string; pseudo: string; avatar: string | null; tokens: number }[] = [];
  if (friendIds.length > 0) {
    const { data } = await supabase
      .from("users")
      .select("id, pseudo, avatar, tokens")
      .in("id", [...friendIds, userId])
      .order("tokens", { ascending: false });
    friendsRanking = data ?? [];
  } else {
    // Only the user themselves
    friendsRanking = [currentUser];
  }

  // User's global rank
  const { count: aboveCount } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .gt("tokens", currentUser.tokens);

  const userGlobalRank = (aboveCount ?? 0) + 1;

  return {
    currentUser,
    globalRanking: globalRanking ?? [],
    friendsRanking,
    userGlobalRank,
  };
}
