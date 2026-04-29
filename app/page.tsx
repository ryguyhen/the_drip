"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Users, Award, Star } from "lucide-react";
import { SHOPS } from "@/data/shops";

const FEATURED = SHOPS.filter((s) => s.featured).slice(0, 3);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7] font-sans">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex items-center justify-between max-w-lg mx-auto">
        <span className="text-2xl font-bold tracking-tight text-stone-900">
          The <span className="text-amber-600">Drip</span>
        </span>
        <Link
          href="/home"
          className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors"
        >
          Enter app →
        </Link>
      </header>

      {/* Hero */}
      <section className="px-6 pt-8 pb-10 max-w-lg mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="text-xs font-medium text-amber-700">
            NYC · LA · Specialty Coffee
          </span>
        </div>

        <h1 className="text-[2.6rem] font-bold leading-[1.08] text-stone-900 mb-4 tracking-tight">
          Find your next<br />
          <span className="text-amber-600">perfect cup.</span>
        </h1>
        <p className="text-stone-500 text-lg leading-relaxed mb-8 max-w-sm">
          Community rankings meet structured expert scores. Discover and rank
          the best specialty coffee around you.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/onboarding"
            className="flex items-center justify-center gap-2 bg-stone-900 text-white rounded-2xl py-4 px-6 font-semibold text-[15px] hover:bg-stone-800 transition-colors tap-scale"
          >
            Get started free
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/home"
            className="flex items-center justify-center gap-2 bg-white text-stone-700 rounded-2xl py-4 px-6 font-medium text-[15px] border border-stone-200 hover:border-stone-300 transition-colors tap-scale"
          >
            Browse without signing up
          </Link>
        </div>
      </section>

      {/* Featured preview */}
      <section className="px-6 pb-8 max-w-lg mx-auto">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">
          Top rated right now
        </p>
        <div className="space-y-2">
          {FEATURED.map((shop, i) => (
            <div
              key={shop.id}
              className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-stone-100"
            >
              <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={shop.heroImage}
                  alt={shop.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-stone-400">
                  {shop.neighborhood}, {shop.city === "New York" ? "NYC" : "LA"}
                </p>
                <h3 className="font-semibold text-sm text-stone-900 leading-tight">
                  {shop.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-100">
                    {shop.communityScore}
                  </span>
                  {shop.proScore && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                      {shop.proScore}
                    </span>
                  )}
                  <span className="text-[10px] text-stone-400">{shop.tags[0]}</span>
                </div>
              </div>
              <span className="text-xl font-bold text-stone-100 flex-shrink-0">
                #{i + 1}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Dual score explainer */}
      <section className="px-6 py-8 max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-stone-900 mb-2">Two scores. One truth.</h2>
        <p className="text-sm text-stone-400 mb-6">
          Most review apps use one number. We use two, because crowd preference and
          technical quality tell different stories.
        </p>

        <div className="space-y-3">
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                <Users size={15} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 text-sm">Community Rank</h3>
                <p className="text-[10px] text-stone-400">Rated by the community</p>
              </div>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">
              Built from head-to-head comparisons. Pick which shop you&apos;d rather visit —
              an Elo algorithm builds the ranking. Fast, addictive, crowd-driven.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                <Award size={15} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 text-sm">Pro Coffee Score</h3>
                <p className="text-[10px] text-stone-400">Scored by premium reviewers</p>
              </div>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">
              10 criteria including bean quality, pour over, espresso technique, and
              atmosphere — weighted and averaged into a 0–100 technical score.
            </p>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="px-6 py-4 max-w-lg mx-auto">
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "⚡", title: "Head-to-head ranking", desc: "Tap which shop wins" },
            { icon: "📍", title: "City leaderboards", desc: "Best by neighborhood" },
            { icon: "🔍", title: "Smart filters", desc: "Espresso, pour over, vibe" },
            { icon: "☕", title: "Pro criteria", desc: "10-point structured scores" },
          ].map((f) => (
            <div key={f.title} className="p-4 bg-white rounded-2xl border border-stone-100">
              <span className="text-xl block mb-2">{f.icon}</span>
              <h3 className="font-semibold text-sm text-stone-900 mb-0.5">{f.title}</h3>
              <p className="text-xs text-stone-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Premium CTA */}
      <section className="px-6 py-8 max-w-lg mx-auto">
        <div className="p-6 bg-stone-900 rounded-3xl">
          <div className="flex items-center gap-2 mb-3">
            <Star size={14} className="text-amber-400" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              The Drip Pro
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">For serious coffee people.</h3>
          <p className="text-stone-300 text-sm mb-5 leading-relaxed">
            Submit structured reviews, unlock full score breakdowns, and access
            leaderboards for espresso, pour over, and more.
          </p>
          <Link
            href="/premium"
            className="inline-flex items-center gap-2 bg-amber-500 text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-amber-400 transition-colors"
          >
            Learn about Pro <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <footer className="px-6 py-8 text-center max-w-lg mx-auto border-t border-stone-100">
        <p className="text-xs text-stone-300">The Drip · Specialty Coffee Discovery</p>
      </footer>
    </div>
  );
}
