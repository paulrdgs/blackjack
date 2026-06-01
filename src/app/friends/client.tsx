"use client";

import { useState, useTransition, useEffect, useRef } from "react";
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
  UserPlus,
  Search,
  UserMinus,
  Check,
  X,
  Clock,
  Send,
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
import {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend,
} from "@/lib/friends/actions";

// --- Types ---

type Player = {
  id: string;
  pseudo: string;
  avatar: string | null;
  tokens: number;
};

type FriendRequest = {
  requestId: string;
  user: Player;
};

type FriendsData = {
  currentUser: Player;
  friends: Player[];
  receivedRequests: FriendRequest[];
  sentRequests: FriendRequest[];
};

// --- Main ---

export function FriendsClient({ data }: { data: FriendsData }) {
  const { currentUser, friends, receivedRequests, sentRequests } = data;
  const initials = currentUser.pseudo.slice(0, 2).toUpperCase();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Player[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Search users with debounce
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const data = await searchUsers(query);
      setResults(data);
      setShowResults(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSendRequest(toUserId: string, pseudo: string) {
    startTransition(async () => {
      const result = await sendFriendRequest(toUserId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Demande envoyée à ${pseudo} !`);
        setQuery("");
        setResults([]);
        setShowResults(false);
        router.refresh();
      }
    });
  }

  function handleAccept(requestId: string, pseudo: string) {
    startTransition(async () => {
      const result = await acceptFriendRequest(requestId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${pseudo} est maintenant votre ami !`);
        router.refresh();
      }
    });
  }

  function handleDecline(requestId: string) {
    startTransition(async () => {
      const result = await declineFriendRequest(requestId);
      if (result.error) {
        toast.error(result.error);
      } else {
        router.refresh();
      }
    });
  }

  function handleCancel(requestId: string) {
    startTransition(async () => {
      const result = await cancelFriendRequest(requestId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Demande annulée.");
        router.refresh();
      }
    });
  }

  function handleRemove(friendId: string, pseudo: string) {
    startTransition(async () => {
      const result = await removeFriend(friendId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${pseudo} retiré de vos amis.`);
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
              <Button variant="ghost" size="sm">
                <ShoppingBag className="size-4" />
                Boutique
              </Button>
            </Link>
            <Link href="/friends">
              <Button variant="ghost" size="sm" className="text-emerald-400">
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

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold">Amis</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {friends.length} ami{friends.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Search & add */}
        <Card className="mt-8 overflow-visible">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="size-4 text-emerald-400" />
              Ajouter un ami
            </CardTitle>
            <CardDescription>
              Recherchez un joueur par son pseudo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div ref={searchRef} className="relative z-50">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un joueur..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => results.length > 0 && setShowResults(true)}
                className="pl-9"
              />
              {/* Search results dropdown */}
              {showResults && results.length > 0 && (
                <div className="absolute z-50 mt-2 w-full rounded-xl border border-white/10 bg-popover p-1 shadow-lg">
                  {results.map((player) => {
                    const isFriend = friends.some((f) => f.id === player.id);
                    const isPendingSent = sentRequests.some((r) => r.user.id === player.id);
                    const playerInitials = player.pseudo.slice(0, 2).toUpperCase();

                    return (
                      <div
                        key={player.id}
                        className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar size="sm">
                            {player.avatar ? <AvatarImage src={player.avatar} /> : null}
                            <AvatarFallback>{playerInitials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{player.pseudo}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Coins className="size-3 text-yellow-400" />
                              {player.tokens.toLocaleString("fr-FR")}
                            </div>
                          </div>
                        </div>
                        {isFriend ? (
                          <Badge variant="secondary" className="text-xs">Ami</Badge>
                        ) : isPendingSent ? (
                          <Badge variant="secondary" className="text-xs">Envoyée</Badge>
                        ) : (
                          <Button
                            size="xs"
                            disabled={isPending}
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleSendRequest(player.id, player.pseudo)}
                          >
                            <UserPlus className="size-3" />
                            Ajouter
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {showResults && query.trim().length >= 2 && results.length === 0 && (
                <div className="absolute z-50 mt-2 w-full rounded-xl border border-white/10 bg-popover p-4 text-center text-sm text-muted-foreground shadow-lg">
                  Aucun joueur trouvé
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Received requests */}
        {receivedRequests.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="size-4 text-yellow-400" />
                Demandes reçues
                <Badge variant="secondary">{receivedRequests.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {receivedRequests.map((req) => {
                const reqInitials = req.user.pseudo.slice(0, 2).toUpperCase();
                return (
                  <div
                    key={req.requestId}
                    className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        {req.user.avatar ? <AvatarImage src={req.user.avatar} /> : null}
                        <AvatarFallback>{reqInitials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{req.user.pseudo}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Coins className="size-3 text-yellow-400" />
                          {req.user.tokens.toLocaleString("fr-FR")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon-sm"
                        disabled={isPending}
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleAccept(req.requestId, req.user.pseudo)}
                      >
                        <Check className="size-4" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="outline"
                        disabled={isPending}
                        className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                        onClick={() => handleDecline(req.requestId)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Sent requests */}
        {sentRequests.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="size-4 text-muted-foreground" />
                Demandes envoyées
                <Badge variant="secondary">{sentRequests.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sentRequests.map((req) => {
                const reqInitials = req.user.pseudo.slice(0, 2).toUpperCase();
                return (
                  <div
                    key={req.requestId}
                    className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        {req.user.avatar ? <AvatarImage src={req.user.avatar} /> : null}
                        <AvatarFallback>{reqInitials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{req.user.pseudo}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          En attente
                        </p>
                      </div>
                    </div>
                    <Button
                      size="xs"
                      variant="outline"
                      disabled={isPending}
                      className="text-muted-foreground"
                      onClick={() => handleCancel(req.requestId)}
                    >
                      Annuler
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Friends list */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              Liste d&apos;amis
              <Badge variant="secondary">{friends.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {friends.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun ami pour le moment. Recherchez un joueur pour l&apos;ajouter !
              </p>
            ) : (
              friends.map((friend) => {
                const friendInitials = friend.pseudo.slice(0, 2).toUpperCase();
                return (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        {friend.avatar ? <AvatarImage src={friend.avatar} /> : null}
                        <AvatarFallback>{friendInitials}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{friend.pseudo}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Coins className="size-3.5 text-yellow-400" />
                        <span className="font-bold">{friend.tokens.toLocaleString("fr-FR")}</span>
                      </div>
                      <Dialog>
                        <DialogTrigger className="cursor-pointer rounded-lg bg-red-500/10 p-1.5 text-red-400 border border-red-500/30 transition-colors hover:bg-red-500/20">
                          <UserMinus className="size-4" />
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Retirer {friend.pseudo} ?</DialogTitle>
                            <DialogDescription>
                              {friend.pseudo} sera retiré de votre liste d&apos;amis. Vous pourrez le ré-ajouter à tout moment.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted">
                              Annuler
                            </DialogClose>
                            <Button
                              disabled={isPending}
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleRemove(friend.id, friend.pseudo)}
                            >
                              Retirer
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
