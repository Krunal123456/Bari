"use client";
import React, { useEffect, useState } from "react";
import { Hero } from "@/components/about/Hero";
import { Timeline } from "@/components/about/Timeline";
import { FeatureCard } from "@/components/about/FeatureCard";
import { AboutCTA } from "@/components/about/CTA";
import { fetchAboutContent } from "@/services/aboutService";
import { motion } from "framer-motion";

export default function AboutPage() {
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    fetchAboutContent().then((data) => {
      if (mounted) setContent(data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const c = content || {};

  return (
    <main className="container mx-auto px-6 py-10 lg:py-16">
      <Hero
        title={c.hero?.title ?? "About Bari Samaj"}
        subtitle={c.hero?.subtitle}
        intro={c.hero?.intro}
        backgroundImage={c.hero?.backgroundImage}
      />

      <section aria-labelledby="history" className="mt-12">
        <motion.h2 className="font-serif text-2xl font-bold text-maroon-900" layoutId="history" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
          Our History & Heritage
        </motion.h2>
        <p className="mt-4 text-maroon-600 max-w-3xl">We honor our past and the stories that shaped our collective identity.</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Timeline items={c.history ?? []} />
          </div>
          <div className="prose max-w-none text-maroon-700">
            <p>
              Our traditions are built on family, mutual support, and shared rites that bind generations. Bari Samaj
              celebrates those practices while thoughtfully embracing change that strengthens community resilience.
            </p>
            <p className="mt-4">
              Through storytelling and rituals, we pass on values of responsibility, hospitality, and cultural dignity.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="vision" className="mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div>
            <h3 id="vision" className="font-serif text-xl font-bold text-maroon-900">Vision & Mission</h3>
            <p className="mt-4 text-maroon-700 font-medium">{c.vision?.statement ?? "A connected, thriving Bari community."}</p>
            <h4 className="mt-6 font-semibold">Mission</h4>
            <p className="mt-2 text-maroon-600">{c.mission?.statement ?? "Provide a trusted digital home for connections and cultural preservation."}</p>
          </div>

          <div className="bg-ivory-100 border border-maroon-100 rounded-lg p-6">
            <h4 className="font-serif text-lg font-bold text-maroon-900">Core Values</h4>
            <ul className="mt-4 space-y-2 text-maroon-700">
              {(c.values ?? ["Respect", "Integrity", "Inclusiveness", "Cultural dignity"]).map((v: string) => (
                <li key={v} className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-gold-400" />
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="purpose" className="mt-12">
        <h3 id="purpose" className="font-serif text-xl font-bold text-maroon-900">Purpose of This Platform</h3>
        <p className="mt-4 text-maroon-700 max-w-3xl">
          This platform was created to connect community members, enable a trusted matrimony ecosystem, share
          announcements, and preserve cultural identity — all under responsible governance and clear moderation.
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(c.features ?? []).map((f: any) => (
            <FeatureCard key={f.id} id={f.id} title={f.title} description={f.description} />
          ))}
        </div>
      </section>

      <section aria-labelledby="governance" className="mt-12">
        <h3 id="governance" className="font-serif text-xl font-bold text-maroon-900">Governance & Trust</h3>
        <p className="mt-4 text-maroon-700 max-w-3xl">{c.governance?.intro ?? "Administrators and moderators oversee content and approvals."}</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-ivory-100 border border-maroon-100 rounded-lg p-6">
            <h4 className="font-semibold">Approval Processes</h4>
            <p className="mt-2 text-maroon-600">Profile and directory entries undergo verification and admin approval to protect members.</p>
          </div>

          <div className="bg-ivory-100 border border-maroon-100 rounded-lg p-6">
            <h4 className="font-semibold">Privacy & Data</h4>
            <p className="mt-2 text-maroon-600">We prioritize member privacy, limit data sharing, and follow a responsible data-handling policy.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="conduct" className="mt-12">
        <h3 id="conduct" className="font-serif text-xl font-bold text-maroon-900">Community Values & Code of Conduct</h3>
        <p className="mt-4 text-maroon-700 max-w-3xl">We expect members to act with respect, integrity, and inclusiveness. Content that harms cultural dignity is not permitted.</p>

        <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <li className="bg-ivory-100 border border-maroon-100 rounded-lg p-4">Respect others and their traditions.</li>
          <li className="bg-ivory-100 border border-maroon-100 rounded-lg p-4">Share accurate information and be honest.</li>
          <li className="bg-ivory-100 border border-maroon-100 rounded-lg p-4">Include and uplift community members.</li>
          <li className="bg-ivory-100 border border-maroon-100 rounded-lg p-4">Use the platform responsibly and report misuse.</li>
        </ul>
      </section>

      <section aria-labelledby="future" className="mt-12">
        <h3 id="future" className="font-serif text-xl font-bold text-maroon-900">Future Vision</h3>
        <p className="mt-4 text-maroon-700 max-w-3xl">We plan to introduce more engagement features, events, educational initiatives, and improved verification tools.</p>

        <ul className="mt-4 list-disc ml-6 text-maroon-600">
          {(c.future ?? []).map((f: string, idx: number) => (
            <li key={idx} className="mt-2">{f}</li>
          ))}
        </ul>
      </section>

      <AboutCTA />
    </main>
  );
}
