"use client";

import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import { ArrowLeft, Dumbbell } from "lucide-react";
import Link from "next/link";
import { GymActivityTracker } from "@/components/Gym/GymActivityTracker";
import { DateNavigator } from "@/components/DateNavigator";

export default function GymPage() {
    const { activeProfileId, profiles } = useStore();
    const [hydro, setHydro] = useState(false);

    useEffect(() => {
        setHydro(true);
    }, []);

    if (!hydro) return <div className="min-h-screen bg-background flex items-center justify-center text-red-500">Loading...</div>;

    const activeProfile = profiles.find((p) => p.id === activeProfileId);

    if (!activeProfile) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
                <p className="mb-4 text-muted-foreground">Please select a profile on the dashboard first.</p>
                <Link href="/" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col">
            <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-8">
                {/* Header */}
                <header className="flex items-center gap-4">
                    <Link href="/" className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="bg-red-500/15 p-2 rounded-xl border border-red-500/30">
                            <Dumbbell className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Gym Activities</h1>
                            <p className="text-sm text-red-500/80">Tracking for {activeProfile.name}</p>
                        </div>
                    </div>
                </header>

                <div className="w-full">
                    <DateNavigator />
                </div>

                <GymActivityTracker profileId={activeProfile.id} weight={activeProfile.weight} />
            </div>
        </main>
    );
}
