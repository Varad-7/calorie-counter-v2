"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart2, Settings, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Home", icon: Home },
        { href: "/analytics", label: "Analytics", icon: BarChart2 },
        { href: "/recipes", label: "Recipes", icon: Utensils },
        { href: "/settings", label: "Settings", icon: Settings },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t pb-safe">
            <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div
                                className={cn(
                                    "p-1.5 rounded-xl transition-all duration-300",
                                    isActive && "bg-primary/10"
                                )}
                            >
                                <Icon className={cn("w-5 h-5", isActive && "fill-primary/20")} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className="text-[10px] font-medium">{link.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
