"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { verifyToken } from "@/lib/auth/jwt";
import type { GameState, Hand, GamePhase } from "./types";
import {
  COUNTDOWN_DURATION,
  SIDEBETS_DURATION,
  INSURANCE_DURATION,
  ACTION_DURATION,
  RESULTS_DURATION,
} from "./types";
import {
  createShoe,
  getCutPosition,
  drawCard,
  handValue,
  isBust,
  isBlackjack,
  dealInitialCards,
  playDealerHand,
  resolveHands,
  getPlayableHands,
  totalHandGain,
  parseCard,
  evaluatePerfectPairs,
  evaluate21Plus3,
} from "./engine";

const SESSION_COOKIE = "blackjack_session";

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// ============================================
// Load & Save Game State
// ============================================

async function loadGameState(roomId: string) {
  const supabase = createClient();
  const { data: room } = await supabase
    .from("rooms")
    .select("game_state, round_number, host_id, status")
    .eq("id", roomId)
    .single();
  return room;
}

function resolveSideBets(state: GameState): void {
  for (const hand of state.hands) {
    if (hand.isSplitHand) continue;

    if (hand.betPerfectPairs > 0) {
      const mult = evaluatePerfectPairs(hand.cards);
      hand.perfectPairsGain = mult > 0 ? hand.betPerfectPairs * mult : 0; // 0 = lose (already debited)
    }

    if (hand.bet21Plus3 > 0 && state.dealerCards.length > 0) {
      const mult = evaluate21Plus3(hand.cards, state.dealerCards[0]);
      hand.twentyOnePlus3Gain = mult > 0 ? hand.bet21Plus3 * mult : 0;
    }
  }
}

function roomStatusFromPhase(phase: string): string {
  return phase === "countdown" ? "waiting" : "playing";
}

async function saveGameState(roomId: string, state: GameState, roomStatus?: string) {
  const supabase = createClient();
  const update: Record<string, unknown> = { game_state: state, round_number: state.roundNumber };
  if (roomStatus) update.status = roomStatus;
  await supabase.from("rooms").update(update).eq("id", roomId);
}

// ============================================
// Advance Phase (lazy evaluation on read)
// ============================================

function secondsSince(isoDate: string): number {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
}

function advanceState(state: GameState): boolean {
  let changed = false;

  // Countdown → dealing (timer expired OR all seated players have bet)
  if (state.phase === "countdown") {
    const timerExpired = secondsSince(state.phaseStartedAt) >= COUNTDOWN_DURATION;
    // All seated players must have bet AND clicked ready to skip countdown
    const handsWithBets = state.hands.filter((h) => h.bet > 0);
    const allSeatedHaveBet = state.seatedPlayerCount > 0 && handsWithBets.length >= state.seatedPlayerCount;
    const allReady = allSeatedHaveBet && handsWithBets.every((h) => state.readyPlayers.includes(h.userId));

    if (timerExpired || allReady) {
      // Remove hands without bets
      state.hands = state.hands.filter((h) => h.bet > 0);

      if (state.hands.length === 0) {
        // No one bet, go back to waiting
        state.phase = "results";
        state.phaseStartedAt = new Date().toISOString();
        return true;
      }

      // Bets will be deducted in getFullGameState

      // Deal cards
      dealInitialCards(state);

      // Resolve side bets immediately (results stored on hands)
      resolveSideBets(state);

      // Go to sidebets animation phase
      state.phase = "sidebets";
      state.phaseStartedAt = new Date().toISOString();
      changed = true;
    }
  }

  // Sidebets animation → insurance or player turns
  if (state.phase === "sidebets") {
    if (secondsSince(state.phaseStartedAt) >= SIDEBETS_DURATION) {
      const dealerUpCard = state.dealerCards[0];
      if (parseCard(dealerUpCard).rank === "A") {
        state.phase = "insurance";
        state.phaseStartedAt = new Date().toISOString();
      } else {
        startPlayerTurns(state);
      }
      changed = true;
    }
  }

  // Insurance → player turns (all decided OR timer expired)
  if (state.phase === "insurance") {
    const timerExpired = secondsSince(state.phaseStartedAt) >= INSURANCE_DURATION;
    const allDecided = state.hands.filter(h => h.bet > 0 && !h.isSplitHand).every(h => h.insuranceDecided);

    if (timerExpired || allDecided) {
      // Auto-decline for anyone who didn't decide
      for (const hand of state.hands) {
        if (!hand.insuranceDecided) {
          hand.insuranceDecided = true;
        }
      }
      startPlayerTurns(state);
      changed = true;
    }
  }

  // Player turns — auto-stand on timeout
  if (state.phase === "player_turns" && state.currentHandIndex >= 0) {
    if (secondsSince(state.phaseStartedAt) >= ACTION_DURATION) {
      const hand = state.hands[state.currentHandIndex];
      if (hand && hand.status === "playing") {
        hand.status = "stand";
        advanceToNextHand(state);
        changed = true;
      }
    }
  }

  // Dealer turn (instant)
  if (state.phase === "dealer_turn") {
    playDealerHand(state);
    state.phase = "resolution";
    changed = true;
  }

  // Resolution (instant) — flag for async recording
  if (state.phase === "resolution") {
    resolveHands(state);
    state.phase = "results";
    state.phaseStartedAt = new Date().toISOString();
    changed = true;
  }

  // Results → auto-restart countdown
  if (state.phase === "results") {
    if (secondsSince(state.phaseStartedAt) >= RESULTS_DURATION) {
      startNewRound(state);
      changed = true;
    }
  }

  return changed;
}

function startPlayerTurns(state: GameState): void {
  state.phase = "player_turns";
  const playable = getPlayableHands(state);
  if (playable.length === 0) {
    // All blackjacks or no playable hands — go to dealer
    state.phase = "dealer_turn";
    state.currentHandIndex = -1;
  } else {
    state.currentHandIndex = playable[0];
    state.phaseStartedAt = new Date().toISOString();
  }
}

function advanceToNextHand(state: GameState): void {
  const playable = getPlayableHands(state);
  if (playable.length === 0) {
    state.phase = "dealer_turn";
    state.currentHandIndex = -1;
  } else {
    state.currentHandIndex = playable[0];
    state.phaseStartedAt = new Date().toISOString();
  }
}

function startNewRound(state: GameState): void {
  // Check if shoe needs reshuffling
  if (state.cutReached) {
    state.shoe = createShoe();
    state.cutPosition = getCutPosition(state.shoe.length);
    state.cutReached = false;
  }

  state.phase = "countdown";
  state.phaseStartedAt = new Date().toISOString();
  state.dealerCards = [];
  state.dealerHidden = true;
  state.hands = [];
  state.currentHandIndex = -1;
  state.roundNumber++;
  state.recorded = false;
  state.betsDeducted = false;
  state.seatedPlayerCount = 0;
}

// ============================================
// Initialize first round
// ============================================

function createInitialGameState(): GameState {
  const shoe = createShoe();
  return {
    phase: "countdown",
    phaseStartedAt: new Date().toISOString(),
    shoe,
    cutPosition: getCutPosition(shoe.length),
    cutReached: false,
    dealerCards: [],
    dealerHidden: true,
    hands: [],
    currentHandIndex: -1,
    roundNumber: 1,
    recorded: false,
    betsDeducted: false,
    seatedPlayerCount: 0,
    readyPlayers: [],
  };
}

// ============================================
// Get game state (with lazy advancement)
// ============================================

export async function getFullGameState(roomId: string) {
  const userId = await getUserId();
  if (!userId) return null;

  const room = await loadGameState(roomId);
  if (!room || !room.game_state) return null;

  const state = room.game_state as GameState;

  // Update seated player count during countdown
  if (state.phase === "countdown") {
    const supabaseForCount = createClient();
    const { data: seated } = await supabaseForCount
      .from("room_players")
      .select("id")
      .eq("room_id", roomId);
    state.seatedPlayerCount = seated?.length ?? 0;
  }

  // Advance state if timers expired
  const prevPhase = state.phase;
  let anyChanged = false;
  let changed = true;
  while (changed) {
    changed = advanceState(state);
    if (changed) anyChanged = true;
  }

  // Pay side bet wins once
  if (!state.betsDeducted && state.phase !== "countdown") {
    // betsDeducted repurposed as "sidebets paid" flag
    const supabaseForSB = createClient();
    for (const hand of state.hands) {
      if (hand.isSplitHand) continue;
      const sbWin = (hand.perfectPairsGain ?? 0) + (hand.twentyOnePlus3Gain ?? 0);
      if (sbWin > 0) {
        const { data: u } = await supabaseForSB.from("users").select("tokens").eq("id", hand.userId).single();
        if (u) {
          // Credit: original bet back + winnings
          const ppPayout = hand.perfectPairsGain ? hand.betPerfectPairs + hand.perfectPairsGain : 0;
          const t3Payout = hand.twentyOnePlus3Gain ? hand.bet21Plus3 + hand.twentyOnePlus3Gain : 0;
          await supabaseForSB.from("users").update({ tokens: u.tokens + ppPayout + t3Payout }).eq("id", hand.userId);
        }
      }
    }
    state.betsDeducted = true;
    anyChanged = true;
  }

  // Record results once when results phase is reached
  if (!state.recorded && (state.phase === "results" || state.phase === "countdown") && state.hands.some((h) => h.result)) {
    await recordResults(roomId, state);
    state.recorded = true;
    anyChanged = true;
  }

  if (anyChanged) {
    await saveGameState(roomId, state, roomStatusFromPhase(state.phase));
  }

  // Build client-safe state (hide shoe and hole card)
  const clientState = {
    ...state,
    shoe: undefined, // don't send shoe to client
    shoeCount: state.shoe.length,
    dealerCards: state.dealerCards.length === 0
      ? []
      : state.dealerHidden
        ? [state.dealerCards[0], "HIDDEN"]
        : state.dealerCards,
  };

  // Fetch fresh user tokens
  const supabase = createClient();
  const { data: freshUser } = await supabase
    .from("users")
    .select("tokens")
    .eq("id", userId)
    .single();

  return {
    state: clientState,
    userId,
    hostId: room.host_id,
    userTokens: freshUser?.tokens ?? 0,
  };
}

// ============================================
// Player Actions
// ============================================

export async function placeBet(
  roomId: string,
  seatIndex: number,
  bet: number,
  betPerfectPairs: number,
  bet21Plus3: number
) {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };
  if (bet < 1) return { error: "Mise invalide." };

  const room = await loadGameState(roomId);
  if (!room?.game_state) return { error: "Pas de partie en cours." };

  const state = room.game_state as GameState;
  if (state.phase !== "countdown") return { error: "Les mises sont fermées." };

  // Check user has enough tokens
  const supabase = createClient();
  const { data: user } = await supabase
    .from("users")
    .select("tokens")
    .eq("id", userId)
    .single();

  if (!user) return { error: "Utilisateur introuvable." };

  const totalNewBet = bet + betPerfectPairs + bet21Plus3;

  // Check if seat is occupied by this user (in room_players)
  const { data: seatCheck } = await supabase
    .from("room_players")
    .select("id")
    .eq("room_id", roomId)
    .eq("user_id", userId)
    .eq("seat_index", seatIndex);

  if (!seatCheck || seatCheck.length === 0) {
    return { error: "Vous n'êtes pas assis sur ce siège." };
  }

  // Calculate difference with previous bet on this seat
  const existingHand = state.hands.find((h) => h.seatIndex === seatIndex);
  const previousTotal = existingHand
    ? existingHand.bet + existingHand.betPerfectPairs + existingHand.bet21Plus3
    : 0;
  const diff = totalNewBet - previousTotal;

  if (diff > user.tokens) {
    return { error: "Pas assez de jetons." };
  }

  // Debit/credit the difference immediately
  if (diff !== 0) {
    await supabase
      .from("users")
      .update({ tokens: user.tokens - diff })
      .eq("id", userId);
  }

  // Remove player from ready list when they change their bet
  state.readyPlayers = state.readyPlayers.filter((id) => id !== userId);

  // Update or create hand for this seat
  if (existingHand) {
    existingHand.bet = bet;
    existingHand.betPerfectPairs = betPerfectPairs;
    existingHand.bet21Plus3 = bet21Plus3;
  } else {
    state.hands.push({
      seatIndex,
      userId,
      cards: [],
      bet,
      betPerfectPairs: betPerfectPairs,
      bet21Plus3: bet21Plus3,
      insuranceBet: 0,
      status: "betting",
      splitIndex: 0,
      isSplitHand: false,
      hasSplit: false,
      insuranceDecided: false,
    });
  }

  await saveGameState(roomId, state);
  return { success: true };
}

export async function setReady(roomId: string) {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  const room = await loadGameState(roomId);
  if (!room?.game_state) return { error: "Pas de partie en cours." };

  const state = room.game_state as GameState;
  if (state.phase !== "countdown") return { error: "Pas en phase de mise." };

  // Must have placed a bet
  const hasBet = state.hands.some((h) => h.userId === userId && h.bet > 0);
  if (!hasBet) return { error: "Vous devez d'abord miser." };

  if (!state.readyPlayers.includes(userId)) {
    state.readyPlayers.push(userId);
  }

  await saveGameState(roomId, state);
  return { success: true };
}

export async function takeInsurance(roomId: string, seatIndex: number) {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  const room = await loadGameState(roomId);
  if (!room?.game_state) return { error: "Pas de partie en cours." };

  const state = room.game_state as GameState;
  if (state.phase !== "insurance") return { error: "L'assurance n'est pas proposée." };

  const hand = state.hands.find((h) => h.seatIndex === seatIndex && h.userId === userId && !h.isSplitHand);
  if (!hand) return { error: "Main introuvable." };
  if (hand.insuranceDecided) return { error: "Déjà décidé." };

  const insuranceAmount = Math.floor(hand.bet / 2);

  // Check tokens
  const supabase = createClient();
  const { data: user } = await supabase.from("users").select("tokens").eq("id", userId).single();
  if (!user || user.tokens < insuranceAmount) return { error: "Pas assez de jetons." };

  // Debit insurance
  await supabase.from("users").update({ tokens: user.tokens - insuranceAmount }).eq("id", userId);

  hand.insuranceBet = insuranceAmount;
  hand.insuranceDecided = true;

  await saveGameState(roomId, state);
  return { success: true };
}

export async function declineInsurance(roomId: string, seatIndex: number) {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  const room = await loadGameState(roomId);
  if (!room?.game_state) return { error: "Pas de partie en cours." };

  const state = room.game_state as GameState;
  if (state.phase !== "insurance") return { error: "L'assurance n'est pas proposée." };

  const hand = state.hands.find((h) => h.seatIndex === seatIndex && h.userId === userId && !h.isSplitHand);
  if (!hand) return { error: "Main introuvable." };

  hand.insuranceDecided = true;

  await saveGameState(roomId, state);
  return { success: true };
}

export async function hit(roomId: string) {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  const room = await loadGameState(roomId);
  if (!room?.game_state) return { error: "Pas de partie en cours." };

  const state = room.game_state as GameState;
  advanceState(state); // catch up on any expired timers

  if (state.phase !== "player_turns") return { error: "Ce n'est pas le moment de jouer." };

  const hand = state.hands[state.currentHandIndex];
  if (!hand || hand.userId !== userId) return { error: "Ce n'est pas votre tour." };
  if (hand.status !== "playing") return { error: "Vous ne pouvez pas tirer." };

  hand.cards.push(drawCard(state));

  if (isBust(hand.cards)) {
    hand.status = "bust";
    advanceToNextHand(state);
  } else if (handValue(hand.cards) === 21) {
    hand.status = "stand";
    advanceToNextHand(state);
  } else {
    // Reset action timer
    state.phaseStartedAt = new Date().toISOString();
  }

  // Continue advancing (dealer, resolution, etc.)
  let changed = true;
  while (changed) {
    changed = advanceState(state);
  }

  await saveGameState(roomId, state, roomStatusFromPhase(state.phase));
  return { success: true };
}

export async function stand(roomId: string) {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  const room = await loadGameState(roomId);
  if (!room?.game_state) return { error: "Pas de partie en cours." };

  const state = room.game_state as GameState;
  advanceState(state);

  if (state.phase !== "player_turns") return { error: "Ce n'est pas le moment de jouer." };

  const hand = state.hands[state.currentHandIndex];
  if (!hand || hand.userId !== userId) return { error: "Ce n'est pas votre tour." };
  if (hand.status !== "playing") return { error: "Vous ne pouvez pas rester." };

  hand.status = "stand";
  advanceToNextHand(state);

  let changed = true;
  while (changed) {
    changed = advanceState(state);
  }

  await saveGameState(roomId, state, roomStatusFromPhase(state.phase));
  return { success: true };
}

export async function doubleDown(roomId: string) {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  const room = await loadGameState(roomId);
  if (!room?.game_state) return { error: "Pas de partie en cours." };

  const state = room.game_state as GameState;
  advanceState(state);

  if (state.phase !== "player_turns") return { error: "Ce n'est pas le moment de jouer." };

  const hand = state.hands[state.currentHandIndex];
  if (!hand || hand.userId !== userId) return { error: "Ce n'est pas votre tour." };
  if (hand.status !== "playing") return { error: "Action impossible." };
  if (hand.cards.length !== 2) return { error: "Vous ne pouvez doubler que sur vos 2 premières cartes." };

  // Check tokens
  const supabase = createClient();
  const { data: user } = await supabase
    .from("users")
    .select("tokens")
    .eq("id", userId)
    .single();

  const totalBets = state.hands
    .filter((h) => h.userId === userId)
    .reduce((sum, h) => sum + h.bet + h.betPerfectPairs + h.bet21Plus3 + h.insuranceBet, 0);

  if (!user || user.tokens < totalBets + hand.bet) {
    return { error: "Pas assez de jetons pour doubler." };
  }

  hand.bet *= 2;
  hand.cards.push(drawCard(state));

  if (isBust(hand.cards)) {
    hand.status = "bust";
  } else {
    hand.status = "doubled";
  }

  advanceToNextHand(state);

  let changed = true;
  while (changed) {
    changed = advanceState(state);
  }

  await saveGameState(roomId, state, roomStatusFromPhase(state.phase));
  return { success: true };
}

export async function split(roomId: string) {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  const room = await loadGameState(roomId);
  if (!room?.game_state) return { error: "Pas de partie en cours." };

  const state = room.game_state as GameState;
  advanceState(state);

  if (state.phase !== "player_turns") return { error: "Ce n'est pas le moment de jouer." };

  const hand = state.hands[state.currentHandIndex];
  if (!hand || hand.userId !== userId) return { error: "Ce n'est pas votre tour." };
  if (hand.status !== "playing") return { error: "Action impossible." };
  if (hand.cards.length !== 2) return { error: "Vous ne pouvez séparer que vos 2 premières cartes." };
  if (hand.hasSplit || hand.isSplitHand) return { error: "Pas de re-split." };

  const c1 = parseCard(hand.cards[0]);
  const c2 = parseCard(hand.cards[1]);
  if (c1.rank !== c2.rank) return { error: "Les deux cartes doivent avoir la même valeur." };

  // Check tokens
  const supabase = createClient();
  const { data: user } = await supabase
    .from("users")
    .select("tokens")
    .eq("id", userId)
    .single();

  const totalBets = state.hands
    .filter((h) => h.userId === userId)
    .reduce((sum, h) => sum + h.bet + h.betPerfectPairs + h.bet21Plus3 + h.insuranceBet, 0);

  if (!user || user.tokens < totalBets + hand.bet) {
    return { error: "Pas assez de jetons pour séparer." };
  }

  // Create second hand from the split
  const secondCard = hand.cards.pop()!;
  hand.hasSplit = true;

  const splitHand: Hand = {
    seatIndex: hand.seatIndex,
    userId: hand.userId,
    cards: [secondCard],
    bet: hand.bet,
    betPerfectPairs: 0, // side bets stay on original hand
    bet21Plus3: 0,
    insuranceBet: 0,
    status: "playing",
    splitIndex: 1,
    isSplitHand: true,
    hasSplit: false,
    insuranceDecided: true,
  };

  // Insert split hand right after the original in the array
  const handIdx = state.hands.indexOf(hand);
  state.hands.splice(handIdx + 1, 0, splitHand);

  // Draw one card for each hand
  hand.cards.push(drawCard(state));
  splitHand.cards.push(drawCard(state));

  // If split aces: one card only, auto-stand both
  if (c1.rank === "A") {
    hand.status = "stand";
    splitHand.status = "stand";
    // Update currentHandIndex since we inserted a hand
    advanceToNextHand(state);
  } else {
    // Check for 21 on first hand
    if (handValue(hand.cards) === 21) hand.status = "stand";
    state.phaseStartedAt = new Date().toISOString();
  }

  let changed = true;
  while (changed) {
    changed = advanceState(state);
  }

  await saveGameState(roomId, state, roomStatusFromPhase(state.phase));
  return { success: true };
}

// ============================================
// Start the game (host action or auto for public rooms)
// ============================================

export async function startGame(roomId: string) {
  const userId = await getUserId();
  if (!userId) return { error: "Non connecté." };

  const supabase = createClient();
  const room = await loadGameState(roomId);
  if (!room) return { error: "Salon introuvable." };

  // Only host can start for private rooms
  if (room.host_id !== userId) return { error: "Seul l'hôte peut lancer." };
  if (room.game_state) return { error: "Une partie est déjà en cours." };

  const state = createInitialGameState();

  // Load seated players and create empty hands
  const { data: seated } = await supabase
    .from("room_players")
    .select("user_id, seat_index")
    .eq("room_id", roomId);

  // Hands will be created when players place bets during countdown

  await saveGameState(roomId, state, "playing");
  return { success: true };
}

// ============================================
// Record game results to DB
// ============================================

async function recordResults(roomId: string, state: GameState) {
  const supabase = createClient();

  for (const hand of state.hands) {
    if (hand.bet === 0) continue;

    const result = hand.result === "blackjack"
      ? "blackjack"
      : hand.result === "win"
        ? "victoire"
        : hand.result === "push"
          ? "egalite"
          : "defaite";

    // Main hand payout: bet already debited
    // Win → get back bet×2, Push → get back bet, Lose → 0, BJ → bet×2.5
    let payout = 0;
    if (hand.result === "win") payout = hand.bet * 2;
    else if (hand.result === "blackjack") payout = Math.floor(hand.bet * 2.5);
    else if (hand.result === "push") payout = hand.bet;
    // lose = 0 (already debited)

    // Insurance payout
    if (hand.insuranceGain && hand.insuranceGain > 0) {
      payout += hand.insuranceBet + hand.insuranceGain; // get back insurance + winnings
    }

    // Side bets net gain (each independently: win = +gain, lose = -bet)
    // perfectPairsGain: >0 = winnings, 0 = lost
    // bet was already debited at placeBet time
    const ppNet = hand.betPerfectPairs > 0
      ? (hand.perfectPairsGain ?? 0) > 0 ? hand.perfectPairsGain! : -hand.betPerfectPairs
      : 0;
    const t3Net = hand.bet21Plus3 > 0
      ? (hand.twentyOnePlus3Gain ?? 0) > 0 ? hand.twentyOnePlus3Gain! : -hand.bet21Plus3
      : 0;
    const insuranceNet = hand.insuranceBet > 0
      ? (hand.insuranceGain ?? 0) > 0 ? hand.insuranceGain! : -hand.insuranceBet
      : 0;

    // Total bet = main + side bets + insurance
    const totalBet = hand.bet + hand.betPerfectPairs + hand.bet21Plus3 + hand.insuranceBet;

    // Total net gain = main net + sidebets net + insurance net
    const netGain = (payout - hand.bet) + ppNet + t3Net + insuranceNet;

    // Record game
    await supabase.from("games").insert({
      user_id: hand.userId,
      bet: totalBet,
      result,
      gain: netGain,
      type: "multi",
    });

    // Credit payout to player
    if (payout > 0) {
      const { data: user } = await supabase
        .from("users")
        .select("tokens")
        .eq("id", hand.userId)
        .single();

      if (user) {
        await supabase
          .from("users")
          .update({ tokens: user.tokens + payout })
          .eq("id", hand.userId);
      }
    }
  }
}
