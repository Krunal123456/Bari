"use client";
import React from "react";
import { motion } from "framer-motion";
import { Megaphone, Users, Heart, Grid } from "lucide-react";

const IconMap: Record<string, any> = {
  announcements: Megaphone,
  matrimony: Heart,
  kundli: Grid,
  directory: Users,
};

export function FeatureCard({ id, title, description }: { id: string; title: string; description: string }) {
  const Icon = IconMap[id] || Megaphone;
  return (
    <motion.div
      className="bg-ivory-100 border border-maroon-100 rounded-xl p-6 shadow-sm"
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-md bg-maroon-900 text-ivory-100">
          <Icon size={18} />
        </div>
        <div>
          <h3 className="font-serif text-lg font-semibold text-maroon-900">{title}</h3>
          <p className="mt-2 text-maroon-600 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
