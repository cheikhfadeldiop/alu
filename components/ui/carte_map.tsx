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
    height = "500px",
}: MapLocationProps) {
    const t = useTranslations("map");
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
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-white/10">
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

                {/* Floating Action Buttons */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-[1000]">
                    <button
                        onClick={handleDirections}
                        className="p-3 bg-background/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-white/10 group"
                        title={t("common.itinerary")}
                    >
                        <svg
                            className="w-5 h-5 text-green-600 group-hover:text-green-700"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                            />
                        </svg>
                    </button>

                    <button
                        onClick={handleCopyCoordinates}
                        className="p-3 bg-background/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-white/10 group"
                        title="Copier les coordonnées"
                    >
                        <svg
                            className="w-5 h-5 text-red-600 group-hover:text-red-700"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                        </svg>
                    </button>

                    <button
                        onClick={handleViewOnOSM}
                        className="p-3 bg-background/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-white/10 group"
                        title={t("common.viewOSM")}
                    >
                        <svg
                            className="w-5 h-5 text-blue-600 group-hover:text-blue-700"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                        </svg>
                    </button>
                </div>
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