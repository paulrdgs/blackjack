"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { verifyToken } from "@/lib/auth/jwt";

const SESSION_COOKIE = "blackjack_session";

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getPlayData() {
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

  // Fetch open rooms (waiting) with player count
  const { data: rooms } = await supabase
    .from("rooms")
    .select("*, room_players(user_id)")
    .eq("status", "waiting")
    .eq("is_private", false)
    .order("created_at", { ascending: false });

  const roomsWithCount = (rooms ?? []).map((room) => ({
    id: room.id,
    name: room.name,
    hostId: room.host_id,
    maxPlayers: room.max_players,
    playerCount: Array.isArray(room.room_players) ? room.room_players.length : 0,
    createdAt: room.created_at,
  }));

  return {
    currentUser,
    rooms: roomsWithCount,
  };
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion
  let code = "";
  for (let i = 0; i < 7; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createPrivateRoom() {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  const supabase = createClient();

  // Generate unique code (retry if collision)
  let code = generateCode();
  let attempts = 0;
  while (attempts < 5) {
    const { data: existing } = await supabase
      .from("rooms")
      .select("id")
      .eq("code", code);
    if (!existing || existing.length === 0) break;
    code = generateCode();
    attempts++;
  }

  // Create the room
  const { data: room, error } = await supabase
    .from("rooms")
    .insert({
      name: `Partie de ${code}`,
      host_id: userId,
      is_private: true,
      code,
      max_players: 7,
    })
    .select("id")
    .single();

  if (error || !room) {
    return { error: "Erreur lors de la création du salon." };
  }

  return { success: true, roomId: room.id };
}

export async function startCountdown(roomId: string) {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  const supabase = createClient();

  // Verify the user is the host
  const { data: room } = await supabase
    .from("rooms")
    .select("host_id, status, game_state")
    .eq("id", roomId)
    .single();

  if (!room) return { error: "Salon introuvable." };
  if (room.host_id !== userId) return { error: "Seul l'hôte peut lancer la partie." };
  if (room.status !== "waiting") return { error: "La partie a déjà été lancée." };

  // Check at least one player is seated
  const { data: players } = await supabase
    .from("room_players")
    .select("id")
    .eq("room_id", roomId)
    .limit(1);

  if (!players || players.length === 0) {
    return { error: "Au moins un joueur doit être assis." };
  }

  // Initialize game state
  const { initializeGame } = await import("@/lib/game/init");
  const gameState = initializeGame();

  await supabase
    .from("rooms")
    .update({
      status: "playing",
      started_at: new Date().toISOString(),
      game_state: gameState,
      round_number: 1,
    })
    .eq("id", roomId);

  return { success: true };
}

export async function takeSeat(roomId: string, seatIndex: number) {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  if (seatIndex < 0 || seatIndex > 6) return { error: "Place invalide." };

  const supabase = createClient();

  // Check the room exists and is waiting or countdown
  const { data: room } = await supabase
    .from("rooms")
    .select("id, status, max_players, game_state")
    .eq("id", roomId)
    .single();

  if (!room) return { error: "Salon introuvable." };

  // Allow sitting during waiting, countdown, or playing (if game phase is countdown)
  if (room.status === "waiting" || room.status === "countdown") {
    // OK
  } else if (room.status === "playing") {
    // Check if game is still in countdown phase
    const gameState = room.game_state as { phase?: string } | null;
    if (!gameState || gameState.phase !== "countdown") {
      return { error: "La partie a déjà commencé." };
    }
  } else {
    return { error: "La partie a déjà commencé." };
  }

  // Check if seat is taken
  const { data: seatTaken } = await supabase
    .from("room_players")
    .select("id")
    .eq("room_id", roomId)
    .eq("seat_index", seatIndex);

  if (seatTaken && seatTaken.length > 0) {
    return { error: "Cette place est déjà prise." };
  }

  // Check if room is full
  const { data: playerCount } = await supabase
    .from("room_players")
    .select("id")
    .eq("room_id", roomId);

  if ((playerCount?.length ?? 0) >= room.max_players) {
    return { error: "Le salon est plein." };
  }

  // Take the seat
  await supabase.from("room_players").insert({
    room_id: roomId,
    user_id: userId,
    seat_index: seatIndex,
  });

  return { success: true };
}

async function deleteRoomIfEmpty(supabase: ReturnType<typeof createClient>, roomId: string) {
  const { data: remaining } = await supabase
    .from("room_players")
    .select("id")
    .eq("room_id", roomId)
    .limit(1);

  if (!remaining || remaining.length === 0) {
    await supabase.from("rooms").delete().eq("id", roomId);
  }
}

export async function leaveSeat(roomId: string, seatIndex: number) {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  const supabase = createClient();

  await supabase
    .from("room_players")
    .delete()
    .eq("room_id", roomId)
    .eq("user_id", userId)
    .eq("seat_index", seatIndex);

  return { success: true };
}

export async function leaveRoom(roomId: string) {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  const supabase = createClient();

  // Remove all seats for this user
  await supabase
    .from("room_players")
    .delete()
    .eq("room_id", roomId)
    .eq("user_id", userId);

  // Delete room if empty
  await deleteRoomIfEmpty(supabase, roomId);

  return { success: true };
}

export async function getGameData(roomId: string) {
  const userId = await getUserId();
  if (!userId) return null;

  const supabase = createClient();

  // Fetch the room
  const { data: room } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", roomId)
    .single();

  if (!room) return null;

  // Fetch players in the room with their seat
  const { data: roomPlayers } = await supabase
    .from("room_players")
    .select("user_id, seat_index")
    .eq("room_id", roomId);

  const playerIds = (roomPlayers ?? []).map((p) => p.user_id);
  let players: { id: string; pseudo: string; avatar: string | null; tokens: number; seatIndex: number }[] = [];

  if (playerIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, pseudo, avatar, tokens")
      .in("id", playerIds);

    const usersMap = new Map((users ?? []).map((u) => [u.id, u]));
    players = (roomPlayers ?? [])
      .filter((rp) => rp.seat_index !== null && usersMap.has(rp.user_id))
      .map((rp) => ({
        ...usersMap.get(rp.user_id)!,
        seatIndex: rp.seat_index!,
      }));
  }

  // Current user
  const { data: currentUser } = await supabase
    .from("users")
    .select("id, pseudo, avatar, tokens")
    .eq("id", userId)
    .single();

  // Seats occupied by the current user
  const userSeats = players.filter((p) => p.id === userId).map((p) => p.seatIndex);

  return {
    currentUser: currentUser!,
    room: {
      id: room.id,
      name: room.name,
      code: room.code,
      isPrivate: room.is_private,
      hostId: room.host_id,
      maxPlayers: room.max_players,
      status: room.status as string,
      startedAt: room.started_at as string | null,
    },
    players,
    isHost: room.host_id === userId,
    userSeats,
  };
}

export async function createRoom(formData: FormData) {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  const name = (formData.get("name") as string)?.trim();
  const maxPlayers = parseInt(formData.get("maxPlayers") as string) || 5;
  const isPrivate = formData.get("isPrivate") === "true";

  if (!name || name.length < 2) {
    return { error: "Le nom du salon doit contenir au moins 2 caractères." };
  }

  if (maxPlayers < 2 || maxPlayers > 5) return { error: "Le nombre de joueurs doit être entre 2 et 5." };

  const supabase = createClient();

  const code = isPrivate ? generateCode() : null;

  // Create the room
  const { data: room, error } = await supabase
    .from("rooms")
    .insert({
      name,
      host_id: userId,
      is_private: isPrivate,
      code,
      max_players: maxPlayers,
    })
    .select("id")
    .single();

  if (error || !room) {
    return { error: "Erreur lors de la création du salon." };
  }

  // Add host as player
  await supabase.from("room_players").insert({
    room_id: room.id,
    user_id: userId,
  });

  return { success: true, roomId: room.id };
}

export async function joinRoom(roomId: string) {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  const supabase = createClient();

  // Fetch the room
  const { data: room } = await supabase
    .from("rooms")
    .select("*, room_players(user_id)")
    .eq("id", roomId)
    .single();

  if (!room) return { error: "Salon introuvable." };
  if (room.status !== "waiting") return { error: "La partie a déjà commencé." };

  const playerCount = Array.isArray(room.room_players) ? room.room_players.length : 0;
  if (playerCount >= room.max_players) return { error: "Le salon est plein." };

  // Check if already in room
  const alreadyIn = Array.isArray(room.room_players) && room.room_players.some((p: { user_id: string }) => p.user_id === userId);
  if (alreadyIn) return { error: "Vous êtes déjà dans ce salon." };

  await supabase.from("room_players").insert({
    room_id: roomId,
    user_id: userId,
  });

  return { success: true };
}

export async function joinPrivateRoom(code: string) {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return { error: "Veuillez entrer un code." };

  const supabase = createClient();

  const { data: room } = await supabase
    .from("rooms")
    .select("*, room_players(user_id)")
    .eq("code", trimmed)
    .eq("status", "waiting")
    .single();

  if (!room) return { error: "Aucun salon trouvé avec ce code." };

  const playerCount = Array.isArray(room.room_players) ? room.room_players.length : 0;
  if (playerCount >= room.max_players) return { error: "Le salon est plein." };

  const alreadyIn = Array.isArray(room.room_players) && room.room_players.some((p: { user_id: string }) => p.user_id === userId);
  if (alreadyIn) return { error: "Vous êtes déjà dans ce salon." };

  await supabase.from("room_players").insert({
    room_id: room.id,
    user_id: userId,
  });

  return { success: true, roomId: room.id };
}
