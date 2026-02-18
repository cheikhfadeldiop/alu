"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet/dist/leaflet.js";
import { SITE_CONFIG } from "@/constants/site-config";


import { useTranslations } from "next-intl";

interface MapLocationProps {
    latitude: number;
    longitude: number;
    title?: string;
    address?: string;
    zoom?: number;
    height?: string;
}

export function MapLocation({
    latitude,
    longitude,
    title,
    address,
    zoom = 15,
    height = "min(350px, 50vh)",
}: MapLocationProps) {
    const t = useTranslations("pages.map");
    const mapRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);

    const defaultTitle = t("defaultTitle");
    const displayTitle = title || defaultTitle;

    useEffect(() => {
        // Load Leaflet CSS and JS
        const loadLeaflet = async () => {
            try {
                // Add Leaflet CSS
                if (!document.querySelector('link[href*="leaflet.css"]')) {
                    const link = document.createElement("link");
                    link.rel = "stylesheet";
                    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
                    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
                    link.crossOrigin = "";
                    document.head.appendChild(link);
                }

                // Load Leaflet JS
                if (!(window as any).L) {
                    await new Promise<void>((resolve, reject) => {
                        const script = document.createElement("script");
                        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
                        script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
                        script.crossOrigin = "";
                        script.onload = () => resolve();
                        script.onerror = () => reject(new Error("Failed to load Leaflet"));
                        document.head.appendChild(script);
                    });
                }

                await initMap();
            } catch (err) {
                console.error("Error loading map:", err);
                setError(t("error"));
                setIsLoading(false);
            }
        };

        const initMap = async () => {
            if (!mapRef.current) return;

            const L = (window as any).L;

            // Create map
            const map = L.map(mapRef.current).setView([latitude, longitude], zoom);

            // Add OpenStreetMap tiles
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }).addTo(map);

            // Custom green marker icon
            const greenIcon = L.icon({
                iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
                        <path fill="${SITE_CONFIG.theme.colors.success}" stroke="#ffffff" stroke-width="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                        <circle cx="12" cy="9" r="2.5" fill="#ffffff"/>
                    </svg>
                `),
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40],
            });

            // Add marker
            const marker = L.marker([latitude, longitude], { icon: greenIcon }).addTo(map);

            // Add popup
            if (displayTitle || address) {
                const popupContent = `
                    <div style="padding: 8px; font-family: system-ui; min-width: 200px;">
                        ${displayTitle ? `<h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${displayTitle}</h3>` : ""}
                        ${address ? `<p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">${address}</p>` : ""}
                        <p style="margin: 0; font-size: 12px; color: #9ca3af; font-family: monospace;">
                            ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
                        </p>
                    </div>
                `;
                marker.bindPopup(popupContent).openPopup();
            }

            // Add circle around marker
            L.circle([latitude, longitude], {
                color: SITE_CONFIG.theme.colors.success,
                fillColor: SITE_CONFIG.theme.colors.success,
                fillOpacity: 0.15,
                radius: 100, // 100 meters
            }).addTo(map);

            mapInstanceRef.current = map;
            markerRef.current = marker;
            setIsLoading(false);
        };

        loadLeaflet();

        // Cleanup
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
            }
        };
    }, [latitude, longitude, displayTitle, address, zoom, t]);

    const handleDirections = () => {
        // Open OpenStreetMap directions in new tab
        window.open(
            `https://www.openstreetmap.org/directions?from=&to=${latitude},${longitude}`,
            "_blank"
        );
    };

    const handleCopyCoordinates = () => {
        navigator.clipboard.writeText(`${latitude}, ${longitude}`);
        alert(t("copied"));
    };

    const handleViewOnOSM = () => {
        window.open(
            `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${zoom}/${latitude}/${longitude}`,
            "_blank"
        );
    };

    return (
        <div className="w-full space-y-4">
            {/* Map Container */}
            <div className="relative w-full overflow-hidden rounded-sm bg-muted/5 border border-foreground/10" style={{ height }}>
                {/* Loading State */}
                {isLoading && (
                    <div
                        className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 z-10"
                        style={{ height }}
                    >
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {t("loading")}
                            </p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div
                        className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20 z-10"
                        style={{ height }}
                    >
                        <div className="text-center px-4">
                            <svg
                                className="w-12 h-12 text-red-500 mx-auto mb-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p className="text-red-600 dark:text-red-400 font-medium">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {/* Map */}
                <div ref={mapRef} style={{ height, width: "100%", zIndex: 0 }} />


            </div>

            {/* Powered by OpenStreetMap */}
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                {t("poweredBy")}{" "}
                <a
                    href="https://www.openstreetmap.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 font-medium"
                >
                    OpenStreetMap
                </a>
            </div>
        </div>

    );
}   