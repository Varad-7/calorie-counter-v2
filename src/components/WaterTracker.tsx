"use client";

import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Droplet, Plus, Minus } from "lucide-react";

export function WaterTracker() {
    const { activeProfileId, activeDateStr, water, addWater, removeWater } = useStore();

    if (!activeProfileId) return null;

    const dateWater = water[activeDateStr] || {};
    const currentGlasses = dateWater[activeProfileId] || 0;
    const goal = 8; // Default 8 glasses (approx 2 liters)

    const progress = Math.min((currentGlasses / goal) * 100, 100);

    return (
        <div className="bg-card rounded-xl p-4 sm:p-6 border shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 p-2.5 rounded-lg flex items-center justify-center">
                        <Droplet className="w-5 h-5 text-blue-500 fill-blue-500/20" />
                    </div>
                    <div>
                        <h3 className="font-semibold leading-none mb-1.5">Water Intake</h3>
                        <p className="text-xs text-muted-foreground">
                            {currentGlasses} / {goal} glasses
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8 rounded-full"
                        onClick={() => removeWater(activeDateStr, activeProfileId)}
                        disabled={currentGlasses === 0}
                    >
                        <Minus className="w-4 h-4" />
                    </Button>
                    <div className="w-8 text-center font-medium">{currentGlasses}</div>
                    <Button
                        variant="secondary"
                        size="icon"
                        className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                        onClick={() => addWater(activeDateStr, activeProfileId)}
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-500 transition-all duration-500 ease-out flex"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
