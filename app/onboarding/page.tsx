"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserPreference } from "@/types";
import { useAppState } from "@/hooks/useAppState";

const PREFERENCES: Array<{
  id: UserPreference;
  label: string;
  emoji: string;
  desc: string;
}> = [
  { id: "espresso-first", label: "Espresso-first", emoji: "☕", desc: "Precision extraction above all" },
  { id: "pour-over", label: "Pour over", emoji: "🫗", desc: "Nuance in every filter cup" },
  { id: "vibe", label: "Atmosphere", emoji: "✨", desc: "Space, mood, and aesthetics" },
  { id: "work-friendly", label: "Work-friendly", emoji: "💻", desc: "Tables, wifi, long stays" },
  { id: "roaster-led", label: "Roaster-led", emoji: "🌱", desc: "Sourcing, direct trade, origin" },
  { id: "pastries", label: "Pastries", emoji: "🥐", desc: "The full morning ritual" },
  { id: "minimalist", label: "Minimalist specialty", emoji: "⬜", desc: "Less is more" },
];

const CITIES = ["New York", "Los Angeles", "Chicago", "San Francisco", "Other"];

export default function OnboardingPage() {
  const router = useRouter();
  const completeOnboarding = useAppState((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [selectedPrefs, setSelectedPrefs] = useState<UserPreference[]>([]);
  const [selectedCity, setSelectedCity] = useState("New York");

  const togglePref = (id: UserPreference) => {
    setSelectedPrefs((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    completeOnboarding(selectedPrefs, selectedCity);
    router.push("/home");
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] flex flex-col max-w-lg mx-auto px-6">
      {/* Progress bar */}
      <div className="pt-12 pb-8">
        <div className="flex items-center gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-300",
                i <= step ? "bg-stone-900" : "bg-stone-200"
              )}
            />
          ))}
        </div>
      </div>

      {/* Step 0: Welcome */}
      {step === 0 && (
        <div className="flex-1 animate-fade-up">
          <span className="text-4xl block mb-6">☕</span>
          <h1 className="text-3xl font-bold text-stone-900 mb-3 leading-tight">
            Welcome to The Drip
          </h1>
          <p className="text-stone-500 text-lg mb-8 leading-relaxed">
            The specialty coffee app that separates crowd favorites from
            technical excellence.
          </p>

          <div className="space-y-3 mb-8">
            {[
              { icon: "📍", text: "Log shops you've actually been to" },
              { icon: "⚡", text: "Rank your visits head-to-head" },
              { icon: "📊", text: "Community scores built from real experience" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className="text-stone-700 text-[15px]">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl mb-8">
            <p className="text-xs font-semibold text-amber-800 mb-1">How ranking works</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              You can only rank shops you&apos;ve visited. Log a visit, then compare it against
              your other visits. Your rankings shape the Community Score.
            </p>
          </div>

          <button
            onClick={() => setStep(1)}
            className="w-full flex items-center justify-center gap-2 bg-stone-900 text-white rounded-2xl py-4 font-semibold tap-scale"
          >
            Let&apos;s set up your taste <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Step 1: City */}
      {step === 1 && (
        <div className="flex-1 animate-fade-up">
          <h2 className="text-2xl font-bold text-stone-900 mb-2">
            Where are you based?
          </h2>
          <p className="text-stone-500 mb-8">
            We&apos;ll tailor rankings to your city.
          </p>

          <div className="space-y-2 mb-8">
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl border transition-all tap-scale",
                  selectedCity === city
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-white border-stone-200 text-stone-700 hover:border-stone-300"
                )}
              >
                <span className="font-medium">{city}</span>
                {selectedCity === city && <Check size={16} />}
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full flex items-center justify-center gap-2 bg-stone-900 text-white rounded-2xl py-4 font-semibold tap-scale"
          >
            Continue <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Step 2: Preferences */}
      {step === 2 && (
        <div className="flex-1 animate-fade-up">
          <h2 className="text-2xl font-bold text-stone-900 mb-2">
            What matters to you?
          </h2>
          <p className="text-stone-500 mb-6">
            Pick what you care about. We&apos;ll weight your recommendations accordingly.
          </p>

          <div className="space-y-2 mb-8">
            {PREFERENCES.map(({ id, label, emoji, desc }) => {
              const selected = selectedPrefs.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => togglePref(id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all tap-scale",
                    selected
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-white border-stone-200 text-stone-700 hover:border-stone-300"
                  )}
                >
                  <span className="text-xl flex-shrink-0">{emoji}</span>
                  <div className="text-left flex-1">
                    <p className="font-medium text-sm">{label}</p>
                    <p className={cn("text-xs", selected ? "text-stone-300" : "text-stone-400")}>
                      {desc}
                    </p>
                  </div>
                  {selected && <Check size={16} className="flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="space-y-2 pb-8">
            <button
              onClick={handleFinish}
              className="w-full flex items-center justify-center gap-2 bg-stone-900 text-white rounded-2xl py-4 font-semibold tap-scale"
            >
              Start exploring <ArrowRight size={16} />
            </button>
            <button
              onClick={handleFinish}
              className="w-full text-stone-400 text-sm py-2"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
