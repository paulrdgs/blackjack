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
  Plus,
  Lock,
  DoorOpen,
  Crown,
  Hash,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { logout } from "@/lib/auth/actions";
import { createRoom, createPrivateRoom, joinRoom, joinPrivateRoom } from "@/lib/play/actions";

// --- Types ---

type Room = {
  id: string;
  name: string;
  hostId: string;
  maxPlayers: number;
  playerCount: number;
  createdAt: string;
};

type PlayData = {
  currentUser: {
    id: string;
    pseudo: string;
    avatar: string | null;
    tokens: number;
  };
  rooms: Room[];
};

// --- Components ---

function CreateRoomDialog({
  isPending,
  onCreate,
}: {
  isPending: boolean;
  onCreate: (formData: FormData) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("5");

  function handleSubmit() {
    const formData = new FormData();
    formData.set("name", name);
    formData.set("maxPlayers", maxPlayers);
    formData.set("isPrivate", "false");
    onCreate(formData);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700">
        <Plus className="size-4" />
        Nouveau salon
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un salon</DialogTitle>
          <DialogDescription>
            Configurez votre salon de Blackjack
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Nom du salon</Label>
            <Input
              id="room-name"
              placeholder="Mon salon"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-players">Joueurs max. (2-5)</Label>
            <Input
              id="max-players"
              type="number"
              min={2}
              max={5}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted">
            Annuler
          </DialogClose>
          <Button
            disabled={isPending || !name.trim()}
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleSubmit}
          >
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function JoinPrivateDialog({
  isPending,
  onJoin,
}: {
  isPending: boolean;
  onJoin: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="cursor-pointer inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-card text-sm font-medium transition-colors hover:bg-muted">
        <Lock className="size-4" />
        Rejoindre partie privée
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rejoindre une partie privée</DialogTitle>
          <DialogDescription>
            Entrez le code du salon pour rejoindre
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="private-code">Code du salon</Label>
          <Input
            id="private-code"
            placeholder="Ex: AB3K9F"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="text-center text-lg font-mono tracking-widest"
            maxLength={6}
            onKeyDown={(e) => {
              if (e.key === "Enter" && code.trim()) {
                onJoin(code);
                setOpen(false);
              }
            }}
          />
        </div>
        <DialogFooter>
          <DialogClose className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted">
            Annuler
          </DialogClose>
          <Button
            disabled={isPending || !code.trim()}
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => {
              onJoin(code);
              setOpen(false);
            }}
          >
            Rejoindre
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Main ---

export function PlayClient({ data }: { data: PlayData }) {
  const { currentUser, rooms } = data;
  const initials = currentUser.pseudo.slice(0, 2).toUpperCase();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleCreatePrivate() {
    startTransition(async () => {
      const result = await createPrivateRoom();
      if (result.error) {
        toast.error(result.error);
      } else {
        router.push(`/game/${result.roomId}`);
      }
    });
  }

  function handleCreateRoom(formData: FormData) {
    startTransition(async () => {
      const result = await createRoom(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Salon créé !");
        router.refresh();
      }
    });
  }

  function handleJoinRoom(roomId: string) {
    startTransition(async () => {
      const result = await joinRoom(roomId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Vous avez rejoint le salon !");
        router.refresh();
      }
    });
  }

  function handleJoinPrivate(code: string) {
    startTransition(async () => {
      const result = await joinPrivateRoom(code);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Vous avez rejoint le salon !");
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
              <Button variant="ghost" size="sm" className="text-emerald-400">
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
                {currentUser.avatar ? <AvatarImage src={currentUser.avatar} /> : null}
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
              <DropdownMenuItem className="text-red-400" onClick={() => logout()}>
                <LogOut className="size-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold">Jouer</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Créez ou rejoignez un salon de Blackjack
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button
            disabled={isPending}
            className="h-12 bg-emerald-600 hover:bg-emerald-700"
            onClick={handleCreatePrivate}
          >
            <Swords className="size-4" />
            Créer partie privée
          </Button>
          <JoinPrivateDialog isPending={isPending} onJoin={handleJoinPrivate} />
        </div>

        {/* Rooms list */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DoorOpen className="size-4 text-emerald-400" />
                  Salons disponibles
                  <Badge variant="secondary">{rooms.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Salons publics en attente de joueurs
                </CardDescription>
              </div>
              <CreateRoomDialog isPending={isPending} onCreate={handleCreateRoom} />
            </div>
          </CardHeader>
          <CardContent>
            {rooms.length === 0 ? (
              <div className="text-center py-12">
                <Swords className="mx-auto size-10 text-muted-foreground/30" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Aucun salon disponible pour le moment.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Créez le premier salon !
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {rooms.map((room) => {
                  const isFull = room.playerCount >= room.maxPlayers;
                  const isHost = room.hostId === currentUser.id;

                  return (
                    <div
                      key={room.id}
                      className={`flex items-center justify-between rounded-xl border p-4 ${
                        isHost
                          ? "border-emerald-500/20 bg-emerald-500/5"
                          : "border-white/10 bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                          <Swords className="size-5 text-emerald-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{room.name}</p>
                            {isHost && (
                              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                                <Crown className="size-3" />
                                Hôte
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="size-3" />
                              {room.playerCount}/{room.maxPlayers}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isHost ? (
                        <Badge variant="secondary">En attente...</Badge>
                      ) : isFull ? (
                        <Badge variant="secondary">Complet</Badge>
                      ) : (
                        <Button
                          size="sm"
                          disabled={isPending}
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleJoinRoom(room.id)}
                        >
                          Rejoindre
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
