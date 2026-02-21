"use client";

import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateBMR, calculateMaintenance, calculateTargetCalories } from "@/lib/calculations";
import { useEffect, useState } from "react";
import { Flame, Target, Plus } from "lucide-react";
import Link from "next/link";

export function ProgressVisualizer() {
    const { profiles, activeProfileId, logs, activeDateStr } = useStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const profile = profiles.find((p) => p.id === activeProfileId);

    if (!profile || !mounted) return null;

    const dateStr = activeDateStr;

    // Calculate targets
    const bmr = calculateBMR(profile.gender, profile.weight, profile.height, profile.age);
    const maintenance = calculateMaintenance(bmr, profile.activityLevel);
    const target = calculateTargetCalories(maintenance, profile.deficitAmount);

    // Calculate consumed
    const currentLog = logs[dateStr]?.[activeProfileId!] || { breakfast: 0, lunch: 0, snacks: 0, dinner: 0, gym: 0 };
    const consumed = currentLog.breakfast + currentLog.lunch + currentLog.snacks + currentLog.dinner;
    const burned = currentLog.gym || 0;
    const net = Math.max(0, consumed - burned);

    const remaining = Math.max(0, target - net);
    const percentage = Math.min(100, Math.round((net / target) * 100)) || 0;

    const isOver = net > target;

    return (
        <Card className="w-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl flex justify-between items-center">
                    <span>Daily Budget</span>
                    <span className={`text-2xl font-bold ${isOver ? "text-coral" : "text-electric-green"}`}>
                        {remaining} <span className="text-sm font-normal text-muted-foreground whitespace-nowrap">kcal left</span>
                    </span>
                </CardTitle>
                <CardDescription>
                    {consumed} consumed - {burned} burned = {net} net kcal today
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Progress
                        value={percentage}
                        className={`h-4 ${isOver ? "bg-coral/20" : "bg-electric-green/20"}`}
                        indicatorColor={isOver ? "bg-coral" : "bg-electric-green"}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col p-4 bg-muted/50 rounded-xl border border-border/50">
                        <span className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                            <Target className="w-4 h-4 text-blue-400" />
                            Target
                        </span>
                        <span className="text-2xl font-bold mt-1">{target}</span>
                    </div>
                    <Link
                        href="/gym"
                        className="flex flex-col p-4 bg-red-500/10 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-colors relative group cursor-pointer block"
                    >
                        <div className="absolute top-2 right-2 p-1 rounded-full bg-red-500/20 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-sm text-red-500 flex items-center gap-2 font-medium">
                            <Flame className="w-4 h-4" />
                            Active Burn (Gym)
                        </span>
                        <span className="text-2xl font-bold mt-1 text-red-500">{burned}</span>
                    </Link>
                    <div className="flex flex-col p-4 bg-muted/50 rounded-xl border border-border/50">
                        <span className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                            <Flame className="w-4 h-4 text-orange-500" />
                            Maintenance
                        </span>
                        <span className="text-2xl font-bold mt-1">{maintenance}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
