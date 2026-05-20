"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Coins, Users } from "lucide-react";

const points = [
  {
    icon: ShieldCheck,
    title: "Sans argent réel",
    description:
      "Profitez du frisson du Blackjack sans jamais risquer votre portefeuille. Tous les jetons sont virtuels.",
  },
  {
    icon: Coins,
    title: "Économie virtuelle",
    description:
      "Gagnez des jetons, empruntez à la boutique, achetez des skins — une expérience complète et fun.",
  },
  {
    icon: Users,
    title: "Jouez entre amis",
    description:
      "Ajoutez vos amis, comparez vos scores et affrontez-vous en temps réel autour d'une table.",
  },
];

export function Concept() {
  return (
    <section id="concept" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.2 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-emerald-400 sm:text-4xl">
            Le concept
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Tout le plaisir du Blackjack, sans les inconvénients. Pas de mise
            réelle, juste du jeu pur.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {points.map((point, i) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              viewport={{ once: true, amount: 0.2 }}
              className="group rounded-2xl border border-white/10 bg-card p-8 transition-colors hover:border-emerald-500/30"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                <point.icon className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {point.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
