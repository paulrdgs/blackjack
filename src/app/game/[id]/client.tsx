"use client";

import Link from "next/link";
import {
  Spade,
  Coins,
  Copy,
  Check,
  ArrowLeft,
  User,
  Hand,
  Ban,
  SquareStack,
  Scissors,
  Shield,
  X,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { useState, useTransition, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { takeSeat, leaveSeat, leaveRoom, startCountdown } from "@/lib/play/actions";
import { placeBet, setReady, hit, stand, doubleDown, split, takeInsurance, declineInsurance, getFullGameState } from "@/lib/game/actions";
import { CHIP_VALUES, COUNTDOWN_DURATION, SIDEBETS_DURATION, ACTION_DURATION, INSURANCE_DURATION, RESULTS_DURATION } from "@/lib/game/types";
import type { GamePhase } from "@/lib/game/types";

// --- Types ---

type Player = {
  id: string;
  pseudo: string;
  avatar: string | null;
  tokens: number;
  seatIndex: number;
};

type GameData = {
  currentUser: {
    id: string;
    pseudo: string;
    avatar: string | null;
    tokens: number;
  };
  room: {
    id: string;
    name: string;
    code: string | null;
    isPrivate: boolean;
    hostId: string;
    maxPlayers: number;
    status: string;
    startedAt: string | null;
  };
  players: Player[];
  isHost: boolean;
  userSeats: number[];
};

type ClientGameState = {
  phase: GamePhase;
  phaseStartedAt: string;
  shoeCount: number;
  cutReached: boolean;
  dealerCards: string[];
  dealerHidden: boolean;
  hands: {
    seatIndex: number;
    userId: string;
    cards: string[];
    bet: number;
    betPerfectPairs: number;
    bet21Plus3: number;
    insuranceBet: number;
    status: string;
    result?: string;
    gain?: number;
    splitIndex: number;
    isSplitHand: boolean;
    hasSplit: boolean;
    insuranceDecided: boolean;
    perfectPairsGain?: number;
    twentyOnePlus3Gain?: number;
    insuranceGain?: number;
  }[];
  currentHandIndex: number;
  roundNumber: number;
  readyPlayers: string[];
};

// --- Seat positions ---

function computeSeatPositions(): React.CSSProperties[] {
  const totalSeats = 7;
  const styles: React.CSSProperties[] = [];
  for (let i = 0; i < totalSeats; i++) {
    const angle = 170 - (160 / (totalSeats - 1)) * i;
    const rad = (angle * Math.PI) / 180;
    const cx = 50 + Math.cos(rad) * 54;
    const cy = 0 + Math.sin(rad) * 108;
    styles.push({
      left: `${cx}%`,
      top: `${cy}%`,
      transform: "translate(-50%, -50%)",
    });
  }
  return styles;
}

const SEAT_STYLES = computeSeatPositions();

// --- Chip image based on bet amount ---

function getChipImage(amount: number): number {
  if (amount >= 1000) return 1000;
  if (amount >= 100) return 100;
  if (amount >= 50) return 50;
  if (amount >= 25) return 25;
  if (amount >= 5) return 5;
  return 1;
}

// --- Card display with animations ---

// Shoe position (top-right of table) for card dealing animation origin
const SHOE_X = 500;
const SHOE_Y = -250;

function CardDisplay({ card, small, delay = 0 }: { card: string; small?: boolean; delay?: number }) {
  if (!card) return null;

  if (card === "HIDDEN") {
    return (
      <motion.div
        initial={{ x: SHOE_X, y: SHOE_Y, opacity: 0, scale: 0.3 }}
        animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay, ease: "easeOut" }}
        className={`${small ? "w-8 h-11" : "w-12 h-16"} rounded-md border-2 border-white/30 shadow-lg`}
        style={{ background: "repeating-linear-gradient(45deg, #8b0000, #8b0000 3px, #a00000 3px, #a00000 6px)" }}
      />
    );
  }

  const suit = card.slice(-1);
  const rank = card.slice(0, -1);
  const isRed = suit === "H" || suit === "D";
  const suitSymbol = { H: "♥", D: "♦", C: "♣", S: "♠" }[suit] || "";

  return (
    <motion.div
      initial={{ x: SHOE_X, y: SHOE_Y, opacity: 0, scale: 0.3, rotateY: 180 }}
      animate={{ x: 0, y: 0, opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={`${small ? "w-8 h-11 text-[9px]" : "w-12 h-16 text-sm"} rounded-md bg-white flex flex-col items-center justify-center font-bold shadow-lg ${isRed ? "text-red-600" : "text-gray-900"}`}
    >
      <span>{rank}</span>
      <span className={small ? "text-[8px]" : "text-xs"}>{suitSymbol}</span>
    </motion.div>
  );
}

function HandCards({ cards, small, delays }: { cards: string[]; small?: boolean; delays?: number[] }) {
  if (!cards || cards.length === 0) return null;
  return (
    <div className="flex -space-x-3">
      {cards.filter(Boolean).map((card, i) => (
        <motion.div
          key={`${card}-${i}`}
          style={{ rotate: `${(i - (cards.length - 1) / 2) * 8}deg` }}
          layout
        >
          <CardDisplay card={card} small={small} delay={delays?.[i] ?? i * 0.15} />
        </motion.div>
      ))}
    </div>
  );
}

// --- Chip selector (using skin images) ---

function ChipSelector({
  selectedChip,
  onSelect,
}: {
  selectedChip: number;
  onSelect: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {CHIP_VALUES.map((value) => (
        <button
          key={value}
          onClick={() => onSelect(value)}
          className={`relative size-14 rounded-full transition-all ${
            selectedChip === value
              ? "ring-2 ring-emerald-400 scale-110 brightness-110"
              : "opacity-50 hover:opacity-90 hover:scale-105"
          }`}
        >
          <img
            src={`/images/skins/classique/${value}.png`}
            alt={`${value} jetons`}
            className="size-full object-contain"
          />
        </button>
      ))}
    </div>
  );
}

// --- Bet zones (3 circles: side bet left, main bet center, side bet right) ---

function computeBetZonePositions(): React.CSSProperties[] {
  const totalSeats = 7;
  const styles: React.CSSProperties[] = [];
  for (let i = 0; i < totalSeats; i++) {
    // Closer to the seats than before (radius 46% instead of 38%)
    const angle = 170 - (160 / (totalSeats - 1)) * i;
    const rad = (angle * Math.PI) / 180;
    const cx = 50 + Math.cos(rad) * 46;
    const cy = 0 + Math.sin(rad) * 92;
    styles.push({
      left: `${cx}%`,
      top: `${cy}%`,
      transform: "translate(-50%, -50%)",
    });
  }
  return styles;
}

const BET_ZONE_STYLES = computeBetZonePositions();

function BetCircle({
  amount,
  label,
  canBet,
  onClick,
  size = "normal",
  color = "yellow",
}: {
  amount: number;
  label: string;
  canBet: boolean;
  onClick: () => void;
  size?: "normal" | "small";
  color?: "yellow" | "purple" | "cyan";
}) {
  const s = size === "small" ? "size-10" : "size-14";
  const borderColor = {
    yellow: amount > 0 ? "border-yellow-500/50 bg-yellow-500/10" : "border-yellow-500/30",
    purple: amount > 0 ? "border-purple-500/50 bg-purple-500/10" : "border-purple-500/30",
    cyan: amount > 0 ? "border-cyan-500/50 bg-cyan-500/10" : "border-cyan-500/30",
  }[color];
  const textColor = { yellow: "text-yellow-400", purple: "text-purple-400", cyan: "text-cyan-400" }[color];

  return (
    <button
      className={`flex flex-col items-center justify-center ${s} rounded-full border-2 transition-all ${
        amount > 0
          ? borderColor
          : canBet
            ? `border-dashed ${borderColor} bg-white/5 hover:bg-white/10 cursor-pointer`
            : "border-dashed border-white/10 bg-white/5 opacity-30"
      }`}
      onClick={onClick}
      disabled={!canBet}
    >
      {amount > 0 ? (
        <motion.div
          key={amount}
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="flex flex-col items-center"
        >
          <img src={`/images/skins/classique/${getChipImage(amount)}.png`} alt="bet" className={size === "small" ? "size-5" : "size-7"} />
          <span className={`font-bold -mt-0.5 ${textColor} ${size === "small" ? "text-[8px]" : "text-[10px]"}`}>{amount}</span>
        </motion.div>
      ) : canBet ? (
        <span className={`font-bold ${textColor} ${size === "small" ? "text-[7px]" : "text-[9px]"}`}>{label}</span>
      ) : null}
    </button>
  );
}

// Compute individual positions for PP (left), Main (center), 21+3 (right) along the arc
function computeSideBetPositions(seatIndex: number, offset: number): React.CSSProperties {
  const totalSeats = 7;
  const baseAngle = 170 - (160 / (totalSeats - 1)) * seatIndex;
  const angle = baseAngle + offset; // offset in degrees: negative = left along arc, positive = right
  const rad = (angle * Math.PI) / 180;
  const cx = 50 + Math.cos(rad) * 46;
  const cy = 0 + Math.sin(rad) * 92;
  return {
    left: `${cx}%`,
    top: `${cy}%`,
    transform: "translate(-50%, -50%)",
    position: "absolute" as const,
  };
}

function BetZoneGroup({
  seatIndex,
  bet,
  betPP,
  bet213,
  ppGain,
  t3Gain,
  canBet,
  showSideBets,
  onBetMain,
  onBetPP,
  onBet213,
}: {
  seatIndex: number;
  bet: number;
  betPP: number;
  bet213: number;
  ppGain?: number;
  t3Gain?: number;
  canBet: boolean;
  showSideBets: boolean;
  onBetMain: () => void;
  onBetPP: () => void;
  onBet213: () => void;
}) {
  // Spread side bets along the arc: PP at -6°, Main at 0°, 21+3 at +6°
  const ppStyle = computeSideBetPositions(seatIndex, -6);
  const mainStyle = BET_ZONE_STYLES[seatIndex];
  const t3Style = computeSideBetPositions(seatIndex, 6);

  // During countdown: always show all 3 zones
  // During sidebets: show with results
  // After sidebets: only show if won
  const ppWon = ppGain !== undefined && ppGain > 0;
  const t3Won = t3Gain !== undefined && t3Gain > 0;
  const ppLost = ppGain !== undefined && ppGain === 0 && betPP > 0;
  const t3Lost = t3Gain !== undefined && t3Gain === 0 && bet213 > 0;

  const displayPP = showSideBets || ppWon;
  const displayT3 = showSideBets || t3Won;

  return (
    <>
      {displayPP && (
        <div style={ppStyle} className="flex flex-col items-center">
          <BetCircle amount={betPP} label="PP" canBet={canBet} onClick={onBetPP} size="small" color="purple" />
          {ppWon && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-[10px] font-bold text-purple-400 mt-0.5"
            >
              +{betPP + ppGain!}
            </motion.span>
          )}
          {ppLost && showSideBets && (
            <motion.span
              initial={{ opacity: 1 }}
              animate={{ opacity: 0, y: -15 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="text-[10px] font-bold text-red-400 mt-0.5"
            >
              -{betPP}
            </motion.span>
          )}
        </div>
      )}
      <div className="absolute" style={mainStyle}>
        <BetCircle amount={bet} label="Mise" canBet={canBet} onClick={onBetMain} size="normal" color="yellow" />
      </div>
      {displayT3 && (
        <div style={t3Style} className="flex flex-col items-center">
          <BetCircle amount={bet213} label="21+3" canBet={canBet} onClick={onBet213} size="small" color="cyan" />
          {t3Won && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-[10px] font-bold text-cyan-400 mt-0.5"
            >
              +{bet213 + t3Gain!}
            </motion.span>
          )}
          {t3Lost && showSideBets && (
            <motion.span
              initial={{ opacity: 1 }}
              animate={{ opacity: 0, y: -15 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="text-[10px] font-bold text-red-400 mt-0.5"
            >
              -{bet213}
            </motion.span>
          )}
        </div>
      )}
    </>
  );
}

// --- Timer ---

function useTimer(startedAt: string | null, duration: number) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!startedAt) { setSecondsLeft(null); return; }
    function tick() {
      const elapsed = Math.floor((Date.now() - new Date(startedAt!).getTime()) / 1000);
      setSecondsLeft(Math.max(0, duration - elapsed));
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt, duration]);

  return secondsLeft;
}

// --- CopyCode ---

function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copié !");
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={handleCopy} className="flex items-center gap-2 rounded-lg border border-white/10 bg-card px-3 py-1.5 text-sm font-mono tracking-widest transition-colors hover:bg-muted">
      <span className="text-muted-foreground text-xs font-sans">Code :</span>
      <span className="font-bold">{code}</span>
      {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5 text-muted-foreground" />}
    </button>
  );
}

// --- Hand value display ---

function getHandValueDisplay(cards: string[]): string {
  if (!cards || cards.length === 0) return "";

  let total = 0;
  let aces = 0;

  for (const card of cards) {
    if (!card || card === "HIDDEN") continue;
    const rank = card.slice(0, -1);
    if (rank === "A") { total += 11; aces++; }
    else if (["K", "Q", "J"].includes(rank)) total += 10;
    else total += parseInt(rank);
  }

  // Reduce aces from 11 to 1 while bust
  let high = total;
  let acesReduced = 0;
  while (high > 21 && acesReduced < aces) { high -= 10; acesReduced++; }

  const low = high - 10; // one more ace reduced

  // If there's still an ace counted as 11 (and reducing it would give a different valid value)
  if (acesReduced < aces && high <= 21 && low > 0 && low !== high) {
    return `${low} ou ${high}`;
  }

  return `${high}`;
}

// --- Player cards on table (positioned above bet zones) ---

// --- Compute deal order delays ---
// Casino deal: 1st card to each player (right to left), then dealer,
// then 2nd card to each player (right to left), then dealer hole card.
// Returns a map: `${seatIndex}-${cardIndex}` → delay in seconds
// Also "dealer-0" and "dealer-1" for dealer cards.

function computeDealDelays(hands: ClientGameState["hands"][]): Map<string, number> {
  const delays = new Map<string, number>();
  const CARD_INTERVAL = 0.3; // seconds between each card

  // Get active seats sorted by seatIndex descending (right to left)
  const activeSeats = [...new Set(hands.flat().filter(h => h.cards.length > 0).map(h => h.seatIndex))].sort((a, b) => b - a);

  let order = 0;

  // Round 1: first card to each player, then dealer
  for (const seat of activeSeats) {
    delays.set(`${seat}-0`, order * CARD_INTERVAL);
    order++;
  }
  delays.set("dealer-0", order * CARD_INTERVAL);
  order++;

  // Round 2: second card to each player, then dealer (hole card)
  for (const seat of activeSeats) {
    delays.set(`${seat}-1`, order * CARD_INTERVAL);
    order++;
  }
  delays.set("dealer-1", order * CARD_INTERVAL);

  return delays;
}

function computeCardPositions(): React.CSSProperties[] {
  const totalSeats = 7;
  const styles: React.CSSProperties[] = [];
  for (let i = 0; i < totalSeats; i++) {
    // Between bet zone and center — radius 34%
    const angle = 170 - (160 / (totalSeats - 1)) * i;
    const rad = (angle * Math.PI) / 180;
    const cx = 50 + Math.cos(rad) * 34;
    const cy = 0 + Math.sin(rad) * 68;
    styles.push({
      left: `${cx}%`,
      top: `${cy}%`,
      transform: "translate(-50%, -50%)",
    });
  }
  return styles;
}

const CARD_POSITIONS = computeCardPositions();

function PlayerCardsOnTable({
  seatIndex,
  hand,
  isCurrentTurn,
  offsetX = 0,
  dimmed,
  cardDelays,
}: {
  seatIndex: number;
  hand: ClientGameState["hands"][number];
  isCurrentTurn: boolean;
  offsetX?: number;
  dimmed?: boolean;
  cardDelays?: number[];
}) {
  if (!hand || hand.cards.length === 0) return null;
  const baseStyle = CARD_POSITIONS[seatIndex];
  const style = offsetX !== 0
    ? { ...baseStyle, left: `calc(${baseStyle.left} + ${offsetX}px)` }
    : baseStyle;

  const valueDisplay = getHandValueDisplay(hand.cards);

  // Delay the value display until after the last card is dealt
  const maxDelay = cardDelays ? Math.max(...cardDelays) + 0.5 : 0;

  return (
    <div className={`absolute flex flex-col items-center ${isCurrentTurn ? "z-20" : ""} ${dimmed ? "opacity-40" : ""}`} style={style}>
      {/* Hand value */}
      {valueDisplay && (
        <motion.div
          key={valueDisplay}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: maxDelay }}
          className={`mb-1 rounded-full px-2.5 py-0.5 text-xs font-bold shadow ${
            hand.status === "bust" ? "bg-red-600 text-white"
            : hand.status === "blackjack" ? "bg-yellow-500 text-black"
            : isCurrentTurn ? "bg-white text-black"
            : "bg-black/60 text-white"
          }`}
        >
          {hand.status === "bust" ? `${valueDisplay} 💥` : hand.status === "blackjack" ? `BJ! ${valueDisplay}` : valueDisplay}
        </motion.div>
      )}

      {/* Cards */}
      <HandCards cards={hand.cards} delays={cardDelays} />

      {/* Result badge */}
      <AnimatePresence>
        {hand.result && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Badge className={`mt-1 text-xs ${
              hand.result === "win" || hand.result === "blackjack" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              : hand.result === "push" ? "bg-white/10 text-white border-white/20"
              : "bg-red-500/20 text-red-400 border-red-500/30"
            }`}>
              {hand.result === "blackjack" ? `BJ! +${Math.floor(hand.bet * 2.5)}`
                : hand.result === "win" ? `+${hand.bet * 2}`
                : hand.result === "push" ? `Push +${hand.bet}`
                : `-${hand.bet}`}
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Seat ---

function Seat({
  index, player, isCurrentUser, onSit, onLeave, isPending, isCurrentTurn,
}: {
  index: number; player?: Player; isCurrentUser: boolean;
  onSit: (i: number) => void; onLeave: (i: number) => void;
  isPending: boolean; isCurrentTurn: boolean;
}) {
  const style = SEAT_STYLES[index];

  if (player && isCurrentUser) {
    return (
      <div className="absolute flex flex-col items-center transition-all duration-300" style={style}>
        <button onClick={() => onLeave(index)} disabled={isPending} className="group cursor-pointer">
          <Avatar className={`size-12 ring-2 transition-all ${isCurrentTurn ? "ring-yellow-400 animate-pulse" : "ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]"} group-hover:ring-red-400`}>
            {player.avatar ? <AvatarImage src={player.avatar} /> : null}
            <AvatarFallback className="text-sm bg-emerald-900 text-emerald-300">
              {player.pseudo.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
        <span className="mt-1 text-xs whitespace-nowrap font-bold text-emerald-400 drop-shadow">{player.pseudo}</span>
      </div>
    );
  }

  if (player) {
    return (
      <div className="absolute flex flex-col items-center transition-all duration-300" style={style}>
        <Avatar className={`size-12 ring-2 ${isCurrentTurn ? "ring-yellow-400 animate-pulse" : "ring-emerald-700"}`}>
          {player.avatar ? <AvatarImage src={player.avatar} /> : null}
          <AvatarFallback className="text-sm bg-emerald-900 text-emerald-300">{player.pseudo.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="mt-1 text-xs whitespace-nowrap font-bold text-white drop-shadow">{player.pseudo}</span>
      </div>
    );
  }

  // Empty seat
  return (
    <button className="absolute flex flex-col items-center group cursor-pointer transition-all duration-300" style={style}
      onClick={() => onSit(index)} disabled={isPending}>
      <div className="flex size-12 items-center justify-center rounded-full border-2 border-dashed border-emerald-500/30 bg-emerald-500/5 transition-all group-hover:border-emerald-400 group-hover:bg-emerald-500/15">
        <User className="size-5 text-emerald-500/30 group-hover:text-emerald-400 transition-colors" />
      </div>
      <span className="mt-1 text-[10px] font-bold text-emerald-500/30 group-hover:text-emerald-400 transition-colors">S&apos;asseoir</span>
    </button>
  );
}

// ============================================
// Main Component
// ============================================

export function GameClient({ data }: { data: GameData }) {
  const { currentUser, room, players, isHost, userSeats } = data;
  const [isPending, startTransition] = useTransition();
  const [gameState, setGameState] = useState<ClientGameState | null>(null);
  const [liveTokens, setLiveTokens] = useState(currentUser.tokens);
  const [selectedChip, setSelectedChip] = useState(5);
  const [bets, setBets] = useState<Record<number, number>>({});
  const [betsPP, setBetsPP] = useState<Record<number, number>>({});
  const [bets213, setBets213] = useState<Record<number, number>>({});
  const [lastBets, setLastBets] = useState<{ main: Record<number, number>; pp: Record<number, number>; t3: Record<number, number> } | null>(null);
  const router = useRouter();

  // Poll game state
  useEffect(() => {
    if (room.status !== "playing" && room.status !== "countdown") return;

    let prevRound = 0;
    async function poll() {
      const result = await getFullGameState(room.id);
      if (result) {
        const gs = result.state as unknown as ClientGameState;
        setGameState(gs);
        setLiveTokens(result.userTokens);
        // Save last bets and reset when new round starts
        if (gs.roundNumber !== prevRound) {
          if (prevRound > 0 && (Object.keys(bets).length > 0)) {
            setLastBets({ main: { ...bets }, pp: { ...betsPP }, t3: { ...bets213 } });
          }
          prevRound = gs.roundNumber;
          setBets({});
          setBetsPP({});
          setBets213({});
        }
      }
    }

    poll();
    const interval = setInterval(poll, 1500);
    return () => clearInterval(interval);
  }, [room.id, room.status]);

  const phase = gameState?.phase;
  const timerDuration = phase === "countdown" ? COUNTDOWN_DURATION
    : phase === "sidebets" ? SIDEBETS_DURATION
    : phase === "insurance" ? INSURANCE_DURATION
    : phase === "player_turns" ? ACTION_DURATION
    : phase === "results" ? RESULTS_DURATION
    : 0;

  const secondsLeft = useTimer(gameState?.phaseStartedAt ?? null, timerDuration);

  // Insurance: which seat is the current user deciding for?
  const insuranceActiveSeat = phase === "insurance"
    ? gameState?.hands.find(
        (h) => h.userId === currentUser.id && h.bet > 0 && !h.isSplitHand && !h.insuranceDecided
      )?.seatIndex ?? -1
    : -1;

  // Current hand being played
  const currentHand = gameState && gameState.currentHandIndex >= 0
    ? gameState.hands[gameState.currentHandIndex]
    : null;
  const isMyTurn = currentHand?.userId === currentUser.id;

  // Can I do actions?
  const canHit = isMyTurn && phase === "player_turns" && currentHand?.status === "playing";
  const canDouble = canHit && currentHand?.cards.length === 2;
  const canSplit = canDouble && currentHand?.cards.length === 2 && (() => {
    const c = currentHand.cards;
    if (c.length !== 2) return false;
    return c[0].slice(0, -1) === c[1].slice(0, -1);
  })() && !currentHand?.hasSplit && !currentHand?.isSplitHand;

  function handleSit(seatIndex: number) {
    startTransition(async () => {
      const result = await takeSeat(room.id, seatIndex);
      if (result.error) toast.error(result.error);
      else router.refresh();
    });
  }

  function handleLeave(seatIndex: number) {
    startTransition(async () => {
      await leaveSeat(room.id, seatIndex);
      router.refresh();
    });
  }

  function handleQuitRoom() {
    startTransition(async () => {
      await leaveRoom(room.id);
      router.push("/play");
    });
  }

  function handleStartCountdown() {
    startTransition(async () => {
      const result = await startCountdown(room.id);
      if (result.error) toast.error(result.error);
      else router.refresh();
    });
  }

  function handlePlaceBet(seatIndex: number, type: "main" | "pp" | "213" = "main") {
    const currentMain = bets[seatIndex] || 0;
    const currentPP = betsPP[seatIndex] || 0;
    const current213 = bets213[seatIndex] || 0;

    let newMain = currentMain;
    let newPP = currentPP;
    let new213 = current213;

    if (type === "main") { newMain += selectedChip; setBets({ ...bets, [seatIndex]: newMain }); }
    if (type === "pp") { newPP += selectedChip; setBetsPP({ ...betsPP, [seatIndex]: newPP }); }
    if (type === "213") { new213 += selectedChip; setBets213({ ...bets213, [seatIndex]: new213 }); }

    startTransition(async () => {
      const result = await placeBet(room.id, seatIndex, newMain, newPP, new213);
      if (result.error) {
        toast.error(result.error);
        // revert
        if (type === "main") setBets({ ...bets, [seatIndex]: currentMain });
        if (type === "pp") setBetsPP({ ...betsPP, [seatIndex]: currentPP });
        if (type === "213") setBets213({ ...bets213, [seatIndex]: current213 });
      }
    });
  }

  function handleHit() {
    startTransition(async () => {
      const result = await hit(room.id);
      if (result.error) toast.error(result.error);
    });
  }

  function handleStand() {
    startTransition(async () => {
      const result = await stand(room.id);
      if (result.error) toast.error(result.error);
    });
  }

  function handleDouble() {
    startTransition(async () => {
      const result = await doubleDown(room.id);
      if (result.error) toast.error(result.error);
    });
  }

  function handleSplit() {
    startTransition(async () => {
      const result = await split(room.id);
      if (result.error) toast.error(result.error);
    });
  }

  function handleTakeInsurance(seatIndex: number) {
    startTransition(async () => {
      const result = await takeInsurance(room.id, seatIndex);
      if (result.error) toast.error(result.error);
    });
  }

  function handleDeclineInsurance(seatIndex: number) {
    startTransition(async () => {
      const result = await declineInsurance(room.id, seatIndex);
      if (result.error) toast.error(result.error);
    });
  }

  function handleClearBets() {
    // Reset all bets to 0 for all my seats
    const mySeats = userSeats;
    for (const seat of mySeats) {
      startTransition(async () => {
        await placeBet(room.id, seat, 0, 0, 0);
      });
    }
    setBets({});
    setBetsPP({});
    setBets213({});
  }

  function handleRepeatBets() {
    if (!lastBets) return;
    // Replay the same bets from last round
    for (const seatStr of Object.keys(lastBets.main)) {
      const seat = parseInt(seatStr);
      const main = lastBets.main[seat] || 0;
      const pp = lastBets.pp[seat] || 0;
      const t3 = lastBets.t3[seat] || 0;
      if (main > 0 || pp > 0 || t3 > 0) {
        setBets((prev) => ({ ...prev, [seat]: main }));
        setBetsPP((prev) => ({ ...prev, [seat]: pp }));
        setBets213((prev) => ({ ...prev, [seat]: t3 }));
        startTransition(async () => {
          await placeBet(room.id, seat, main, pp, t3);
        });
      }
    }
  }

  function handleReady() {
    startTransition(async () => {
      const result = await setReady(room.id);
      if (result.error) toast.error(result.error);
    });
  }

  const isGameActive = room.status === "playing" || gameState !== null;

  return (
    <div className="flex min-h-screen flex-col bg-[#0d0d1a]">
      {/* Top bar */}
      <header className="flex h-14 items-center justify-between border-b border-white/10 bg-[#0d0d1a]/80 backdrop-blur-md px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleQuitRoom} disabled={isPending}>
            <ArrowLeft className="size-4" />
            Quitter
          </Button>
          <div className="hidden sm:flex items-center gap-2">
            <Spade className="size-4 fill-emerald-500 text-emerald-500" />
            <span className="text-sm font-bold">{room.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {room.code && <CopyCodeButton code={room.code} />}
          {gameState && (
            <Badge variant="outline" className="text-xs">
              {gameState.shoeCount} cartes
            </Badge>
          )}
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-card px-3 py-1.5">
            <Coins className="size-3.5 text-yellow-400" />
            <span className="text-sm font-bold">{liveTokens.toLocaleString("fr-FR")}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Chip selector (left side, only during countdown when seated) */}
        <AnimatePresence>
          {phase === "countdown" && userSeats.length > 0 && (
            <motion.div
              initial={{ x: -80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="flex flex-col items-center justify-center gap-2 px-4 py-8"
            >
              <span className="text-[10px] text-muted-foreground mb-1">Jetons</span>
              <ChipSelector selectedChip={selectedChip} onSelect={setSelectedChip} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game area */}
        <div className="flex flex-1 items-start justify-center pt-16 pb-4 px-4" style={{ perspective: "1000px" }}>
          <div className="relative w-full max-w-[1100px]" style={{ height: "550px", transform: "rotateX(18deg)" }}>
            {/* Table felt */}
            <div className="relative w-full h-full overflow-hidden" style={{
              background: "radial-gradient(ellipse at 50% 30%, #2d8a4e 0%, #1a5c2a 50%, #0f3d1a 100%)",
              borderRadius: "0 0 550px 550px",
              border: "16px solid #5c3a1e",
              boxShadow: "0 8px 40px rgba(0,0,0,0.6), inset 0 0 100px rgba(0,0,0,0.3), 0 2px 0 0 #7a4f2e, 0 4px 0 0 #4a2a10",
            }}>
              {/* Gold arc */}
              <div className="absolute" style={{ top: "30px", left: "50%", transform: "translateX(-50%)", width: "700px", height: "220px", border: "2px solid rgba(212,175,55,0.3)", borderRadius: "0 0 350px 350px", borderTop: "none" }} />

              {/* Table text */}
              <div className="absolute text-center flex flex-col items-center gap-1" style={{ top: "90px", left: "50%", transform: "translateX(-50%)" }}>
                <span className="text-sm tracking-[6px]" style={{ color: "rgba(0,0,0,0.4)" }}>BLACKJACK PAYS 3 TO 2</span>
                <span className="text-xs tracking-[4px]" style={{ color: "rgba(0,0,0,0.3)" }}>DEALER MUST DRAW TO 16 AND STAND ON 17</span>
              </div>

              {/* Dealer cards */}
              <AnimatePresence>
                {gameState && gameState.dealerCards.length > 0 && (() => {
                  const dealDelays = computeDealDelays([gameState.hands]);
                  const dealerDelays = gameState.dealerCards.map((_, ci) => dealDelays.get(`dealer-${ci}`) ?? ci * 0.3);
                  const maxDealerDelay = Math.max(...dealerDelays) + 0.5;

                  return (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute flex flex-col items-center"
                      style={{ top: "10px", left: "50%", transform: "translateX(-50%)" }}
                    >
                      {/* Dealer value */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: maxDealerDelay }}
                        className="mb-1 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-bold text-white"
                      >
                        {gameState.dealerHidden
                          ? getHandValueDisplay([gameState.dealerCards[0]])
                          : getHandValueDisplay(gameState.dealerCards)}
                      </motion.div>
                      <HandCards cards={gameState.dealerCards} delays={dealerDelays} />
                    </motion.div>
                  );
                })()}
              </AnimatePresence>

              {/* Countdown / phase info on table */}
              <div className="absolute" style={{ top: "40%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 5 }}>
              <AnimatePresence mode="wait">
                {phase === "countdown" && secondsLeft !== null && (
                  <motion.div
                    key="countdown"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center"
                  >
                    <motion.span
                      key={secondsLeft}
                      initial={{ scale: 1.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`text-5xl font-bold tabular-nums ${secondsLeft <= 10 ? "text-red-400" : "text-white"}`}
                    >
                      {secondsLeft}
                    </motion.span>
                    <span className="text-xs text-white/50 mt-1 tracking-wider uppercase">Placez vos mises</span>
                  </motion.div>
                )}

                {phase === "player_turns" && secondsLeft !== null && (
                  <motion.div key="player-timer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                    <motion.span key={secondsLeft} initial={{ scale: 1.2, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }}
                      className={`text-3xl font-bold tabular-nums ${secondsLeft <= 5 ? "text-red-400" : "text-white/60"}`}>{secondsLeft}</motion.span>
                  </motion.div>
                )}

                {phase === "results" && (
                  <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="flex flex-col items-center">
                    <span className="text-xl font-bold text-white/40">Manche terminée</span>
                  </motion.div>
                )}

                {phase === "dealer_turn" && (
                  <motion.div key="dealer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                    <span className="text-lg font-bold text-white/40">Tour du croupier</span>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>

              {/* Shoe */}
              <div className="absolute" style={{ top: "15px", right: "80px", width: "70px", height: "45px", background: "linear-gradient(135deg,#2c2c2c,#1a1a1a)", borderRadius: "5px", border: "2px solid #444", boxShadow: "2px 3px 10px rgba(0,0,0,0.6)" }}>
                <div style={{ position: "absolute", top: "3px", left: "3px", width: "40px", height: "38px", background: "repeating-linear-gradient(90deg,#f0f0f0 0px,#f0f0f0 1px,#ddd 1px,#ddd 3px)", borderRadius: "3px" }} />
              </div>
            </div>

            {/* Bet zones (on the table, inside the felt) */}
            {Array.from({ length: 7 }).map((_, i) => {
              const player = players.find((p) => p.seatIndex === i);
              if (!player) return null;
              const hand = gameState?.hands.find((h) => h.seatIndex === i);
              const isOwn = player.id === currentUser.id;
              const canBet = isOwn && phase === "countdown";

              const showSB = !phase || phase === "countdown" || phase === "sidebets";

              return (
                <BetZoneGroup
                  key={`bet-${i}`}
                  seatIndex={i}
                  bet={hand?.bet ?? bets[i] ?? 0}
                  betPP={hand?.betPerfectPairs ?? betsPP[i] ?? 0}
                  bet213={hand?.bet21Plus3 ?? bets213[i] ?? 0}
                  ppGain={hand?.perfectPairsGain}
                  t3Gain={hand?.twentyOnePlus3Gain}
                  canBet={canBet}
                  showSideBets={showSB}
                  onBetMain={() => handlePlaceBet(i, "main")}
                  onBetPP={() => handlePlaceBet(i, "pp")}
                  onBet213={() => handlePlaceBet(i, "213")}
                />
              );
            })}

            {/* Player cards on table */}
            {(() => {
              // Compute deal delays once for all hands
              const dealDelays = gameState ? computeDealDelays([gameState.hands]) : new Map<string, number>();

              return gameState?.hands.map((hand, idx) => {
                const isCurrentTurn = gameState.currentHandIndex === idx;
                const isDimmed = (phase === "player_turns" && !isCurrentTurn)
                  || (phase === "insurance" && hand.seatIndex !== insuranceActiveSeat);

                // Get delays for this hand's cards
                const cardDelays = hand.cards.map((_, ci) => dealDelays.get(`${hand.seatIndex}-${ci}`) ?? ci * 0.15);

                return (
                  <PlayerCardsOnTable
                    key={`cards-${hand.seatIndex}-${hand.splitIndex}`}
                    seatIndex={hand.seatIndex}
                    hand={hand}
                    isCurrentTurn={isCurrentTurn}
                    offsetX={hand.hasSplit ? -40 : hand.isSplitHand ? 40 : 0}
                    dimmed={isDimmed}
                    cardDelays={cardDelays}
                  />
                );
              });
            })()}

            {/* Seats */}
            {Array.from({ length: 7 }).map((_, i) => {
              const player = players.find((p) => p.seatIndex === i);
              const isCurrentTurn = gameState?.currentHandIndex !== undefined &&
                gameState.currentHandIndex >= 0 &&
                gameState.hands[gameState.currentHandIndex]?.seatIndex === i;
              const isDimmedSeat = (phase === "player_turns" && !isCurrentTurn && player)
                || (phase === "insurance" && player && i !== insuranceActiveSeat);

              return (
                <div key={i} className={isDimmedSeat ? "opacity-40 transition-opacity" : "transition-opacity"}>
                  <Seat index={i} player={player}
                    isCurrentUser={player?.id === currentUser.id}
                    onSit={handleSit}
                    onLeave={handleLeave} isPending={isPending}
                    isCurrentTurn={isCurrentTurn} />
                </div>
              );
            })}

            {/* Action buttons — centered on the table */}
            <AnimatePresence>
              {phase === "player_turns" && isMyTurn && currentHand?.status === "playing" && (
                <motion.div
                  key="action-overlay"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute z-30 flex items-center gap-3"
                  style={{ top: "45%", left: "50%", transform: "translate(-50%, -50%)" }}
                >
                  <button
                    onClick={handleHit}
                    disabled={isPending}
                    className="flex size-20 flex-col items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-xl hover:bg-emerald-500 transition-colors disabled:opacity-50"
                  >
                    <Hand className="size-6 mb-1" />
                    Hit
                  </button>
                  <button
                    onClick={handleStand}
                    disabled={isPending}
                    className="flex size-20 flex-col items-center justify-center rounded-xl bg-white/10 text-white font-bold text-sm shadow-xl border border-white/20 hover:bg-white/20 backdrop-blur transition-colors disabled:opacity-50"
                  >
                    <Ban className="size-6 mb-1" />
                    Stand
                  </button>
                  {canDouble && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.05 }}
                      onClick={handleDouble}
                      disabled={isPending}
                      className="flex size-20 flex-col items-center justify-center rounded-xl bg-yellow-600 text-white font-bold text-sm shadow-xl hover:bg-yellow-500 transition-colors disabled:opacity-50"
                    >
                      <SquareStack className="size-6 mb-1" />
                      Double
                    </motion.button>
                  )}
                  {canSplit && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                      onClick={handleSplit}
                      disabled={isPending}
                      className="flex size-20 flex-col items-center justify-center rounded-xl bg-purple-600 text-white font-bold text-sm shadow-xl hover:bg-purple-500 transition-colors disabled:opacity-50"
                    >
                      <Scissors className="size-6 mb-1" />
                      Split
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Insurance buttons — centered on the table */}
            <AnimatePresence>
              {phase === "insurance" && (() => {
                // Find the first hand of the current user that needs insurance decision
                const myHandsNeedingDecision = gameState?.hands.filter(
                  (h) => h.userId === currentUser.id && h.bet > 0 && !h.isSplitHand && !h.insuranceDecided
                ) ?? [];
                const handToDecide = myHandsNeedingDecision[0];

                if (!handToDecide) return null;

                const insuranceCost = Math.floor(handToDecide.bet / 2);

                return (
                  <motion.div
                    key={`insurance-${handToDecide.seatIndex}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute z-30 flex flex-col items-center gap-3"
                    style={{ top: "42%", left: "50%", transform: "translate(-50%, -50%)" }}
                  >
                    <div className="rounded-xl bg-black/70 backdrop-blur px-4 py-2 text-center">
                      <p className="text-sm font-bold text-white">Assurance ?</p>
                      <p className="text-xs text-white/60">
                        Siège {handToDecide.seatIndex + 1} — Coût : {insuranceCost} jetons
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleTakeInsurance(handToDecide.seatIndex)}
                        disabled={isPending}
                        className="flex size-20 flex-col items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xl hover:bg-blue-500 transition-colors disabled:opacity-50"
                      >
                        <Shield className="size-6 mb-1" />
                        Oui
                      </button>
                      <button
                        onClick={() => handleDeclineInsurance(handToDecide.seatIndex)}
                        disabled={isPending}
                        className="flex size-20 flex-col items-center justify-center rounded-xl bg-white/10 text-white font-bold text-sm shadow-xl border border-white/20 hover:bg-white/20 backdrop-blur transition-colors disabled:opacity-50"
                      >
                        <X className="size-6 mb-1" />
                        Non
                      </button>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-center gap-3 border-t border-white/10 bg-[#0d0d1a] px-4 py-3">
        <Badge variant="outline" className="text-xs">
          {players.length} / {room.maxPlayers} joueurs
        </Badge>

        {/* Pre-game: waiting */}
        {room.status === "waiting" && !gameState && (
          <>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">En attente</Badge>
            {isHost && (
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700"
                disabled={players.length === 0 || isPending} onClick={handleStartCountdown}>
                Lancer la partie
              </Button>
            )}
          </>
        )}

        {/* Countdown */}
        {phase === "countdown" && secondsLeft !== null && (
          <>
            <Badge className={`text-xs ${secondsLeft <= 10 ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"}`}>
              Mises : {secondsLeft}s
            </Badge>

            {/* Repeat last bet */}
            {lastBets && userSeats.length > 0 && !gameState?.hands.some((h) => h.userId === currentUser.id && h.bet > 0) && (
              <Button size="sm" variant="outline" disabled={isPending} onClick={handleRepeatBets}>
                <RotateCcw className="size-4" />
                Même mise
              </Button>
            )}

            {/* Clear bets */}
            {gameState && gameState.hands.some((h) => h.userId === currentUser.id && h.bet > 0) && (
              <Button size="sm" variant="outline" className="text-red-400 border-red-500/30 hover:bg-red-500/10" disabled={isPending} onClick={handleClearBets}>
                <Trash2 className="size-4" />
                Retirer
              </Button>
            )}

            {/* Ready */}
            {gameState && gameState.hands.some((h) => h.userId === currentUser.id && h.bet > 0) && (
              gameState.readyPlayers.includes(currentUser.id) ? (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                  <Check className="size-3" />
                  Prêt
                </Badge>
              ) : (
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" disabled={isPending} onClick={handleReady}>
                  <Check className="size-4" />
                  Prêt
                </Button>
              )
            )}
          </>
        )}

        {phase === "player_turns" && !isMyTurn && (
          <Badge variant="secondary" className="text-xs">En attente du joueur...</Badge>
        )}

        {phase === "player_turns" && isMyTurn && (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
            À vous de jouer !
          </Badge>
        )}

        {phase === "sidebets" && (
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
            Résolution des side bets...
          </Badge>
        )}

        {phase === "dealer_turn" && (
          <Badge variant="secondary" className="text-xs">Tour du croupier...</Badge>
        )}

        {phase === "results" && secondsLeft !== null && (
          <Badge className="bg-white/10 text-white border-white/20 text-xs">
            Prochaine manche dans {secondsLeft}s
          </Badge>
        )}

        {phase === "insurance" && secondsLeft !== null && (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
            Assurance ({secondsLeft}s)
          </Badge>
        )}
      </div>
    </div>
  );
}
