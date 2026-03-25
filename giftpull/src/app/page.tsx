"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Dice5, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

const features = [
  {
    icon: ShoppingBag,
    title: "Storefront",
    description:
      "Browse gift cards at a discount. Grab Steam, Xbox, PlayStation, and more -- all below retail price.",
    color: "text-primary",
    bgGlow: "bg-primary/10",
  },
  {
    icon: Dice5,
    title: "Gacha Packs",
    description:
      "Try your luck with mystery packs. Pull Common to Legendary cards with huge potential value.",
    color: "text-epic",
    bgGlow: "bg-epic/10",
  },
  {
    icon: ArrowLeftRight,
    title: "Marketplace",
    description:
      "Trade peer-to-peer. List your cards, set your price, and deal directly with other collectors.",
    color: "text-success",
    bgGlow: "bg-success/10",
  },
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-epic/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="text-center max-w-3xl mx-auto">
          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-headline font-black uppercase tracking-tighter italic"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="bg-gradient-to-r from-primary via-tertiary to-accent bg-clip-text text-transparent">
              GCPACKS
            </span>
          </motion.h1>

          <motion.p
            className="mt-6 text-xl sm:text-2xl text-text-secondary font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            The Ultimate Gift Card Marketplace
          </motion.p>

          <motion.p
            className="mt-4 text-base text-text-tertiary max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            Buy discounted gift cards, open mystery gacha packs, and trade
            peer-to-peer. Your one-stop shop for digital value.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <Link href="/storefront">
              <Button size="lg" variant="primary">
                Browse Cards
              </Button>
            </Link>
            <Link href="/gacha">
              <Button size="lg" variant="secondary">
                Try Your Luck
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              <Card variant="interactive" padding="lg" className="h-full">
                <div
                  className={`w-12 h-12 rounded-none ${feature.bgGlow} flex items-center justify-center mb-5`}
                >
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-headline font-bold uppercase tracking-tight text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom accent line */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>
    </div>
  );
}
