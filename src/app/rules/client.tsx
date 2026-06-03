"use client";

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
  BookOpen,
  Hand,
  SquareStack,
  Copy,
  Ban,
  Shield,
  Dices,
  Timer,
  Layers,
  Crown,
  AlertTriangle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/auth/actions";

// --- Data ---

const actions = [
  {
    icon: Hand,
    name: "Hit (Tirer)",
    description:
      "Piochez une carte supplémentaire pour augmenter votre score. Vous pouvez tirer autant de fois que vous voulez tant que vous ne dépassez pas 21.",
  },
  {
    icon: Ban,
    name: "Stand (Rester)",
    description:
      "Gardez votre main actuelle et passez au joueur suivant. Le croupier jouera après que tous les joueurs ont terminé.",
  },
  {
    icon: SquareStack,
    name: "Double Down (Doubler)",
    description:
      "Disponible uniquement sur vos 2 premières cartes. Doublez votre mise, recevez une seule carte supplémentaire, puis stand automatiquement.",
  },
  {
    icon: Copy,
    name: "Split (Séparer)",
    description:
      "Si vos 2 premières cartes ont la même valeur, séparez-les en 2 mains distinctes. Chaque main reçoit une carte et se joue indépendamment. Split d'As : une seule carte par main, stand automatique. Pas de re-split.",
  },
  {
    icon: Shield,
    name: "Assurance",
    description:
      "Proposée quand le croupier montre un As. Pariez jusqu'à la moitié de votre mise. Si le croupier a un Blackjack, l'assurance paie 2:1. Sinon, elle est perdue. 20 secondes pour décider.",
  },
  {
    icon: Dices,
    name: "Side Bets",
    description:
      "Mises optionnelles placées avant la distribution. Perfect Pairs : pariez sur une paire dans vos 2 premières cartes. 21+3 : pariez sur un combo poker avec vos 2 cartes + la carte visible du croupier.",
  },
];

const gains = [
  { label: "Victoire", detail: "Main supérieure au croupier", gain: "Mise × 2", color: "text-emerald-400" },
  { label: "Blackjack naturel", detail: "As + figure/10 dès la distribution", gain: "Mise × 2.5", color: "text-yellow-400" },
  { label: "Égalité (Push)", detail: "Même score que le croupier", gain: "Mise rendue", color: "text-white" },
  { label: "Défaite", detail: "Score inférieur ou bust (> 21)", gain: "Mise perdue", color: "text-red-400" },
  { label: "Assurance gagnée", detail: "Le croupier a un Blackjack", gain: "Mise ×3", color: "text-blue-400" },
];

const perfectPairs = [
  { result: "Paire mixte (couleur différente)", gain: "×5" },
  { result: "Paire colorée (même couleur)", gain: "×10" },
  { result: "Paire parfaite (même carte)", gain: "×30" },
];

const twentyOnePlusThree = [
  { result: "Flush (même enseigne)", gain: "×5" },
  { result: "Straight (suite)", gain: "×10" },
  { result: "Three of a kind (3 même valeur)", gain: "×30" },
  { result: "Straight flush (suite + même enseigne)", gain: "×40" },
  { result: "Suited trips (3 cartes identiques)", gain: "×100" },
];

// --- Types ---

type User = {
  id: string;
  pseudo: string;
  avatar: string | null;
  tokens: number;
};

// --- Main ---

export function RulesClient({ user }: { user: User }) {
  const initials = user.pseudo.slice(0, 2).toUpperCase();

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
              <Button variant="ghost" size="sm">
                <Trophy className="size-4" />
                Classement
              </Button>
            </Link>
            <Link href="/rules">
              <Button variant="ghost" size="sm" className="text-emerald-400">
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
              <DropdownMenuItem className="text-red-400" onClick={() => logout()}>
                <LogOut className="size-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold">Règles du jeu</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          L&apos;objectif : se rapprocher le plus possible de 21 sans le dépasser.
        </p>

        <div className="mt-8 space-y-8">
          {/* Card values */}
          <div className="rounded-2xl border border-white/10 bg-card p-8">
            <h3 className="text-lg font-semibold">Valeur des cartes</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-muted/30 p-4 text-center">
                <p className="text-2xl font-bold">2 - 10</p>
                <p className="mt-1 text-sm text-muted-foreground">Valeur faciale</p>
              </div>
              <div className="rounded-xl bg-muted/30 p-4 text-center">
                <p className="text-2xl font-bold">V, D, R</p>
                <p className="mt-1 text-sm text-muted-foreground">10 points</p>
              </div>
              <div className="rounded-xl bg-muted/30 p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400">As</p>
                <p className="mt-1 text-sm text-muted-foreground">1 ou 11 points</p>
              </div>
            </div>
          </div>

          {/* Game flow */}
          <div className="rounded-2xl border border-white/10 bg-card p-8">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Timer className="size-5 text-emerald-400" />
              Déroulement d&apos;une manche
            </h3>
            <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
              {[
                { step: "1", title: "Préparation & Mises (60s)", desc: "Les joueurs s'assoient, choisissent leurs jetons et placent leurs mises (principale + side bets optionnels)." },
                { step: "2", title: "Distribution", desc: "Le croupier donne 2 cartes visibles à chaque joueur ayant misé, et 2 cartes pour lui (une visible, une cachée)." },
                { step: "3", title: "Tour des joueurs (20s/action)", desc: "De droite à gauche, chaque joueur choisit ses actions : Hit, Stand, Double, Split." },
                { step: "4", title: "Tour du croupier", desc: "Le croupier révèle sa carte cachée. Il tire à 16 ou moins, reste à 17 ou plus." },
                { step: "5", title: "Résolution", desc: "Comparaison des mains, gains distribués, manche suivante." },
              ].map((item) => (
                <li key={item.step} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                    {item.step}
                  </span>
                  <span>
                    <strong className="text-foreground">{item.title}</strong> — {item.desc}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Actions */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Actions disponibles</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {actions.map((action) => (
                <div
                  key={action.name}
                  className="rounded-xl border border-white/10 bg-card p-6"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                      <action.icon className="h-4 w-4 text-emerald-400" />
                    </div>
                    <h4 className="font-semibold text-sm">{action.name}</h4>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Gains */}
          <div className="rounded-2xl border border-white/10 bg-card p-8">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Crown className="size-5 text-yellow-400" />
              Gains
            </h3>
            <div className="mt-4 space-y-2">
              {gains.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3"
                >
                  <div>
                    <p className={`text-sm font-medium ${row.color}`}>{row.label}</p>
                    <p className="text-xs text-muted-foreground">{row.detail}</p>
                  </div>
                  <span className="text-sm font-bold">{row.gain}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Side bets */}
          <div className="rounded-2xl border border-white/10 bg-card p-8">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Dices className="size-5 text-emerald-400" />
              Side Bets — Gains détaillés
            </h3>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h4 className="text-sm font-semibold text-purple-400 mb-3">Perfect Pairs</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Pariez que vos 2 premières cartes forment une paire.
                </p>
                <div className="space-y-2">
                  {perfectPairs.map((row) => (
                    <div key={row.result} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                      <span className="text-xs text-muted-foreground">{row.result}</span>
                      <span className="text-xs font-bold text-purple-400">{row.gain}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-cyan-400 mb-3">21+3</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Vos 2 cartes + la carte visible du croupier forment un combo poker.
                </p>
                <div className="space-y-2">
                  {twentyOnePlusThree.map((row) => (
                    <div key={row.result} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                      <span className="text-xs text-muted-foreground">{row.result}</span>
                      <span className="text-xs font-bold text-cyan-400">{row.gain}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dealer + Shoe */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-card p-6">
              <h4 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="size-4 text-yellow-400" />
                Règles du croupier
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Tire obligatoirement à 16 ou moins</li>
                <li>Reste (stand) à 17 ou plus</li>
                <li>Si le croupier dépasse 21 (bust), tous les joueurs encore en jeu gagnent</li>
              </ul>
            </div>
            <div className="rounded-xl border border-white/10 bg-card p-6">
              <h4 className="font-semibold flex items-center gap-2">
                <Layers className="size-4 text-emerald-400" />
                Le sabot
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>6 paquets de 52 cartes (312 cartes)</li>
                <li>Carte de coupe placée entre 60% et 80% du sabot</li>
                <li>Quand la coupe est atteinte, le sabot est remélangé après la manche</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
