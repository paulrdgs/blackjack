// Card representation: "2H", "KS", "AD", "10C", etc.
export type Card = string;

export type Suit = "H" | "D" | "C" | "S";
export type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";

export type HandStatus =
  | "betting"    // waiting for bet
  | "playing"    // player's turn
  | "stand"      // player chose to stand
  | "bust"       // hand exceeded 21
  | "blackjack"  // natural blackjack
  | "doubled"    // doubled down, waiting for resolution
  | "surrender"  // not used currently
  ;

export type HandResult = "win" | "lose" | "push" | "blackjack";

export type Hand = {
  seatIndex: number;
  userId: string;
  cards: Card[];
  bet: number;
  betPerfectPairs: number;
  bet21Plus3: number;
  insuranceBet: number;
  status: HandStatus;
  result?: HandResult;
  gain?: number;
  // Side bet results (only on splitIndex 0)
  perfectPairsGain?: number;
  twentyOnePlus3Gain?: number;
  insuranceGain?: number;
  // Split tracking
  splitIndex: number; // 0 = original/first hand, 1 = second hand from split
  isSplitHand: boolean; // true if this hand was created by a split
  hasSplit: boolean; // true if this hand has been split (the original)
  // Insurance decision
  insuranceDecided: boolean; // true if player has accepted or declined insurance
};

export type GamePhase =
  | "countdown"     // 60s — sit + bet
  | "dealing"       // auto-deal cards
  | "sidebets"      // resolve side bets (3s animation)
  | "insurance"     // dealer shows ace, players choose insurance
  | "player_turns"  // each hand plays
  | "dealer_turn"   // dealer reveals + draws
  | "resolution"    // calculate results
  | "results"       // show results (5s), then auto-restart
  ;

export const SIDEBETS_DURATION = 3;

export type GameState = {
  phase: GamePhase;
  phaseStartedAt: string; // ISO timestamp
  shoe: Card[];
  cutPosition: number; // index in shoe where cut card is
  cutReached: boolean;
  dealerCards: Card[];
  dealerHidden: boolean; // is hole card hidden
  hands: Hand[];
  currentHandIndex: number; // which hand is playing (-1 if not in player_turns)
  roundNumber: number;
  recorded: boolean; // true if results have been saved to DB for this round
  betsDeducted: boolean; // true if bets have been deducted for this round
  seatedPlayerCount: number; // how many seats are occupied when round starts
  readyPlayers: string[]; // user IDs who clicked "ready"
};

// Duration constants (in seconds)
export const COUNTDOWN_DURATION = 60;
export const INSURANCE_DURATION = 20;
export const ACTION_DURATION = 20;
export const RESULTS_DURATION = 8;

// Chip values available for betting
export const CHIP_VALUES = [1, 5, 25, 50, 100, 1000] as const;
