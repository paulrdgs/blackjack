"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ChevronDown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Background image */}
      <Image
        src="/images/hero-bg.jpg"
        alt=""
        fill
        priority
        className="object-cover"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Bottom gradient fade into page background */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex max-w-3xl flex-col items-center gap-6 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-white/90">
              100% gratuit, 0% de risque
            </span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          Le Blackjack,{" "}
          <em className="italic text-white">sans limites</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-xl text-lg text-white/70 sm:text-xl"
        >
          Rejoignez la table, collectionnez des badges, personnalisez vos jetons
          et défiez vos amis — le tout sans miser un centime.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="flex flex-col gap-3 pt-4 sm:flex-row"
        >
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-[50px] bg-emerald-600 px-8 text-base font-medium text-white transition-colors hover:bg-emerald-700"
          >
            Commencer à jouer
          </Link>
          <a
            href="#concept"
            className="inline-flex h-12 items-center justify-center rounded-[50px] border border-white/20 px-8 text-base font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10"
          >
            En savoir plus
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#concept"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute bottom-8 z-10 animate-bounce text-white/50 transition-colors hover:text-white"
      >
        <ChevronDown className="h-6 w-6" />
      </motion.a>
    </section>
  );
}
