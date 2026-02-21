"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            const basePath = "/calorie-counter-v2";
            navigator.serviceWorker
                .register(`${basePath}/sw.js`, { scope: `${basePath}/` })
                .then((registration) => {
                    console.log("SW registered:", registration.scope);
                })
                .catch((err) => {
                    console.log("SW registration failed:", err);
                });
        }
    }, []);

    return null;
}
