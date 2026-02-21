"use client";

import { useStore, DayLog } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Utensils, Coffee, Apple, Moon, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FOOD_DATABASE } from "@/lib/foodDatabase";

export function DailyLogger() {
    const { activeProfileId, logs, updateLog, addFoodItem, removeFoodItem } = useStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (!activeProfileId || !mounted) return null;

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const currentLog = logs[dateStr]?.[activeProfileId] || {
        breakfast: 0,
        lunch: 0,
        snacks: 0,
        dinner: 0,
    };

    const handleUpdate = (slot: SlotKey, value: string) => {
        const num = parseInt(value, 10);
        updateLog(dateStr, activeProfileId, slot, isNaN(num) ? 0 : num);
    };

    type SlotKey = keyof Omit<DayLog, 'items'>;

    const slots: { key: SlotKey; label: string; icon: React.ReactNode }[] = [
        { key: "breakfast", label: "Breakfast", icon: <Coffee className="w-4 h-4 text-orange-400" /> },
        { key: "lunch", label: "Lunch", icon: <Utensils className="w-4 h-4 text-green-400" /> },
        { key: "snacks", label: "Snacks", icon: <Apple className="w-4 h-4 text-red-400" /> },
        { key: "dinner", label: "Dinner", icon: <Moon className="w-4 h-4 text-blue-400" /> },
    ];

    return (
        <Card className="w-full shadow-lg border-opacity-50">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    Today&apos;s Log
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    {slots.map((slot) => (
                        <div key={slot.key} className="space-y-2 bg-muted/30 p-4 rounded-xl border">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                                <Label htmlFor={slot.key} className="flex items-center gap-2 text-sm sm:text-base font-semibold">
                                    {slot.icon}
                                    {slot.label}
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs w-full sm:w-auto">
                                            <Plus className="w-3 h-3 mr-1" /> Add Food
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0" align="end">
                                        <Command>
                                            <CommandInput placeholder="Search food..." />
                                            <CommandList>
                                                <CommandEmpty>No food found.</CommandEmpty>
                                                <CommandGroup>
                                                    {FOOD_DATABASE.filter(f => f.category.toLowerCase() === slot.key).map(food => (
                                                        <CommandItem key={food.id} onSelect={() => {
                                                            addFoodItem(dateStr, activeProfileId, slot.key as keyof Omit<DayLog, 'items'>, { foodId: food.id, name: food.name, calories: food.calories });
                                                        }} className="flex flex-col items-start py-2">
                                                            <div className="flex w-full justify-between items-center mb-1">
                                                                <span className="font-medium">{food.name}</span>
                                                                <span className="text-muted-foreground text-xs font-semibold bg-muted px-2 py-0.5 rounded-full">{food.calories} kcal</span>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">{food.servingSize}</span>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="relative">
                                <Input
                                    id={slot.key}
                                    type="number"
                                    min="0"
                                    value={String(currentLog[slot.key] || "")}
                                    onChange={(e) => handleUpdate(slot.key, e.target.value)}
                                    className="pl-4 pr-12 h-12 text-lg font-bold bg-background/50 border-0 focus-visible:ring-1 focus-visible:ring-electric-green"
                                    placeholder="0"
                                />
                                <span className="absolute right-4 top-3 text-sm text-muted-foreground font-medium">kcal</span>
                            </div>
                            {currentLog.items?.[slot.key as keyof Omit<DayLog, 'items'>]?.length ? (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {currentLog.items[slot.key as keyof Omit<DayLog, 'items'>].map((item, index) => {
                                        const qty = item.quantity || 1;
                                        return (
                                            <Badge key={`${item.id || 'legacy'}-${index}`} variant="secondary" className="flex items-center gap-1 text-xs py-0.5 px-2">
                                                {item.name}
                                                {qty > 1 && <span className="font-bold text-electric-green ml-1">x{qty}</span>}
                                                <span className="text-muted-foreground ml-1">({(Number(item.calories) || 0) * qty} kcal)</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        removeFoodItem(dateStr, activeProfileId, slot.key as keyof Omit<DayLog, 'items'>, item.id || item.foodId || item.name);
                                                    }}
                                                    className="ml-1 flex-shrink-0 cursor-pointer hover:text-red-500 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        );
                                    })}
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
