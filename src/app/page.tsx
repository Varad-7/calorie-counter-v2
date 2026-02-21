"use client";

import { ProfileSwitcher } from "@/components/ProfileSwitcher";
import { DailyLogger } from "@/components/DailyLogger";
import { ProgressVisualizer } from "@/components/ProgressVisualizer";
import { DateNavigator } from "@/components/DateNavigator";
import { AddProfileModal } from "@/components/AddProfileModal";
import { EditProfileModal } from "@/components/EditProfileModal"; // Added this import
import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Leaf, Flame } from "lucide-react";

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
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
          <EditProfileModal />
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
          <div className="flex flex-col max-w-3xl mx-auto space-y-8 mt-4 w-full">
            <DateNavigator />
            <ProgressVisualizer />
            <DailyLogger />
          </div>
        )}
      </div>
    </main>
  );
}

// Ensure Button is available in this scope for the empty state
import { Button } from "@/components/ui/button";
