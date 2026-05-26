import type { GameState } from "./types";
import { createShoe, getCutPosition } from "./engine";

export function initializeGame(): GameState {
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
