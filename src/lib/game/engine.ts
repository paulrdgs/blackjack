import type { Card, Suit, Rank, Hand, GameState, HandResult } from "./types";

// ============================================
// Deck & Shoe
// ============================================

const SUITS: Suit[] = ["H", "D", "C", "S"];
const RANKS: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(`${rank}${suit}`);
    }
  }
  return deck;
}

export function createShoe(numDecks = 6): Card[] {
  const shoe: Card[] = [];
  for (let i = 0; i < numDecks; i++) {
    shoe.push(...createDeck());
  }
  return shuffle(shoe);
}

export function shuffle(cards: Card[]): Card[] {
  const arr = [...cards];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Cut position: random between 60% and 80% of shoe
export function getCutPosition(shoeSize: number): number {
  const min = Math.floor(shoeSize * 0.6);
  const max = Math.floor(shoeSize * 0.8);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function drawCard(state: GameState): Card {
  const card = state.shoe.shift()!;
  // Check if cut has been reached
  if (state.shoe.length <= state.cutPosition) {
    state.cutReached = true;
  }
  return card;
}

// ============================================
// Card Values
// ============================================

export function parseCard(card: Card): { rank: Rank; suit: Suit } {
  const suit = card.slice(-1) as Suit;
  const rank = card.slice(0, -1) as Rank;
  return { rank, suit };
}

export function cardValue(card: Card): number {
  const { rank } = parseCard(card);
  if (rank === "A") return 11;
  if (["K", "Q", "J"].includes(rank)) return 10;
  return parseInt(rank);
}

export function handValue(cards: Card[]): number {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    const val = cardValue(card);
    total += val;
    if (parseCard(card).rank === "A") aces++;
  }

  // Convert aces from 11 to 1 as needed
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}

export function isBust(cards: Card[]): boolean {
  return handValue(cards) > 21;
}

export function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && handValue(cards) === 21;
}

export function isSoft17(cards: Card[]): boolean {
  if (handValue(cards) !== 17) return false;
  let total = 0;
  let aces = 0;
  for (const card of cards) {
    const val = cardValue(card);
    total += val;
    if (parseCard(card).rank === "A") aces++;
  }
  // Soft 17 means there's still an ace counted as 11
  // We don't use soft 17 rule (dealer stands on all 17s)
  return false;
}

// ============================================
// Side Bets
// ============================================

export function evaluatePerfectPairs(cards: Card[]): number {
  if (cards.length < 2) return 0;
  const c1 = parseCard(cards[0]);
  const c2 = parseCard(cards[1]);

  if (c1.rank !== c2.rank) return 0;

  // Perfect pair: same rank + same suit
  if (c1.suit === c2.suit) return 30;

  // Colored pair: same rank + same color (H/D = red, C/S = black)
  const color1 = c1.suit === "H" || c1.suit === "D" ? "red" : "black";
  const color2 = c2.suit === "H" || c2.suit === "D" ? "red" : "black";
  if (color1 === color2) return 10;

  // Mixed pair: same rank, different color
  return 5;
}

export function evaluate21Plus3(playerCards: Card[], dealerUpCard: Card): number {
  if (playerCards.length < 2) return 0;
  const three = [playerCards[0], playerCards[1], dealerUpCard];
  const parsed = three.map(parseCard);

  const ranks = parsed.map((c) => c.rank);
  const suits = parsed.map((c) => c.suit);

  const allSameSuit = suits[0] === suits[1] && suits[1] === suits[2];
  const allSameRank = ranks[0] === ranks[1] && ranks[1] === ranks[2];

  // Suited trips (3 identical cards)
  if (allSameRank && allSameSuit) return 100;

  // Three of a kind (same rank, different suits)
  if (allSameRank) return 30;

  // Check for straight
  const rankOrder = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  const indices = ranks.map((r) => {
    const positions: number[] = [];
    rankOrder.forEach((rr, i) => { if (rr === r) positions.push(i); });
    return positions;
  });

  function isStraight(): boolean {
    // Try all combinations of indices
    for (const i0 of indices[0]) {
      for (const i1 of indices[1]) {
        for (const i2 of indices[2]) {
          const sorted = [i0, i1, i2].sort((a, b) => a - b);
          if (sorted[2] - sorted[0] === 2 && sorted[1] - sorted[0] === 1) return true;
        }
      }
    }
    return false;
  }

  const straight = isStraight();

  // Straight flush
  if (straight && allSameSuit) return 40;

  // Straight
  if (straight) return 10;

  // Flush (same suit)
  if (allSameSuit) return 5;

  return 0;
}

// ============================================
// Dealing
// ============================================

export function dealInitialCards(state: GameState): void {
  const activeHands = state.hands.filter((h) => h.bet > 0);

  // First card to each player (right to left = high seat index first)
  const sorted = [...activeHands].sort((a, b) => b.seatIndex - a.seatIndex);
  for (const hand of sorted) {
    hand.cards.push(drawCard(state));
  }

  // First card to dealer
  state.dealerCards.push(drawCard(state));

  // Second card to each player
  for (const hand of sorted) {
    hand.cards.push(drawCard(state));
  }

  // Second card to dealer (hole card)
  state.dealerCards.push(drawCard(state));
  state.dealerHidden = true;

  // Check for natural blackjacks
  for (const hand of activeHands) {
    if (isBlackjack(hand.cards)) {
      hand.status = "blackjack";
    } else {
      hand.status = "playing";
    }
  }
}

// ============================================
// Dealer Logic
// ============================================

export function playDealerHand(state: GameState): void {
  state.dealerHidden = false;

  // If all players busted or have blackjack, dealer doesn't need to draw
  const activeHands = state.hands.filter(
    (h) => h.bet > 0 && h.status !== "bust" && h.status !== "blackjack"
  );

  if (activeHands.length === 0) return;

  // Dealer draws to 16, stands on 17+
  while (handValue(state.dealerCards) < 17) {
    state.dealerCards.push(drawCard(state));
  }
}

// ============================================
// Resolution
// ============================================

export function resolveHands(state: GameState): void {
  const dealerValue = handValue(state.dealerCards);
  const dealerBust = dealerValue > 21;
  const dealerBlackjack = isBlackjack(state.dealerCards);

  for (const hand of state.hands) {
    if (hand.bet === 0) continue;

    // Resolve hand
    resolveOneHand(hand, "main", dealerValue, dealerBust, dealerBlackjack);

    // Resolve insurance (side bets already resolved in sidebets phase)
    if (!hand.isSplitHand && hand.insuranceBet > 0) {
      hand.insuranceGain = dealerBlackjack
        ? hand.insuranceBet * 2  // pays 2:1
        : 0; // lose (already debited)
    }
  }
}

function resolveOneHand(
  hand: Hand,
  _type: "main",
  dealerValue: number,
  dealerBust: boolean,
  dealerBlackjack: boolean
): void {
  const bet = hand.bet;

  let result: HandResult;
  let gain: number;

  if (hand.status === "bust") {
    result = "lose";
    gain = -bet;
  } else if (hand.status === "blackjack") {
    if (dealerBlackjack) {
      result = "push";
      gain = 0;
    } else {
      result = "blackjack";
      gain = Math.floor(bet * 1.5); // pays 3:2
    }
  } else {
    const playerValue = handValue(hand.cards);

    if (dealerBust) {
      result = "win";
      gain = bet;
    } else if (playerValue > dealerValue) {
      result = "win";
      gain = bet;
    } else if (playerValue === dealerValue) {
      result = "push";
      gain = 0;
    } else {
      result = "lose";
      gain = -bet;
    }
  }

  hand.result = result;
  hand.gain = gain;
}

// ============================================
// Turn Order
// ============================================

// Get hands that need to play, ordered right to left (high seat index first)
export function getPlayableHands(state: GameState): number[] {
  const indices: number[] = [];
  for (let i = 0; i < state.hands.length; i++) {
    const h = state.hands[i];
    if (h.bet > 0 && h.status === "playing") {
      indices.push(i);
    }
  }
  // Sort by seat index descending (right to left)
  indices.sort((a, b) => state.hands[b].seatIndex - state.hands[a].seatIndex);
  return indices;
}

export function getNextPlayableHand(state: GameState, afterIndex: number): number {
  const playable = getPlayableHands(state);
  const currentPos = playable.indexOf(afterIndex);
  if (currentPos === -1 || currentPos >= playable.length - 1) return -1;
  return playable[currentPos + 1];
}

// ============================================
// Total gain for a hand (all bets combined)
// ============================================

export function totalHandGain(hand: Hand): number {
  let total = 0;
  if (hand.gain !== undefined) total += hand.gain;
  if (hand.perfectPairsGain !== undefined) total += hand.perfectPairsGain;
  if (hand.twentyOnePlus3Gain !== undefined) total += hand.twentyOnePlus3Gain;
  if (hand.insuranceGain !== undefined) total += hand.insuranceGain;
  return total;
}
