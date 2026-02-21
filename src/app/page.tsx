"use client";

import { ProfileSwitcher } from "@/components/ProfileSwitcher";
import { DailyLogger } from "@/components/DailyLogger";
import { ProgressVisualizer } from "@/components/ProgressVisualizer";
import { TrendsChart } from "@/components/TrendsChart";
import { AddProfileModal } from "@/components/AddProfileModal";
import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";

export default function Home() {
  const { profiles, activeProfileId } = useStore();

  // Zustand persist hydration mismatch fix for Next.js
  const [hydro, setHydro] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydro(true);
  }, []);

  if (!hydro) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center">
      <div className="w-full max-w-5xl px-4 py-8 space-y-8">

        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-electric-green/20 p-2 rounded-xl">
              <Leaf className="w-8 h-8 text-electric-green" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Family Health Tracker</h1>
              <p className="text-muted-foreground">Manage caloric deficits and goals together.</p>
            </div>
          </div>
        </header>

        {/* Profile Navigation */}
        <section>
          <ProfileSwitcher />
          <AddProfileModal />
        </section>

        {profiles.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-xl border-muted bg-muted/10">
            <h2 className="text-xl font-semibold mb-2">No Profiles Found</h2>
            <p className="text-muted-foreground mb-4">Click &quot;Add Profile&quot; to get started with your family tracker.</p>
            <Button onClick={() => document.getElementById('add-profile-trigger')?.click()}>
              Create First Profile
            </Button>
          </div>
        ) : !activeProfileId ? (
          <div className="text-center py-20">Please select a profile.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (Logger & Stats) */}
            <div className="lg:col-span-2 space-y-8">
              <ProgressVisualizer />
              <DailyLogger />
            </div>

            {/* Right Column (Trends & Insights) */}
            <div className="space-y-8">
              <TrendsChart />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// Ensure Button is available in this scope for the empty state
import { Button } from "@/components/ui/button";
