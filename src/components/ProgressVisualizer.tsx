"use client";

import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateBMR, calculateMaintenance, calculateTargetCalories } from "@/lib/calculations";
import { useEffect, useState } from "react";
import { Flame, Target } from "lucide-react";

export function ProgressVisualizer() {
    const { profiles, activeProfileId, logs } = useStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const profile = profiles.find((p) => p.id === activeProfileId);

    if (!profile || !mounted) return null;

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Calculate targets
    const bmr = calculateBMR(profile.gender, profile.weight, profile.height, profile.age);
    const maintenance = calculateMaintenance(bmr, profile.activityLevel);
    const target = calculateTargetCalories(maintenance, profile.deficitAmount);

    // Calculate consumed
    const currentLog = logs[dateStr]?.[activeProfileId!] || { breakfast: 0, lunch: 0, snacks: 0, dinner: 0 };
    const consumed = currentLog.breakfast + currentLog.lunch + currentLog.snacks + currentLog.dinner;

    const remaining = Math.max(0, target - consumed);
    const percentage = Math.min(100, Math.round((consumed / target) * 100)) || 0;

    const isOver = consumed > target;

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
                    {consumed} / {target} kcal consumed today
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

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col p-4 bg-muted/50 rounded-xl border border-border/50">
                        <span className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                            <Target className="w-4 h-4 text-blue-400" />
                            Target
                        </span>
                        <span className="text-2xl font-bold mt-1">{target}</span>
                    </div>
                    <div className="flex flex-col p-4 bg-muted/50 rounded-xl border border-border/50">
                        <span className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                            <Flame className="w-4 h-4 text-orange-500" />
                            Burn (Maintenance)
                        </span>
                        <span className="text-2xl font-bold mt-1">{maintenance}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
