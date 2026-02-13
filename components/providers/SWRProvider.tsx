"use client";

import { SWRConfig } from "swr";
import { SITE_CONFIG } from "@/constants/site-config";

export function SWRProvider({ children }: { children: React.ReactNode }) {
    return (
        <SWRConfig
            value={{
                revalidateOnFocus: true,
                revalidateIfStale: true,
                dedupingInterval: 2000,
                // Default caching behavior based on refresh controller
                refreshInterval: (data) => {
                    // Logic to determine refresh interval based on data type can go here
                    // For now we use standard default
                    return SITE_CONFIG.api.cache.ttl.standard;
                }
            }}
        >
            {children}
        </SWRConfig>
    );
}
