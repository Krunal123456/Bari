"use client";

import { useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ImageSequenceCanvas } from "@/components/scrollytelling/ImageSequenceCanvas";
import { ScrollSection } from "@/components/scrollytelling/ScrollSection";
import { NewsFeed } from "@/components/home/NewsFeed";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  // We need enough height to scroll through the 200 frames. 
  // Let's assume each screen height advances ~20 frames, so 10-12 screens height.
  // 200 frames. If we want 1 frame per 10px scroll? Total 2000px? Too short.
  // Let's make the scrollable area based on sections.
  // We can just have a very tall div that ImageSequenceCanvas tracks.

  return (
    <main className="relative bg-ivory-50 min-h-screen">
      <Navbar />

      {/* The 3D Canvas Background */}
      <ImageSequenceCanvas scrollContainerRef={containerRef as React.RefObject<HTMLElement>} />

      {/* Scrollable Content Container */}
      <div
        ref={containerRef}
        className="relative z-10"
      >
        {/* Spacer to allow initial scroll without content covering the first frame instantly if desired, 
            or just start right away. */}

        {/* Section 1: Hero */}
        <ScrollSection align="center" className="min-h-screen flex flex-col items-center justify-end pb-20 gap-8">
          <div className="bg-white/30 backdrop-blur-md p-8 rounded-3xl border border-white/50 shadow-xl max-w-4xl mx-auto mb-4 ring-1 ring-black/5">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-maroon-950 mb-4 drop-shadow-sm">
              Bari Samaj
            </h1>
            <p className="text-lg md:text-xl text-maroon-900 font-medium max-w-xl mx-auto mb-6 leading-relaxed">
              Honoring our roots, embracing our future.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/register"
                className="px-6 py-3 bg-maroon-900 text-ivory-50 rounded-full font-medium hover:bg-maroon-800 transition-all hover:scale-105 shadow-lg flex items-center gap-2"
              >
                Join the Community <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Integrated News Feed */}
          <div className="w-full max-w-6xl mx-auto">
            <NewsFeed />
          </div>
        </ScrollSection>

        {/* Section 2: Tradition */}
        <ScrollSection align="left" className="h-[120vh]">
          <div className="max-w-xl mx-auto md:mx-0 bg-ivory-50/90 backdrop-blur-sm p-8 rounded-2xl border border-gold-200 shadow-xl">
            <h2 className="text-4xl md:text-5xl font-serif text-gold-700 mb-4">
              Sacred Traditions
            </h2>
            <p className="text-lg text-maroon-800 leading-relaxed">
              From generation to generation, we carry forward the lighting of the lamp. Our weddings, our festivals, our gatherings—they are the threads that weave us together.
            </p>
          </div>
        </ScrollSection>

        {/* Section 3: Matrimony */}
        <ScrollSection align="right" className="h-[120vh]">
          <div className="max-w-xl mx-auto md:ml-auto bg-ivory-50/90 backdrop-blur-sm p-8 rounded-2xl border border-maroon-100 shadow-xl">
            <h2 className="text-4xl md:text-5xl font-serif text-maroon-900 mb-4">
              Eternal Bonds
            </h2>
            <p className="text-lg text-maroon-800 leading-relaxed mb-6">
              Find your perfect match within our trusted community. Secure profiles, kundli matching, and family-oriented connections.
            </p>
            <Link
              href="/matrimony"
              className="inline-flex items-center gap-2 text-gold-700 hover:text-gold-800 font-semibold text-lg group"
            >
              Explore Matrimony <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollSection>

        {/* Section 4: Community */}
        <ScrollSection align="center" className="h-[120vh]">
          <div className="bg-maroon-900/90 backdrop-blur-sm text-ivory-50 p-10 rounded-2xl shadow-2xl max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-serif text-gold-400 mb-6">
              Stronger Together
            </h2>
            <p className="text-lg text-maroon-100 leading-relaxed mb-8">
              "A community is not just a group of people, it is a family extended." - Join over 5,000 members connecting, growing, and supporting each other.
            </p>
            <Link
              href="/community"
              className="px-8 py-3 bg-gold-500 text-maroon-900 rounded-full font-bold hover:bg-gold-400 transition-colors"
            >
              View Directory
            </Link>
          </div>
        </ScrollSection>

        {/* Spacer to allow full scroll completion */}
        <div className="h-[50vh]" />

        <Footer />
      </div>
    </main>
  );
}
