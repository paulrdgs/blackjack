"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Spade, Eye, EyeOff, Upload, ArrowLeft, Loader2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup } from "@/lib/auth/actions";
import { toast } from "sonner";

export default function SignupPage() {
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const rules = [
    { label: "10 caractères minimum", valid: password.length >= 10 },
    { label: "1 minuscule", valid: /[a-z]/.test(password) },
    { label: "1 majuscule", valid: /[A-Z]/.test(password) },
    { label: "1 chiffre", valid: /[0-9]/.test(password) },
    { label: "1 caractère spécial", valid: /[^a-zA-Z0-9]/.test(password) },
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await signup(formData);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Back link */}
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Accueil
        </Link>

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Spade className="h-8 w-8 fill-emerald-500 text-emerald-500" />
            <span className="text-2xl font-bold tracking-tight">BlackJack</span>
          </Link>
          <p className="text-muted-foreground">
            Créez votre compte et recevez 200 jetons
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-white/10 bg-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="pseudo">Pseudo</Label>
              <Input
                id="pseudo"
                name="pseudo"
                type="text"
                placeholder="Choisissez un pseudo"
                className="h-11"
                required
                minLength={3}
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Votre mot de passe"
                  className="h-11 pr-10"
                  required
                  minLength={10}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {password.length > 0 && (
                <ul className="space-y-1 mt-2">
                  {rules.map((rule) => (
                    <li
                      key={rule.label}
                      className={`flex items-center gap-1.5 text-xs ${
                        rule.valid ? "text-emerald-400" : "text-muted-foreground"
                      }`}
                    >
                      {rule.valid ? (
                        <Check className="size-3" />
                      ) : (
                        <X className="size-3" />
                      )}
                      {rule.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirm"
                  name="confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirmez votre mot de passe"
                  className="h-11 pr-10"
                  required
                  minLength={10}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Avatar upload */}
            <div className="space-y-2">
              <Label>Avatar</Label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-white/20 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-white/40 hover:text-foreground">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Aperçu avatar"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span>
                  {avatarPreview ? "Changer l'image" : "Uploader une image"}
                </span>
                <input
                  name="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAvatarPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="h-11 w-full rounded-[50px] bg-emerald-600 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              ) : (
                "Créer mon compte"
              )}
            </button>
          </form>
        </div>

        {/* Link to connexion */}
        <p className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="font-medium text-emerald-400 transition-colors hover:text-emerald-300"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
