"use client";

import { useStore, LoggedActivity } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Flame, Trash2 } from "lucide-react";
import { AddGymActivityModal } from "./AddGymActivityModal";

interface StatsProps {
    profileId: string;
    weight: number;
}

export function GymActivityTracker({ profileId, weight }: StatsProps) {
    const { logs, removeGymActivity, activeDateStr } = useStore();

    const dateStr = activeDateStr;

    const currentProfileLog = logs[dateStr]?.[profileId];
    const gymItems = currentProfileLog?.items?.gym || [];
    const totalBurned = currentProfileLog?.gym || 0;

    return (
        <div className="space-y-6">
            {/* Summary Card */}
            <Card className="w-full bg-red-950/20 border-red-500/30">
                <CardHeader>
                    <CardTitle className="text-xl text-red-50 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-red-500" />
                        {dateStr === (() => {
                            const d = new Date();
                            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                        })() ? "Today's Burn" : `Burn for ${dateStr}`}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                    <span className="text-6xl font-black tracking-tighter text-red-500 mb-2">
                        {totalBurned}
                    </span>
                    <span className="text-red-400 font-medium">kcal burned</span>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end">
                <AddGymActivityModal dateStr={dateStr} profileId={profileId} weight={weight} />
            </div>

            {/* List */}
            <Card className="w-full bg-black border-red-900/50">
                <CardHeader>
                    <CardTitle className="text-lg text-red-50">Activity Log</CardTitle>
                </CardHeader>
                <CardContent>
                    {gymItems.length === 0 ? (
                        <div className="text-center py-10 opacity-50 flex flex-col items-center">
                            <Activity className="w-8 h-8 text-red-400 mb-2" />
                            <p className="text-red-300">No activities logged for this date.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {gymItems.map((item: LoggedActivity) => (
                                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-red-950/30 border border-red-900/30">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-red-50">{item.name}</span>
                                        <span className="text-xs text-red-400/80">
                                            {item.duration ? `${item.duration} min` : ''}
                                            {item.pace ? ` @ ${item.pace} km/h` : ''}
                                            {item.gradient ? ` (Inc: ${item.gradient}%)` : ''}
                                            {item.duration && item.sets ? ' • ' : ''}
                                            {item.sets ? `${item.sets} sets x ${item.reps} reps` : ''}
                                            {item.weight ? ` @ ${item.weight} kg` : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-red-400">{item.caloriesBurned} kcal</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-300 hover:bg-red-900/50 h-8 w-8"
                                            onClick={() => removeGymActivity(dateStr, profileId, item.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
