"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Spade,
  Coins,
  Trophy,
  Swords,
  TrendingUp,
  ShoppingBag,
  Users,
  Star,
  Crown,
  Shield,
  Handshake,
  Palette,
  LayoutDashboard,
  Clock,
  ChevronRight,
  LogOut,
  Settings,
  CreditCard,
  BookOpen,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/auth/actions";

// --- Badge config ---

const PROGRESSION_TIERS = [1, 50, 200, 500, 1000];
const VICTORIES_TIERS = [1, 5, 10, 20, 50];
const TOKENS_TIERS = [500, 1000, 5000, 10000, 50000];
const BLACKJACK_TIERS = [1, 10, 20, 50, 100];

function getNextGoal(level: number, tiers: number[], unit: string) {
  if (level >= tiers.length) return null;
  return `${tiers[level].toLocaleString("fr-FR")} ${unit}`;
}

const chartConfig = {
  jetons: {
    label: "Jetons",
    color: "var(--color-emerald-400)",
  },
} satisfies ChartConfig;

// --- Types ---

type DashboardData = {
  user: {
    id: string;
    pseudo: string;
    avatar: string | null;
    tokens: number;
    badge_progression: number;
    badge_wins: number;
    badge_tokens: number;
    badge_blackjack: number;
    badge_first_friend: boolean;
    badge_multiplayer: boolean;
    badge_first_skin: boolean;
  };
  parties: {
    id: string;
    bet: number;
    result: string;
    gain: number;
    type: string;
    created_at: string;
  }[];
  activeLoans: {
    id: string;
    amount: number;
    repayment: number;
    repaid: number;
  }[];
  friends: {
    id: string;
    pseudo: string;
    avatar: string | null;
    tokens: number;
  }[];
  stats: {
    totalGames: number;
    wins: number;
    currentStreak: number;
    bestStreak: number;
    globalRank: number;
    friendsRank: number;
  };
  tokensHistory: { jour: string; jetons: number }[];
};

// --- Components ---

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
          <Icon className="size-5 text-emerald-400" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold leading-tight">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function ResultBadge({ resultat }: { resultat: string }) {
  if (resultat === "blackjack")
    return (
      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
        Blackjack!
      </Badge>
    );
  if (resultat === "victoire")
    return (
      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
        Victoire
      </Badge>
    );
  if (resultat === "defaite")
    return (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
        Défaite
      </Badge>
    );
  if (resultat === "assurance")
    return (
      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
        Assurance
      </Badge>
    );
  if (resultat === "egalite")
    return <Badge variant="secondary">Égalité</Badge>;
  return <Badge variant="secondary">{resultat}</Badge>;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  if (isToday) return `Aujourd'hui, ${time}`;
  if (isYesterday) return `Hier, ${time}`;
  return `${date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}, ${time}`;
}

// --- Main ---

export function DashboardClient({ data }: { data: DashboardData }) {
  const { user, parties, activeLoans, friends, stats, tokensHistory } = data;
  const winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;
  const initials = user.pseudo.slice(0, 2).toUpperCase();

  // Chart periods from history
  const allHistory = tokensHistory;
  const [chartPeriod, setChartPeriod] = useState<"7j" | "30j" | "tout">("tout");

  const chartData = chartPeriod === "tout"
    ? allHistory
    : allHistory.slice(-(chartPeriod === "7j" ? 7 : 30));

  const chartLabels = {
    "7j": "7 derniers jours",
    "30j": "30 derniers jours",
    "tout": "Depuis le début",
  };

  // Badges
  const badges = [
    {
      category: "Progression",
      icon: Shield,
      color: "text-blue-400",
      level: user.badge_progression,
      maxLevel: 5,
      next: getNextGoal(user.badge_progression, PROGRESSION_TIERS, "parties"),
    },
    {
      category: "Victoires",
      icon: Crown,
      color: "text-purple-400",
      level: user.badge_wins,
      maxLevel: 5,
      next: getNextGoal(user.badge_wins, VICTORIES_TIERS, "victoires d'affilée"),
    },
    {
      category: "Jetons",
      icon: Coins,
      color: "text-yellow-400",
      level: user.badge_tokens,
      maxLevel: 5,
      next: getNextGoal(user.badge_tokens, TOKENS_TIERS, "jetons"),
    },
    {
      category: "Blackjack",
      icon: Spade,
      color: "text-emerald-400",
      level: user.badge_blackjack,
      maxLevel: 5,
      next: getNextGoal(user.badge_blackjack, BLACKJACK_TIERS, "BJ naturels"),
    },
    ...(user.badge_first_friend
      ? [{ category: "Premier ami", icon: Handshake, color: "text-pink-400", level: 1, maxLevel: 1, next: null }]
      : []),
    ...(user.badge_multiplayer
      ? [{ category: "Multijoueur", icon: Users, color: "text-cyan-400", level: 1, maxLevel: 1, next: null }]
      : []),
    ...(user.badge_first_skin
      ? [{ category: "Premier skin", icon: Palette, color: "text-orange-400", level: 1, maxLevel: 1, next: null }]
      : []),
  ];

  const unlockedBadges = badges.filter((b) => b.level > 0).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Spade className="size-5 fill-emerald-500 text-emerald-500" />
            <span className="text-base font-bold tracking-tight">BlackJack</span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-emerald-400">
                <LayoutDashboard className="size-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/play">
              <Button variant="ghost" size="sm">
                <Swords className="size-4" />
                Jouer
              </Button>
            </Link>
            <Link href="/shop">
              <Button variant="ghost" size="sm">
                <ShoppingBag className="size-4" />
                Boutique
              </Button>
            </Link>
            <Link href="/friends">
              <Button variant="ghost" size="sm">
                <Users className="size-4" />
                Amis
              </Button>
            </Link>
            <Link href="/ranking">
              <Button variant="ghost" size="sm">
                <Trophy className="size-4" />
                Classement
              </Button>
            </Link>
            <Link href="/rules">
              <Button variant="ghost" size="sm">
                <BookOpen className="size-4" />
                Règles
              </Button>
            </Link>
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-white/5">
              <Avatar size="sm">
                {user.avatar ? <AvatarImage src={user.avatar} /> : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:block">
                {user.pseudo}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Settings className="size-4" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-400"
                onClick={() => logout()}
              >
                <LogOut className="size-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Welcome */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              {user.avatar ? <AvatarImage src={user.avatar} /> : null}
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                Salut, {user.pseudo} !
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="outline" className="text-xs">
                  <Trophy className="size-3 text-yellow-400" />
                  #{stats.globalRank} mondial
                </Badge>
                {friends.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <Users className="size-3 text-emerald-400" />
                    #{stats.friendsRank} amis
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-card px-4">
              <Coins className="size-4 text-yellow-400" />
              <span className="text-lg font-bold">
                {user.tokens.toLocaleString("fr-FR")}
              </span>
              <span className="text-xs text-muted-foreground">jetons</span>
            </div>
            <Link href="/play">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <Swords className="size-4" />
                Jouer
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={Coins}
            label="Jetons"
            value={user.tokens.toLocaleString("fr-FR")}
          />
          <StatCard
            icon={Swords}
            label="Parties jouées"
            value={stats.totalGames.toString()}
            sub={stats.totalGames > 0 ? `${winRate}% de victoires` : undefined}
          />
          <StatCard
            icon={Trophy}
            label="Victoires"
            value={stats.wins.toString()}
            sub={`Série actuelle : ${stats.currentStreak}`}
          />
          <StatCard
            icon={TrendingUp}
            label="Meilleure série"
            value={stats.bestStreak.toString()}
            sub="victoires d'affilée"
          />
        </div>

        {/* Chart */}
        {tokensHistory.length > 1 && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="size-4 text-emerald-400" />
                    Évolution des jetons
                  </CardTitle>
                  <CardDescription>{chartLabels[chartPeriod]}</CardDescription>
                </div>
                <div className="flex gap-1">
                  {(["7j", "30j", "tout"] as const).map((key) => (
                    <Button
                      key={key}
                      variant={chartPeriod === key ? "default" : "outline"}
                      size="xs"
                      onClick={() => setChartPeriod(key)}
                      className={chartPeriod === key ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                    >
                      {key === "tout" ? "Tout" : key}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillJetons" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-emerald-400)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--color-emerald-400)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-white/5" />
                  <XAxis dataKey="jour" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <Area type="monotone" dataKey="jetons" stroke="var(--color-emerald-400)" strokeWidth={2} fill="url(#fillJetons)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Main grid */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent games */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    Parties récentes
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {parties.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Aucune partie jouée pour le moment.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Mise</TableHead>
                        <TableHead>Résultat</TableHead>
                        <TableHead className="text-right">Gain</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parties.map((game) => (
                        <TableRow key={game.id}>
                          <TableCell className="text-muted-foreground">
                            {formatDate(game.created_at)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs capitalize">
                              {game.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {game.bet} <Coins className="inline size-3 text-yellow-400" />
                          </TableCell>
                          <TableCell>
                            <ResultBadge resultat={game.result} />
                          </TableCell>
                          <TableCell
                            className={`text-right font-medium ${
                              game.gain > 0
                                ? "text-emerald-400"
                                : game.gain < 0
                                  ? "text-red-400"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {game.gain > 0 ? "+" : ""}
                            {game.gain}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="size-4 text-yellow-400" />
                    Badges
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {unlockedBadges} badges débloqués
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {badges.map((badge) => (
                    <div
                      key={badge.category}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-muted/30 p-3"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
                        <badge.icon className={`size-5 ${badge.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{badge.category}</p>
                        <div className="flex gap-0.5 mt-0.5">
                          {Array.from({ length: badge.maxLevel }).map((_, i) => (
                            <Star
                              key={i}
                              className={`size-3 ${
                                i < badge.level
                                  ? `fill-current ${badge.color}`
                                  : "text-white/20"
                              }`}
                            />
                          ))}
                        </div>
                        {badge.level < badge.maxLevel && badge.next && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {badge.next}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Prêts */}
            {activeLoans.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="size-4 text-muted-foreground" />
                      Prêts en cours
                    </CardTitle>
                    <Badge variant="secondary">{activeLoans.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeLoans.map((pret) => {
                    const reste = pret.repayment - pret.repaid;
                    return (
                      <div
                        key={pret.id}
                        className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {pret.amount} jetons empruntés
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Remboursé : {pret.repaid} / {pret.repayment}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-orange-400">
                            -{reste} <Coins className="inline size-3 text-yellow-400" />
                          </span>
                          <Link href="/shop">
                            <Button size="xs" className="bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20">
                              Rembourser
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total à rembourser</span>
                    <span className="text-sm font-bold text-orange-400">
                      {activeLoans.reduce((acc, p) => acc + (p.repayment - p.repaid), 0)}{" "}
                      <Coins className="inline size-3 text-yellow-400" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Friends */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="size-4 text-muted-foreground" />
                    Amis
                    <Badge variant="secondary">{friends.length}</Badge>
                  </CardTitle>
                  {friends.length > 7 && (
                    <Button variant="ghost" size="sm">
                      Tout voir
                      <ChevronRight className="size-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {friends.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun ami pour le moment.
                  </p>
                ) : (
                  friends.slice(0, 7).map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar size="sm">
                          {friend.avatar ? <AvatarImage src={friend.avatar} /> : null}
                          <AvatarFallback>
                            {friend.pseudo.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {friend.pseudo}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Coins className="size-3 text-yellow-400" />
                        {friend.tokens.toLocaleString("fr-FR")}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
