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

export async function getFriendsData() {
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

  // Fetch friend links
  const { data: friendLinks } = await supabase
    .from("friends")
    .select("friend_id")
    .eq("user_id", userId);

  const friendIds = (friendLinks ?? []).map((f) => f.friend_id);

  let friends: { id: string; pseudo: string; avatar: string | null; tokens: number }[] = [];
  if (friendIds.length > 0) {
    const { data } = await supabase
      .from("users")
      .select("id, pseudo, avatar, tokens")
      .in("id", friendIds)
      .order("tokens", { ascending: false });
    friends = data ?? [];
  }

  // Fetch received pending requests
  const { data: receivedRequests } = await supabase
    .from("friend_requests")
    .select("id, from_user_id, created_at")
    .eq("to_user_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // Fetch sender details
  const receivedIds = (receivedRequests ?? []).map((r) => r.from_user_id);
  let receivedWithUsers: { requestId: string; user: { id: string; pseudo: string; avatar: string | null; tokens: number } }[] = [];
  if (receivedIds.length > 0) {
    const { data: senders } = await supabase
      .from("users")
      .select("id, pseudo, avatar, tokens")
      .in("id", receivedIds);

    const sendersMap = new Map((senders ?? []).map((s) => [s.id, s]));
    receivedWithUsers = (receivedRequests ?? []).map((r) => ({
      requestId: r.id,
      user: sendersMap.get(r.from_user_id)!,
    })).filter((r) => r.user);
  }

  // Fetch sent pending requests
  const { data: sentRequests } = await supabase
    .from("friend_requests")
    .select("id, to_user_id, created_at")
    .eq("from_user_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const sentIds = (sentRequests ?? []).map((r) => r.to_user_id);
  let sentWithUsers: { requestId: string; user: { id: string; pseudo: string; avatar: string | null; tokens: number } }[] = [];
  if (sentIds.length > 0) {
    const { data: targets } = await supabase
      .from("users")
      .select("id, pseudo, avatar, tokens")
      .in("id", sentIds);

    const targetsMap = new Map((targets ?? []).map((t) => [t.id, t]));
    sentWithUsers = (sentRequests ?? []).map((r) => ({
      requestId: r.id,
      user: targetsMap.get(r.to_user_id)!,
    })).filter((r) => r.user);
  }

  return {
    currentUser,
    friends,
    receivedRequests: receivedWithUsers,
    sentRequests: sentWithUsers,
  };
}

export async function searchUsers(query: string) {
  const userId = await getUserId();
  if (!userId) return [];

  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const supabase = createClient();

  const { data } = await supabase
    .from("users")
    .select("id, pseudo, avatar, tokens")
    .ilike("pseudo", `%${trimmed}%`)
    .neq("id", userId)
    .order("tokens", { ascending: false })
    .limit(10);

  return data ?? [];
}

export async function sendFriendRequest(toUserId: string) {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  if (toUserId === userId) return { error: "Vous ne pouvez pas vous ajouter vous-même." };

  const supabase = createClient();

  // Check if already friends
  const { data: existingFriend } = await supabase
    .from("friends")
    .select("id")
    .eq("user_id", userId)
    .eq("friend_id", toUserId);

  if (existingFriend && existingFriend.length > 0) {
    return { error: "Ce joueur est déjà votre ami." };
  }

  // Check if request already sent
  const { data: existingSent } = await supabase
    .from("friend_requests")
    .select("id")
    .eq("from_user_id", userId)
    .eq("to_user_id", toUserId)
    .eq("status", "pending");

  if (existingSent && existingSent.length > 0) {
    return { error: "Demande déjà envoyée." };
  }

  // Check if there's an incoming request from them (auto-accept)
  const { data: existingReceived } = await supabase
    .from("friend_requests")
    .select("id")
    .eq("from_user_id", toUserId)
    .eq("to_user_id", userId)
    .eq("status", "pending");

  if (existingReceived && existingReceived.length > 0) {
    // Auto-accept: they already sent us a request
    return acceptFriendRequest(existingReceived[0].id);
  }

  // Send request
  const { error } = await supabase.from("friend_requests").insert({
    from_user_id: userId,
    to_user_id: toUserId,
  });

  if (error) return { error: "Erreur lors de l'envoi de la demande." };

  return { success: true };
}

export async function acceptFriendRequest(requestId: string) {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  const supabase = createClient();

  // Fetch the request
  const { data: request } = await supabase
    .from("friend_requests")
    .select("*")
    .eq("id", requestId)
    .eq("to_user_id", userId)
    .eq("status", "pending")
    .single();

  if (!request) return { error: "Demande introuvable." };

  // Update request status
  await supabase
    .from("friend_requests")
    .update({ status: "accepted" })
    .eq("id", requestId);

  // Create friendship (both directions)
  await supabase.from("friends").insert([
    { user_id: userId, friend_id: request.from_user_id },
    { user_id: request.from_user_id, friend_id: userId },
  ]);

  return { success: true };
}

export async function declineFriendRequest(requestId: string) {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  const supabase = createClient();

  await supabase
    .from("friend_requests")
    .update({ status: "declined" })
    .eq("id", requestId)
    .eq("to_user_id", userId)
    .eq("status", "pending");

  return { success: true };
}

export async function cancelFriendRequest(requestId: string) {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  const supabase = createClient();

  await supabase
    .from("friend_requests")
    .delete()
    .eq("id", requestId)
    .eq("from_user_id", userId)
    .eq("status", "pending");

  return { success: true };
}

export async function removeFriend(friendId: string) {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  const supabase = createClient();

  // Remove both directions
  await supabase.from("friends").delete().eq("user_id", userId).eq("friend_id", friendId);
  await supabase.from("friends").delete().eq("user_id", friendId).eq("friend_id", userId);

  return { success: true };
}
