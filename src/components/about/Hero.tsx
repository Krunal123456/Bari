"use client";
import React from "react";
import { motion } from "framer-motion";

type HeroProps = {
  title: string;
  subtitle?: string;
  intro?: string;
  backgroundImage?: string;
};

export function Hero({ title, subtitle, intro, backgroundImage }: HeroProps) {
  return (
    <header className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{
          backgroundImage: backgroundImage
            ? `url(${backgroundImage})`
            : `linear-gradient(180deg, rgba(93,0,30,0.12), rgba(198,143,85,0.06))`,
        }}
        aria-hidden
      />

      <div className="relative container mx-auto px-6 py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-maroon-900 leading-tight">{title}</h1>
          {subtitle && (
            <p className="mt-4 text-gold-500 font-medium text-lg md:text-xl">{subtitle}</p>
          )}

          {intro && (
            <p className="mt-6 text-maroon-700 text-base md:text-lg leading-relaxed">{intro}</p>
          )}
        </motion.div>
      </div>
    </header>
  );
}
