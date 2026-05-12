export type User = {
  id: string;
  pseudo: string;
  password_hash: string;
  avatar: string | null;
  tokens: number;
  badge_progression: number;
  badge_wins: number;
  badge_tokens: number;
  badge_blackjack: number;
  badge_first_friend: boolean;
  badge_multiplayer: boolean;
  badge_first_skin: boolean;
  created_at: string;
};

export type Game = {
  id: string;
  user_id: string;
  bet: number;
  result: "victoire" | "defaite" | "egalite" | "blackjack" | "assurance";
  gain: number;
  type: "solo" | "multi";
  created_at: string;
};

export type Loan = {
  id: string;
  user_id: string;
  amount: number;
  repayment: number;
  repaid: number;
  created_at: string;
};

export type Friend = {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
};

export type Skin = {
  id: string;
  user_id: string;
  skin_id: string;
  created_at: string;
};

export type FriendRequest = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
};
