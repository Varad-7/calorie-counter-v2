"use client";

import { useStore, DayLog } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Utensils, Coffee, Apple, Moon, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { getAllFoods } from "@/lib/foodDatabase";
import { AddCustomFoodModal } from "@/components/AddCustomFoodModal";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";

type SlotKey = keyof Omit<DayLog, 'items' | 'gym'>;

function SwipeableItem({
    children,
    onDelete,
    itemKey,
}: {
    children: React.ReactNode;
    onDelete: () => void;
    itemKey: string;
}) {
    const x = useMotionValue(0);
    const deleteOpacity = useTransform(x, [-120, -60], [1, 0]);
    const deleteScale = useTransform(x, [-120, -60, 0], [1, 0.8, 0.6]);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        setIsDragging(false);
        if (info.offset.x < -100) {
            onDelete();
        }
    };

    return (
        <div className="relative overflow-hidden rounded-lg">
            {/* Delete background */}
            <motion.div
                className="absolute inset-0 flex items-center justify-end px-4 bg-gradient-to-l from-red-500/90 to-red-600/70 rounded-lg"
                style={{ opacity: deleteOpacity }}
            >
                <motion.div style={{ scale: deleteScale }} className="flex items-center gap-1.5 text-white font-semibold text-sm">
                    <Trash2 className="w-4 h-4" />
                    Delete
                </motion.div>
            </motion.div>

            {/* Swipeable content */}
            <motion.div
                key={itemKey}
                drag="x"
                dragDirectionLock
                dragConstraints={{ left: -140, right: 0 }}
                dragElastic={0.1}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                style={{ x }}
                className={`relative bg-background border rounded-lg ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                whileTap={{ scale: 0.98 }}
            >
                {children}
            </motion.div>
        </div>
    );
}

export function DailyLogger() {
    const { activeProfileId, logs, customFoods, updateLog, addFoodItem, removeFoodItem, activeDateStr } = useStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (!activeProfileId || !mounted) return null;

    const dateStr = activeDateStr;

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

    const allFoods = getAllFoods(customFoods);

    const slots: { key: SlotKey; label: string; icon: React.ReactNode }[] = [
        { key: "breakfast", label: "Breakfast", icon: <Coffee className="w-4 h-4 text-orange-400" /> },
        { key: "lunch", label: "Lunch", icon: <Utensils className="w-4 h-4 text-green-400" /> },
        { key: "snacks", label: "Snacks", icon: <Apple className="w-4 h-4 text-red-400" /> },
        { key: "dinner", label: "Dinner", icon: <Moon className="w-4 h-4 text-blue-400" /> },
    ];

    return (
        <Card className="w-full shadow-lg border-opacity-50">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                        {dateStr === (() => {
                            const d = new Date();
                            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                        })() ? "Today's Log" : `Log for ${dateStr}`}
                    </CardTitle>
                    <AddCustomFoodModal />
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    {slots.map((slot) => {
                        const slotItems = currentLog.items?.[slot.key as keyof Omit<DayLog, 'items'>] || [];
                        return (
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
                                                        {allFoods.filter(f => f.category.toLowerCase() === slot.key).map(food => (
                                                            <CommandItem key={food.id} onSelect={() => {
                                                                addFoodItem(dateStr, activeProfileId, slot.key as SlotKey, { foodId: food.id, name: food.name, calories: food.calories });
                                                            }} className="flex flex-col items-start py-2">
                                                                <div className="flex w-full justify-between items-center mb-1">
                                                                    <span className="font-medium">{food.name}</span>
                                                                    <span className="text-muted-foreground text-xs font-semibold bg-muted px-2 py-0.5 rounded-full">{food.calories} kcal</span>
                                                                </div>
                                                                <div className="flex w-full justify-between items-center">
                                                                    <span className="text-xs text-muted-foreground">{food.servingSize}</span>
                                                                    {food.id.startsWith('custom_') && (
                                                                        <span className="text-[10px] font-semibold text-electric-green bg-electric-green/10 px-1.5 py-0.5 rounded-full">Custom</span>
                                                                    )}
                                                                </div>
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

                                {/* Swipe-to-delete food item list */}
                                {slotItems.length > 0 && (
                                    <div className="space-y-1.5 mt-2">
                                        <AnimatePresence mode="popLayout">
                                            {slotItems.map((item, index) => {
                                                const qty = item.quantity || 1;
                                                const itemKey = item.id || item.foodId || `${item.name}-${index}`;
                                                return (
                                                    <motion.div
                                                        key={itemKey}
                                                        initial={{ opacity: 0, height: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, height: "auto", scale: 1 }}
                                                        exit={{ opacity: 0, height: 0, scale: 0.8, x: -200 }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                        layout
                                                    >
                                                        <SwipeableItem
                                                            itemKey={itemKey}
                                                            onDelete={() => {
                                                                removeFoodItem(
                                                                    dateStr,
                                                                    activeProfileId,
                                                                    slot.key as SlotKey,
                                                                    item.id || item.foodId || item.name
                                                                );
                                                            }}
                                                        >
                                                            <div className="flex items-center justify-between px-3 py-2">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <span className="text-sm font-medium truncate">{item.name}</span>
                                                                    {qty > 1 && (
                                                                        <span className="text-xs font-bold text-electric-green bg-electric-green/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                                                            x{qty}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs text-muted-foreground font-semibold bg-muted px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                                                                    {(Number(item.calories) || 0) * qty} kcal
                                                                </span>
                                                            </div>
                                                        </SwipeableItem>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                        <p className="text-[10px] text-muted-foreground/60 text-center pt-1 select-none">
                                            ← Swipe left to delete
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
