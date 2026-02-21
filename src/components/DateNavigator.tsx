"use client";

import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

export function DateNavigator() {
    const { activeDateStr, setActiveDate } = useStore();

    // Helper to get today's date string safely
    const getTodayStr = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const isToday = activeDateStr === getTodayStr();

    const adjustDate = (days: number) => {
        // Parse activeDateStr safely
        const [year, month, day] = activeDateStr.split('-').map(Number);
        const d = new Date(year, month - 1, day);
        d.setDate(d.getDate() + days);
        const newStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        setActiveDate(newStr);
    };

    // Format for display
    let displayStr = "";
    if (isToday) {
        displayStr = "Today";
    } else {
        const [year, month, day] = activeDateStr.split('-').map(Number);
        const d = new Date(year, month - 1, day);

        // Formats as "Mon, Jan 15"
        displayStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        // Check if yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
        if (activeDateStr === yesterdayStr) displayStr = "Yesterday";
    }

    return (
        <div className="flex items-center justify-between bg-muted/20 border border-muted rounded-xl p-2 w-full max-w-sm mx-auto shadow-sm">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => adjustDate(-1)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors rounded-lg"
            >
                <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-2 font-medium bg-background px-4 py-1.5 rounded-lg border shadow-sm cursor-default">
                <CalendarIcon className="w-4 h-4 text-electric-green" />
                <span>{displayStr}</span>
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => adjustDate(1)}
                disabled={isToday}
                className={`h-8 w-8 transition-colors rounded-lg ${isToday ? 'opacity-30 cursor-not-allowed' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
            >
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
    );
}
