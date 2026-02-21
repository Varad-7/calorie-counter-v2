"use client";

import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { calculateBMR, calculateMaintenance, calculateTargetCalories } from "@/lib/calculations";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useEffect, useState } from "react";

export function TrendsChart() {
    const { profiles, activeProfileId, logs } = useStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const profile = profiles.find((p) => p.id === activeProfileId);

    if (!profile || !mounted) return null;

    // Calculate goals
    const bmr = calculateBMR(profile.gender, profile.weight, profile.height, profile.age);
    const maintenance = calculateMaintenance(bmr, profile.activityLevel);
    const targetVal = calculateTargetCalories(maintenance, profile.deficitAmount);

    // Generate last 7 days
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        const dayLog = logs[dStr]?.[profile.id] || { breakfast: 0, lunch: 0, snacks: 0, dinner: 0 };
        const consumed = dayLog.breakfast + dayLog.lunch + dayLog.snacks + dayLog.dinner;

        data.push({
            date: d.toLocaleDateString('en-US', { weekday: 'short' }),
            consumed,
            fill: consumed > targetVal ? "#FF7F50" : "#00FF00" // coral vs electric-green
        });
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>7-Day Caloric Trend</CardTitle>
                <CardDescription>Visualizing your daily intake vs target limit</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 0, left: -25, bottom: 0 }}>
                            <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: "transparent" }}
                                contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
                            />
                            <ReferenceLine y={targetVal} stroke="#ffffff" strokeDasharray="3 3" label={{ position: 'top', value: 'Goal', fill: '#fff', fontSize: 12 }} />
                            <Bar
                                dataKey="consumed"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
