"use client";

import { motion } from "framer-motion";
import {
  Trophy,
  ShoppingBag,
  Palette,
  UserPlus,
  Gamepad2,
  Award,
} from "lucide-react";

const features = [
  {
    icon: Gamepad2,
    title: "Parties en temps réel",
    description: "Jouez en solo contre le croupier ou en multijoueur avec vos amis.",
  },
  {
    icon: Trophy,
    title: "Badges & succès",
    description:
      "Débloquez des badges en jouant : séries de victoires, nombre de parties, Blackjacks naturels...",
  },
  {
    icon: ShoppingBag,
    title: "Boutique de jetons",
    description:
      "Empruntez des jetons avec un système de prêt et remboursez quand vous voulez.",
  },
  {
    icon: Palette,
    title: "Skins de jetons",
    description:
      "Personnalisez vos jetons avec des skins exclusifs achetés en boutique.",
  },
  {
    icon: UserPlus,
    title: "Système d'amis",
    description:
      "Ajoutez des amis, consultez leur profil et comparez vos richesses.",
  },
  {
    icon: Award,
    title: "Classement",
    description:
      "Grimpez dans le classement grâce à vos jetons et vos performances.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.2 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-emerald-400 sm:text-4xl">
            Features
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Bien plus qu&apos;un simple jeu de cartes.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true, amount: 0.1 }}
              className="flex gap-4 rounded-xl border border-white/10 bg-card p-6 transition-colors hover:border-emerald-500/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <feature.icon className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
