"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Spade } from "lucide-react";

const navigation = {
  jeu: [
    { name: "Jouer", href: "/login" },
    { name: "Règles", href: "#regles" },
    { name: "Features", href: "#features" },
  ],
  compte: [
    { name: "Connexion", href: "/login" },
    { name: "Inscription", href: "/signup" },
  ],
  legal: [
    { name: "Mentions légales", href: "/terms" },
    { name: "Politique de confidentialité", href: "/terms" },
    { name: "Conditions d'utilisation", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, amount: 0.2 }}
      className="border-t border-white/10 pt-16 pb-8"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Spade className="h-6 w-6 fill-emerald-500 text-emerald-500" />
              <span className="text-lg font-bold tracking-tight">BlackJack</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Le Blackjack en ligne, gratuit et sans argent réel. Jouez, collectionnez et défiez vos amis.
            </p>
          </div>

          {/* Jeu */}
          <div>
            <h3 className="text-sm font-semibold">Jeu</h3>
            <ul className="mt-4 space-y-3">
              {navigation.jeu.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Compte */}
          <div>
            <h3 className="text-sm font-semibold">Compte</h3>
            <ul className="mt-4 space-y-3">
              {navigation.compte.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="text-sm font-semibold">Légal</h3>
            <ul className="mt-4 space-y-3">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Separator */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} BlackJack. Tous droits réservés. Aucun argent réel n&apos;est impliqué.
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
