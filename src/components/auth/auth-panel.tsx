"use client";

import { motion } from "framer-motion";
import { Spade, Heart, Diamond, Club, Trophy, Coins } from "lucide-react";

const floatingIcons = [
  { icon: Spade, color: "bg-emerald-500/20 text-emerald-400", x: "15%", y: "20%" },
  { icon: Heart, color: "bg-red-500/20 text-red-400", x: "55%", y: "12%" },
  { icon: Diamond, color: "bg-amber-500/20 text-amber-400", x: "75%", y: "35%" },
  { icon: Club, color: "bg-purple-500/20 text-purple-400", x: "25%", y: "50%" },
  { icon: Trophy, color: "bg-yellow-500/20 text-yellow-400", x: "60%", y: "55%" },
  { icon: Coins, color: "bg-emerald-500/20 text-emerald-400", x: "40%", y: "75%" },
];

export function AuthPanel() {
  return (
    <div className="relative hidden h-screen flex-col justify-between overflow-hidden bg-card p-10 lg:flex lg:w-1/2">
      {/* Subtle gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,_rgba(16,185,129,0.08),_transparent_70%)]" />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-2">
        <Spade className="h-6 w-6 fill-emerald-500 text-emerald-500" />
        <span className="text-lg font-bold tracking-tight">BlackJack</span>
      </div>

      {/* Floating icons */}
      <div className="relative flex-1">
        {floatingIcons.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="absolute"
            style={{ left: item.x, top: item.y }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.color}`}
            >
              <item.icon className="h-7 w-7" />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Quote */}
      <div className="relative z-10">
        <blockquote className="text-lg font-medium leading-relaxed text-foreground/90">
          &ldquo;Le Blackjack sans pression, entre amis, avec des badges et des
          skins — exactement ce qu&apos;il nous fallait.&rdquo;
        </blockquote>
        <p className="mt-3 text-sm text-muted-foreground">
          Un joueur satisfait
        </p>
      </div>
    </div>
  );
}
