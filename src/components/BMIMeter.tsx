"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface BMIMeterProps {
    weight: number;
    height: number;
}

export function BMIMeter({ weight, height }: BMIMeterProps) {
    const { bmi, category, color, positionPercent } = useMemo(() => {
        if (!weight || !height || height <= 0) {
            return { bmi: "0.0", category: "Unknown", color: "bg-gray-500", positionPercent: 0 };
        }

        const heightInMeters = height / 100;
        const calculatedBmi = weight / (heightInMeters * heightInMeters);

        // Map BMI 15 to 40 to 0% to 100% position on the bar
        const minBMI = 15;
        const maxBMI = 40;
        const percent = Math.max(0, Math.min(100, ((calculatedBmi - minBMI) / (maxBMI - minBMI)) * 100));

        let cat = "Underweight";
        let col = "bg-blue-500 text-blue-500";
        if (calculatedBmi >= 18.5 && calculatedBmi < 25) {
            cat = "Normal Weight";
            col = "bg-green-500 text-green-500";
        } else if (calculatedBmi >= 25 && calculatedBmi < 30) {
            cat = "Overweight";
            col = "bg-orange-500 text-orange-500";
        } else if (calculatedBmi >= 30) {
            cat = "Obese";
            col = "bg-red-500 text-red-500";
        }

        return {
            bmi: calculatedBmi.toFixed(1),
            category: cat,
            color: col,
            positionPercent: percent
        };
    }, [weight, height]);

    if (!height || height <= 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> BMI & Category</CardTitle>
                    <CardDescription>Body Mass Index</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center p-4 text-muted-foreground">
                        Please update your profile to include your height to see your BMI.
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="animate-in fade-in duration-500 delay-150">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> BMI & Category</CardTitle>
                <CardDescription>Based on your profile height ({height}cm) and weight ({weight}kg)</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center gap-6">
                    <div className="text-center">
                        <div className="text-5xl font-bold tracking-tighter">{bmi}</div>
                        <div className={`mt-2 font-bold tracking-wide uppercase text-sm ${color.split(' ')[1]}`}>
                            {category}
                        </div>
                    </div>

                    <div className="w-full relative mt-8 pt-4 pb-2 px-2 sm:px-4">
                        {/* The animated marker */}
                        <motion.div
                            className="absolute top-0 -ml-4 z-10"
                            initial={{ left: "0%" }}
                            animate={{ left: `${positionPercent}%` }}
                            transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.3 }}
                        >
                            <div className="flex flex-col items-center">
                                <div className="text-xs font-bold bg-foreground text-background px-2 py-0.5 rounded-md shadow-md mb-1">
                                    You
                                </div>
                                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-foreground" />
                            </div>
                        </motion.div>

                        {/* The categories bar */}
                        <div className="h-4 w-full rounded-full overflow-hidden flex bg-gray-200 dark:bg-gray-800">
                            {/* 15 to 18.5 (14%) */}
                            <div className="h-full bg-blue-500" style={{ width: '14%' }}></div>
                            {/* 18.5 to 25 (26%) */}
                            <div className="h-full bg-green-500" style={{ width: '26%' }}></div>
                            {/* 25 to 30 (20%) */}
                            <div className="h-full bg-orange-500" style={{ width: '20%' }}></div>
                            {/* 30 to 40 (40%) */}
                            <div className="h-full bg-red-500" style={{ width: '40%' }}></div>
                        </div>

                        {/* Labels */}
                        <div className="relative w-full h-4 mt-2 text-[10px] sm:text-xs text-muted-foreground font-medium">
                            <span className="absolute left-0 -translate-x-1/2">15</span>
                            <span className="absolute left-[14%] -translate-x-1/2">18.5</span>
                            <span className="absolute left-[40%] -translate-x-1/2">25</span>
                            <span className="absolute left-[60%] -translate-x-1/2">30</span>
                            <span className="absolute right-0 translate-x-1/2">40</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

