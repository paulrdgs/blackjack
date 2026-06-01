"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Spade,
  Coins,
  Trophy,
  Swords,
  ShoppingBag,
  Users,
  LayoutDashboard,
  LogOut,
  Settings,
  Crown,
  Medal,
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/auth/actions";

// --- Types ---

type RankingPlayer = {
  id: string;
  pseudo: string;
  avatar: string | null;
  tokens: number;
};

type RankingData = {
  currentUser: RankingPlayer;
  globalRanking: RankingPlayer[];
  friendsRanking: RankingPlayer[];
  userGlobalRank: number;
};

// --- Components ---

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="flex size-8 items-center justify-center rounded-full bg-yellow-500/20">
        <Crown className="size-4 text-yellow-400" />
      </div>
    );
  if (rank === 2)
    return (
      <div className="flex size-8 items-center justify-center rounded-full bg-gray-400/20">
        <Medal className="size-4 text-gray-300" />
      </div>
    );
  if (rank === 3)
    return (
      <div className="flex size-8 items-center justify-center rounded-full bg-orange-500/20">
        <Medal className="size-4 text-orange-400" />
      </div>
    );
  return (
    <div className="flex size-8 items-center justify-center">
      <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    </div>
  );
}

function RankingRow({
  player,
  rank,
  isCurrentUser,
}: {
  player: RankingPlayer;
  rank: number;
  isCurrentUser: boolean;
}) {
  const initials = player.pseudo.slice(0, 2).toUpperCase();

  return (
    <div
      className={`flex items-center justify-between rounded-lg px-4 py-3 ${
        isCurrentUser
          ? "bg-emerald-500/10 border border-emerald-500/20"
          : "bg-muted/30"
      }`}
    >
      <div className="flex items-center gap-3">
        <RankBadge rank={rank} />
        <Avatar size="sm">
          {player.avatar ? <AvatarImage src={player.avatar} /> : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span
          className={`text-sm font-medium ${
            isCurrentUser ? "text-emerald-400" : ""
          }`}
        >
          {player.pseudo}
          {isCurrentUser && " (vous)"}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <Coins className="size-3.5 text-yellow-400" />
        <span className="text-sm font-bold">
          {player.tokens.toLocaleString("fr-FR")}
        </span>
      </div>
    </div>
  );
}

// --- Main ---

export function RankingClient({ data }: { data: RankingData }) {
  const { currentUser, globalRanking, friendsRanking, userGlobalRank } = data;
  const initials = currentUser.pseudo.slice(0, 2).toUpperCase();

  // Find user's friend rank
  const userFriendsRank =
    friendsRanking.findIndex((p) => p.id === currentUser.id) + 1 || 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Spade className="size-5 fill-emerald-500 text-emerald-500" />
            <span className="text-base font-bold tracking-tight">
              BlackJack
            </span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
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
              <Button variant="ghost" size="sm" className="text-emerald-400">
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
                {currentUser.avatar ? (
                  <AvatarImage src={currentUser.avatar} />
                ) : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:block">
                {currentUser.pseudo}
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

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Title */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Classement</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Comparez-vous aux autres joueurs
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              <Trophy className="size-3 text-yellow-400" />
              #{userGlobalRank} mondial
            </Badge>
            {friendsRanking.length > 1 && (
              <Badge variant="outline" className="text-xs">
                <Users className="size-3 text-emerald-400" />
                #{userFriendsRank} amis
              </Badge>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="global" className="mt-8">
          <TabsList>
            <TabsTrigger value="global">
              <Trophy className="size-4" />
              Mondial
            </TabsTrigger>
            <TabsTrigger value="friends">
              <Users className="size-4" />
              Amis
            </TabsTrigger>
          </TabsList>

          {/* Global */}
          <TabsContent value="global">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="size-4 text-yellow-400" />
                  Classement mondial
                </CardTitle>
                <CardDescription>Top 50 des joueurs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {globalRanking.map((player, i) => (
                  <RankingRow
                    key={player.id}
                    player={player}
                    rank={i + 1}
                    isCurrentUser={player.id === currentUser.id}
                  />
                ))}
                {!globalRanking.some((p) => p.id === currentUser.id) && (
                  <>
                    <div className="flex items-center justify-center gap-1 py-2 text-muted-foreground">
                      <span className="text-xs">•••</span>
                    </div>
                    <RankingRow
                      player={currentUser}
                      rank={userGlobalRank}
                      isCurrentUser
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Friends */}
          <TabsContent value="friends">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-4 text-emerald-400" />
                  Classement amis
                </CardTitle>
                <CardDescription>
                  {friendsRanking.length <= 1
                    ? "Ajoutez des amis pour les voir ici"
                    : `${friendsRanking.length} joueurs`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {friendsRanking.length <= 1 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Aucun ami pour le moment. Ajoutez des amis pour comparer vos
                    scores !
                  </p>
                ) : (
                  friendsRanking.map((player, i) => (
                    <RankingRow
                      key={player.id}
                      player={player}
                      rank={i + 1}
                      isCurrentUser={player.id === currentUser.id}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
