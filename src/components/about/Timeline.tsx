"use client";
import React from "react";
import { motion } from "framer-motion";

export function Timeline({ items }: { items: Array<{ year?: string; title: string; description: string }> }) {
  return (
    <ol className="relative border-l border-maroon-100 ml-2">
      {items.map((it, i) => (
        <motion.li
          key={i}
          className="mb-8 ml-6"
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          viewport={{ once: true }}
        >
          <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-maroon-900 text-ivory-100 text-xs font-semibold">{it.year ? it.year : ""}</span>
          <h4 className="font-serif text-lg font-semibold text-maroon-900">{it.title}</h4>
          <p className="mt-2 text-maroon-600 text-sm leading-relaxed">{it.description}</p>
        </motion.li>
      ))}
    </ol>
  );
}
