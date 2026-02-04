"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export function AboutCTA() {
  return (
    <motion.div
      className="bg-maroon-900 text-ivory-100 rounded-lg p-8 mt-8"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-serif text-2xl font-bold">Join Bari Samaj</h3>
          <p className="mt-2 text-maroon-50 text-sm">Create your profile, connect with members, and participate in community life.</p>
        </div>

        <div className="flex gap-3">
          <Link href="/register" className="inline-block bg-gold-400 text-maroon-900 px-4 py-2 rounded-md font-semibold">Join Now</Link>
          <Link href="/register?next=/profile" className="inline-block border border-gold-300 text-ivory-100 px-4 py-2 rounded-md">Complete Profile</Link>
        </div>
      </div>
    </motion.div>
  );
}
