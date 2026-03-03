"use client";

import { useState } from "react";

interface Camera {
  id: string;
  name: string;
  location: string;
  status: "LIVE" | "RECORDED";
  viewers: number;
  group?: string;
}

const cameraGroups = [
  {
    name: "Euclid OH Condor Demo",
    cameras: [
      { id: "C001", name: "283 @ Bliss", location: "Intersection" },
    ],
  },
  {
    name: "Flock Warehouse - PTZ Demo Cameras",
    cameras: [
      { id: "C#001", name: "Zoom Solar PTZ Demo outside coop", location: "Warehouse" },
      { id: "C#002", name: "UW Solar PTZ Demo outside coop", location: "Warehouse" },
    ],
  },
  {
    name: "District 4 - Main Corridors",
    cameras: [
      { id: "C010", name: "4700 Central Ave @ Riser Chrysler - PTZ", location: "Commercial" },
      { id: "C011", name: "4500 Central Ave @ Sonic - PTZ", location: "Commercial" },
      { id: "C#055", name: "3401 E Polk - NE Parking Lot (Wing)", location: "Residential" },
      { id: "C#093", name: "Garfield Apts E Walking Path (Wing)", location: "Residential" },
      { id: "C#094", name: "Garfield Apts S Playground (Wing)", location: "Residential" },
      { id: "C#095", name: "Garfield Apts Dumpster (Wing)", location: "Residential" },
      { id: "C#096", name: "3401 E Polk - Apt Office (Wing)", location: "Residential" },
      { id: "C#097", name: "Eldorado Basketball Court (Wing)", location: "Parks" },
      { id: "C#098", name: "E Coronado HOA E Entrance (Wing)", location: "Residential" },
    ],
  },
  {
    name: "LPR Cameras",
    cameras: [
      { id: "LPR01", name: "Falcon LPR Live demo camera", location: "Mobile" },
      { id: "LPR02", name: "LPR Live Oakdale Rd/Oak Dr", location: "Fixed" },
      { id: "LPR03", name: "Oakdale Rd/Oak Dr - Video", location: "Fixed" },
    ],
  },
  {
    name: "Solar PTZ Units",
    cameras: [
      { id: "PTZ01", name: "PVT Highlands Pkwy 3ln - UW", location: "Highway" },
      { id: "PTZ02", name: "Solar PTZ Demo 2 outside UW", location: "Demo" },
      { id: "PTZ03", name: "Solar PTZ Demo 2 outside zoom", location: "Demo" },
    ],
  },
];

// Flatten cameras for grid display
const allCameras: Camera[] = cameraGroups.flatMap((group) =>
  group.cameras.map((cam) => ({
    ...cam,
    status: Math.random() > 0.15 ? "LIVE" as const : "RECORDED" as const,
    viewers: Math.floor(Math.random() * 3) + 1,
    group: group.name,
  }))
);

export function VMSView() {
  const [gridSize, setGridSize] = useState<"2x2" | "3x3" | "4x4">("3x3");
  const [selectedCameras, setSelectedCameras] = useState<string[]>(
    allCameras.slice(0, 9).map((c) => c.id)
  );
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    cameraGroups.map((g) => g.name)
  );
  const [searchQuery, setSearchQuery] = useState("");

  const gridCols = gridSize === "2x2" ? 2 : gridSize === "3x3" ? 3 : 4;
  const maxCameras = gridCols * gridCols;

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupName)
        ? prev.filter((g) => g !== groupName)
        : [...prev, groupName]
    );
  };

  const toggleCamera = (cameraId: string) => {
    setSelectedCameras((prev) => {
      if (prev.includes(cameraId)) {
        return prev.filter((id) => id !== cameraId);
      }
      if (prev.length >= maxCameras) {
        return [...prev.slice(1), cameraId];
      }
      return [...prev, cameraId];
    });
  };

  const clearGrid = () => setSelectedCameras([]);

  const displayedCameras = selectedCameras
    .map((id) => allCameras.find((c) => c.id === id))
    .filter(Boolean)
    .slice(0, maxCameras);

  const filteredGroups = cameraGroups.map((group) => ({
    ...group,
    cameras: group.cameras.filter(
      (cam) =>
        cam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cam.id.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((group) => group.cameras.length > 0);

  return (
    <div className="h-full flex bg-mdt-bg">
      {/* Left Sidebar - Camera List */}
      <div className="w-72 border-r border-mdt-border flex flex-col bg-mdt-panel">
        {/* Search */}
        <div className="p-2 border-b border-mdt-border">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cameras..."
            className="w-full px-3 py-2 bg-mdt-bg border border-mdt-border rounded text-sm focus:outline-none focus:border-mdt-info"
          />
        </div>

        {/* Camera Groups */}
        <div className="flex-1 overflow-y-auto">
          {filteredGroups.map((group) => (
            <div key={group.name}>
              <button
                onClick={() => toggleGroup(group.name)}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-mdt-bg text-left border-b border-mdt-border/50"
              >
                <span className="text-mdt-muted">
                  {expandedGroups.includes(group.name) ? "▼" : "▶"}
                </span>
                <span className="text-sm font-semibold truncate">{group.name}</span>
              </button>

              {expandedGroups.includes(group.name) && (
                <div className="bg-mdt-bg/50">
                  {group.cameras.map((cam) => {
                    const isSelected = selectedCameras.includes(cam.id);
                    return (
                      <button
                        key={cam.id}
                        onClick={() => toggleCamera(cam.id)}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-mdt-border/50 border-l-2 ${
                          isSelected
                            ? "border-l-mdt-info bg-mdt-info/10"
                            : "border-l-transparent"
                        }`}
                      >
                        <p className="truncate">{cam.name}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content - Camera Grid */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-12 bg-mdt-panel border-b border-mdt-border flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {/* Grid Size Selector */}
            <select
              value={gridSize}
              onChange={(e) => setGridSize(e.target.value as typeof gridSize)}
              className="px-3 py-1.5 bg-mdt-bg border border-mdt-border rounded text-sm focus:outline-none focus:border-mdt-info"
            >
              <option value="2x2">2×2</option>
              <option value="3x3">3×3</option>
              <option value="4x4">4×4</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={clearGrid}
              className="px-3 py-1.5 bg-mdt-border hover:bg-mdt-border/80 rounded text-sm flex items-center gap-2"
            >
              <span>↻</span> Clear Grid
            </button>
            <button className="px-3 py-1.5 bg-mdt-info/20 text-mdt-info hover:bg-mdt-info/30 rounded text-sm flex items-center gap-2">
              <span>✦</span> Freeform Search
            </button>
          </div>
        </div>

        {/* Camera Grid */}
        <div className="flex-1 p-2 overflow-hidden">
          <div
            className={`grid gap-2 h-full`}
            style={{
              gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
              gridTemplateRows: `repeat(${gridCols}, 1fr)`,
            }}
          >
            {Array.from({ length: maxCameras }).map((_, idx) => {
              const camera = displayedCameras[idx];
              
              if (!camera) {
                return (
                  <div
                    key={idx}
                    className="bg-mdt-panel border border-mdt-border rounded flex items-center justify-center"
                  >
                    <div className="text-center text-mdt-muted">
                      <p className="text-2xl mb-1">📷</p>
                      <p className="text-xs">No camera</p>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={camera.id}
                  className="bg-mdt-panel border border-mdt-border rounded overflow-hidden flex flex-col relative group"
                >
                  {/* Camera Header */}
                  <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-2 py-1 bg-gradient-to-b from-black/70 to-transparent">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                          camera.status === "LIVE"
                            ? "bg-mdt-low text-mdt-bg"
                            : "bg-mdt-muted text-mdt-bg"
                        }`}
                      >
                        {camera.status}
                      </span>
                      <span className="text-xs text-white truncate max-w-[200px]">
                        {camera.id} {camera.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-white">
                      <span className="text-xs">👁</span>
                      <span className="text-xs">{camera.viewers}</span>
                    </div>
                  </div>

                  {/* Camera Feed Placeholder */}
                  <div className="flex-1 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 flex items-center justify-center">
                    {/* Simulated camera view */}
                    <div className="w-full h-full relative">
                      {/* Fake scene */}
                      <div className="absolute inset-0 flex items-end justify-center pb-4">
                        <div className="w-3/4 h-1/3 bg-gray-600/30 rounded-t-lg" />
                      </div>
                      {/* Timestamp overlay */}
                      <div className="absolute bottom-2 left-2 text-[10px] text-white/70 font-mono">
                        {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  {/* Hover Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex justify-center gap-2">
                    <button className="px-2 py-1 bg-mdt-border/80 rounded text-xs hover:bg-mdt-border">
                      +
                    </button>
                    <button className="px-2 py-1 bg-mdt-border/80 rounded text-xs hover:bg-mdt-border">
                      −
                    </button>
                    <button className="px-2 py-1 bg-mdt-border/80 rounded text-xs hover:bg-mdt-border">
                      🏠
                    </button>
                    <button className="px-2 py-1 bg-mdt-border/80 rounded text-xs hover:bg-mdt-border">
                      ⛶
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
