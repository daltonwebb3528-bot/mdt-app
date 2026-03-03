"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { LprRead } from "@/lib/types";

interface LprHeatMapProps {
  lprHistory: LprRead[];
}

export function LprHeatMap({ lprHistory }: LprHeatMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Calculate center from LPR history or default to Phoenix
    let center: [number, number] = [-111.85, 33.45];
    if (lprHistory && lprHistory.length > 0) {
      const avgLat =
        lprHistory.reduce((sum, r) => sum + r.locationLat, 0) / lprHistory.length;
      const avgLng =
        lprHistory.reduce((sum, r) => sum + r.locationLng, 0) / lprHistory.length;
      center = [avgLng, avgLat];
    }

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"],
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
      center,
      zoom: 11,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // Wait for map to load then add heat map visualization
    map.current.on("load", () => {
      if (!map.current || !lprHistory || lprHistory.length === 0) return;

      // Create GeoJSON for heat map
      const geojsonData: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: lprHistory.map((read) => ({
          type: "Feature",
          properties: {
            weight: 1,
          },
          geometry: {
            type: "Point",
            coordinates: [read.locationLng, read.locationLat],
          },
        })),
      };

      // Add source
      map.current!.addSource("lpr-reads", {
        type: "geojson",
        data: geojsonData,
      });

      // Add heat map layer
      map.current!.addLayer({
        id: "lpr-heat",
        type: "heatmap",
        source: "lpr-reads",
        paint: {
          "heatmap-weight": 1,
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 15, 3],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(0, 0, 0, 0)",
            0.2,
            "rgba(34, 197, 94, 0.5)",
            0.4,
            "rgba(234, 179, 8, 0.6)",
            0.6,
            "rgba(249, 115, 22, 0.7)",
            0.8,
            "rgba(220, 38, 38, 0.8)",
            1,
            "rgba(220, 38, 38, 1)",
          ],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 20, 15, 40],
          "heatmap-opacity": 0.8,
        },
      });

      // Add individual point markers
      map.current!.addLayer({
        id: "lpr-points",
        type: "circle",
        source: "lpr-reads",
        paint: {
          "circle-radius": 6,
          "circle-color": "#06b6d4",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.8,
        },
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [lprHistory]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" />
      {/* Map Legend */}
      <div className="absolute bottom-2 left-2 bg-mdt-panel/90 rounded p-2 text-xs">
        <p className="text-mdt-muted mb-1">Read Frequency</p>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-mdt-low"></div>
          <span className="text-mdt-muted">Low</span>
          <div className="w-3 h-3 rounded-full bg-mdt-medium ml-2"></div>
          <span className="text-mdt-muted">Med</span>
          <div className="w-3 h-3 rounded-full bg-mdt-critical ml-2"></div>
          <span className="text-mdt-muted">High</span>
        </div>
      </div>
    </div>
  );
}
