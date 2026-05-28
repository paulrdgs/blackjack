"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  CreditCard,
  Sparkles,
  CircleDollarSign,
  Tag,
  Lock,
  SlidersHorizontal,
  Check,
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { logout } from "@/lib/auth/actions";
import { borrow, repay, buySkin, sellSkin } from "@/lib/shop/actions";

// --- Skins catalog ---

const SKINS_CATALOG = [
  { id: "classique", name: "Classique", price: 0, image: "/images/skins/classique/1.png", description: "Le skin par défaut" },
];

const PRETS_OFFRES = [
  { amount: 50, repayment: 75 },
  { amount: 100, repayment: 150 },
  { amount: 200, repayment: 300 },
  { amount: 500, repayment: 750 },
  { amount: 1000, repayment: 1500 },
  { amount: 2000, repayment: 3000 },
];

// --- Types ---

type BoutiqueData = {
  user: {
    id: string;
    pseudo: string;
    avatar: string | null;
    tokens: number;
  };
  activeLoans: {
    id: string;
    amount: number;
    repayment: number;
    repaid: number;
  }[];
  ownedSkins: string[];
  hasActiveLoan: boolean;
};

// --- Main ---

function ActiveLoanItem({
  pret,
  reste,
  pct,
  userTokens,
  isPending,
  onRepay,
}: {
  pret: BoutiqueData["activeLoans"][number];
  reste: number;
  pct: number;
  userTokens: number;
  isPending: boolean;
  onRepay: (pretId: string, montant: number) => void;
}) {
  const [montant, setMontant] = useState("");
  const [open, setOpen] = useState(false);
  const value = parseInt(montant) || 0;
  const max = Math.min(reste, userTokens);

  return (
    <div className="rounded-lg bg-muted/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {pret.amount} jetons empruntés
        </p>
        <span className="text-sm font-bold text-orange-400">
          -{reste} <Coins className="inline size-3 text-yellow-400" />
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Remboursé {pret.repaid} / {pret.repayment} ({pct}%)
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="cursor-pointer rounded-lg bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 border border-red-500/30 transition-colors hover:bg-red-500/20">
            Rembourser
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rembourser le prêt</DialogTitle>
              <DialogDescription>
                Il vous reste <strong className="text-foreground">{reste} jetons</strong> à rembourser sur ce prêt de {pret.amount} jetons.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor={`remb-${pret.id}`}>Montant à rembourser</Label>
              <Input
                id={`remb-${pret.id}`}
                type="number"
                min={1}
                max={max}
                placeholder={`1 - ${max} jetons`}
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Vous avez {userTokens.toLocaleString("fr-FR")} jetons disponibles
              </p>
            </div>
            <DialogFooter>
              <DialogClose className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted">
                Annuler
              </DialogClose>
              <Button
                disabled={isPending || value < 1 || value > max}
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  onRepay(pret.id, value);
                  setOpen(false);
                }}
              >
                Confirmer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function BorrowDialog({
  offre,
  isPending,
  onBorrow,
}: {
  offre: { amount: number; repayment: number };
  isPending: boolean;
  onBorrow: (amount: number) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full cursor-pointer rounded-lg bg-emerald-600 px-2.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700">
        Emprunter
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer l&apos;emprunt</DialogTitle>
          <DialogDescription>
            Vous allez emprunter <strong className="text-foreground">{offre.amount} jetons</strong> et devrez rembourser <strong className="text-foreground">{offre.repayment} jetons</strong> (intérêt de 50%).
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted">
            Annuler
          </DialogClose>
          <Button
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => {
              onBorrow(offre.amount);
              setOpen(false);
            }}
          >
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ShopClient({ data }: { data: BoutiqueData }) {
  const { user } = data;
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const initials = user.pseudo.slice(0, 2).toUpperCase();

  function handleBorrow(montant: number) {
    startTransition(async () => {
      const result = await borrow(montant);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${montant} jetons empruntés !`);
        router.refresh();
      }
    });
  }

  function handleRepay(pretId: string, montant: number) {
    startTransition(async () => {
      const result = await repay(pretId, montant);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${montant} jetons remboursés !`);
        router.refresh();
      }
    });
  }

  function handleBuy(skinId: string, prix: number) {
    startTransition(async () => {
      const result = await buySkin(skinId, prix);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Skin acheté !");
        router.refresh();
      }
    });
  }

  function handleSell(skinId: string, prix: number) {
    startTransition(async () => {
      const result = await sellSkin(skinId, prix);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Skin revendu pour ${Math.floor(prix / 2)} jetons !`);
        router.refresh();
      }
    });
  }

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
              <Button variant="ghost" size="sm" className="text-emerald-400">
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

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Title + balance */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Boutique</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Empruntez des jetons ou personnalisez vos jetons avec des skins
            </p>
          </div>
          <div className="flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-card px-4">
            <Coins className="size-4 text-yellow-400" />
            <span className="text-lg font-bold">
              {user.tokens.toLocaleString("fr-FR")}
            </span>
            <span className="text-xs text-muted-foreground">jetons</span>
          </div>
        </div>

        {/* Prêts en cours */}
        {data.activeLoans.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-4 text-orange-400" />
                Prêt en cours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.activeLoans.map((pret) => {
                const reste = pret.repayment - pret.repaid;
                const pct = Math.round((pret.repaid / pret.repayment) * 100);
                return (
                  <ActiveLoanItem
                    key={pret.id}
                    pret={pret}
                    reste={reste}
                    pct={pct}
                    userTokens={user.tokens}
                    isPending={isPending}
                    onRepay={handleRepay}
                  />
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Offres de prêt */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleDollarSign className="size-4 text-emerald-400" />
              Emprunter des jetons
            </CardTitle>
            <CardDescription>
              Taux d&apos;intérêt fixe de 50%. Remboursez à tout moment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PRETS_OFFRES.map((offre) => (
                <div
                  key={offre.amount}
                  className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-muted/30 p-4"
                >
                  <div className="flex items-center gap-1">
                    <Coins className="size-5 text-yellow-400" />
                    <span className="text-2xl font-bold">{offre.amount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Remboursement : {offre.repayment} jetons
                  </p>
                  <BorrowDialog offre={offre} isPending={isPending} onBorrow={handleBorrow} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skins */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-emerald-400" />
              Skins de jetons
            </CardTitle>
            <CardDescription>
              Personnalisez l&apos;apparence de vos jetons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SKINS_CATALOG.map((skin) => {
                const owned = data.ownedSkins.includes(skin.id);
                const canAfford = user.tokens >= skin.price;
                const isFree = skin.price === 0;

                const isSelected = isFree; // default skin is always selected for now

                return (
                  <div
                    key={skin.id}
                    className={`relative flex flex-col items-center gap-3 rounded-xl border p-4 ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/5"
                        : "border-white/10 bg-muted/30"
                    }`}
                  >
                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-emerald-500">
                        <Check className="size-3 text-white" />
                      </div>
                    )}

                    {/* Skin preview */}
                    <img
                      src={skin.image}
                      alt={skin.name}
                      className="size-16 object-contain"
                    />

                    <div className="text-center">
                      <p className="text-sm font-semibold">{skin.name}</p>
                      <p className="text-xs text-muted-foreground">{skin.description}</p>
                    </div>

                    {isFree ? (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Équipé</Badge>
                    ) : (
                      <div className="flex items-center gap-1 text-sm font-bold">
                        <Coins className="size-3.5 text-yellow-400" />
                        {skin.price.toLocaleString("fr-FR")}
                      </div>
                    )}

                    {!isFree && (
                      owned ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-orange-400 border-orange-500/30 hover:bg-orange-500/10"
                          disabled={isPending}
                          onClick={() => handleSell(skin.id, skin.price)}
                        >
                          <Tag className="size-4" />
                          Revendre ({Math.floor(skin.price / 2)} <Coins className="inline size-3 text-yellow-400" />)
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full bg-emerald-600 hover:bg-emerald-700"
                          disabled={isPending || !canAfford}
                          onClick={() => handleBuy(skin.id, skin.price)}
                        >
                          {!canAfford ? "Pas assez de jetons" : "Acheter"}
                        </Button>
                      )
                    )}

                    {owned && !isFree && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        Possédé
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
