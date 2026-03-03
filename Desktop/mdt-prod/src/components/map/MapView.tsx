"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useAlertStore } from "@/stores/alertStore";
import { useTabStore } from "@/stores/tabStore";

const priorityColors = {
  1: "#ef4444",
  2: "#f97316",
  3: "#eab308",
  4: "#22c55e",
};

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const { alerts } = useAlertStore();
  const { openAlertTab } = useTabStore();

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors © CARTO",
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
      },
      center: [-111.85, 33.45],
      zoom: 12,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update markers when alerts change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach((m) => m.remove());
    markers.current = [];

    // Add new markers
    alerts.forEach((alert) => {
      const el = document.createElement("div");
      el.className = "alert-marker";
      el.style.width = "24px";
      el.style.height = "24px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = priorityColors[alert.priority];
      el.style.border = "2px solid white";
      el.style.cursor = "pointer";
      el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.5)";

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([alert.locationLng, alert.locationLat])
        .addTo(map.current!);

      el.addEventListener("click", () => openAlertTab(alert));

      markers.current.push(marker);
    });
  }, [alerts, openAlertTab]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
