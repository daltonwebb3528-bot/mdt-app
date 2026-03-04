"use client";

import { useState } from "react";

const BEATS = [
  { id: "beat-1a", name: "Beat 1A - Downtown Core" },
  { id: "beat-1b", name: "Beat 1B - Downtown East" },
  { id: "beat-2a", name: "Beat 2A - Midtown North" },
  { id: "beat-2b", name: "Beat 2B - Midtown South" },
  { id: "beat-3a", name: "Beat 3A - Westside" },
  { id: "beat-3b", name: "Beat 3B - West Industrial" },
  { id: "beat-4a", name: "Beat 4A - Eastside Residential" },
  { id: "beat-4b", name: "Beat 4B - East Commercial" },
  { id: "beat-5a", name: "Beat 5A - North Hills" },
  { id: "beat-5b", name: "Beat 5B - North Valley" },
  { id: "beat-6a", name: "Beat 6A - South Central" },
  { id: "beat-6b", name: "Beat 6B - South Industrial" },
  { id: "highway", name: "Highway Patrol - All Corridors" },
  { id: "citywide", name: "Citywide - All Beats" },
];

export default function LoginPage() {
  const [unit, setUnit] = useState("");
  const [selectedBeats, setSelectedBeats] = useState<string[]>(["citywide"]);

  const handleBeatToggle = (beatId: string) => {
    setSelectedBeats((prev) =>
      prev.includes(beatId)
        ? prev.filter((id) => id !== beatId)
        : [...prev, beatId]
    );
  };

  const handleStart = () => {
    if (!unit.trim()) {
      alert("Please enter your unit number");
      return;
    }

    try {
      localStorage.setItem("mdt_unit", unit.toUpperCase());
      localStorage.setItem("mdt_beats", JSON.stringify(selectedBeats));
    } catch (e) {
      console.error("localStorage error:", e);
    }

    window.location.replace("/");
  };

  return (
    <div className="min-h-screen bg-[#38494c] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-[#38494c] rounded-lg border border-[#2d3548] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#337f6c] px-6 py-4 border-b border-[#2d3548]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🚔</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Mobile Data Terminal</h1>
              <p className="text-white/80 text-sm">Flock Safety Integration Platform</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row">
          {/* Left - QR Code */}
          <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-[#2d3548] flex flex-col items-center justify-center">
            <div className="bg-white p-4 rounded-lg mb-4">
              <div className="w-44 h-44 bg-gray-200 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-40 h-40">
                  <rect width="100" height="100" fill="white"/>
                  <rect x="5" y="5" width="25" height="25" fill="black"/>
                  <rect x="10" y="10" width="15" height="15" fill="white"/>
                  <rect x="12" y="12" width="11" height="11" fill="black"/>
                  <rect x="70" y="5" width="25" height="25" fill="black"/>
                  <rect x="75" y="10" width="15" height="15" fill="white"/>
                  <rect x="77" y="12" width="11" height="11" fill="black"/>
                  <rect x="5" y="70" width="25" height="25" fill="black"/>
                  <rect x="10" y="75" width="15" height="15" fill="white"/>
                  <rect x="12" y="77" width="11" height="11" fill="black"/>
                  <rect x="35" y="5" width="5" height="5" fill="black"/>
                  <rect x="45" y="5" width="5" height="5" fill="black"/>
                  <rect x="55" y="5" width="5" height="5" fill="black"/>
                  <rect x="35" y="15" width="5" height="5" fill="black"/>
                  <rect x="50" y="15" width="5" height="5" fill="black"/>
                  <rect x="40" y="40" width="20" height="20" fill="black"/>
                  <rect x="45" y="45" width="10" height="10" fill="white"/>
                  <rect x="47" y="47" width="6" height="6" fill="black"/>
                </svg>
              </div>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Link Your Location</h2>
            <p className="text-[#94a3b8] text-sm text-center max-w-xs">
              Scan this QR code with the <span className="text-[#337f6c] font-semibold">Flock Mobile App</span> to share your live location with dispatch.
            </p>
            <div className="mt-6 p-3 bg-[#414f64] rounded-lg border border-[#2d3548]">
              <div className="flex items-center gap-2 text-[#94a3b8] text-xs">
                <span className="w-2 h-2 bg-[#337f6c] rounded-full animate-pulse"></span>
                <span>Waiting for mobile connection...</span>
              </div>
            </div>
          </div>

          {/* Right - Form */}
          <div className="flex-1 p-8">
            <div className="space-y-6">
              {/* Unit Input */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  What unit are you working today?
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value.toUpperCase())}
                  placeholder="e.g., 4A21, 2B15, M7"
                  className="w-full px-4 py-3 bg-[#414f64] border border-[#2d3548] rounded-lg text-white text-lg font-mono placeholder:text-[#64748b] focus:outline-none focus:border-[#337f6c]"
                  maxLength={10}
                />
              </div>

              {/* Beat Selection */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  What areas do you want to receive alerts from?
                </label>
                <div className="bg-[#414f64] border border-[#2d3548] rounded-lg p-3 max-h-64 overflow-y-auto">
                  {BEATS.map((beat) => (
                    <label
                      key={beat.id}
                      className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer ${
                        selectedBeats.includes(beat.id)
                          ? "bg-[#337f6c]/30"
                          : "hover:bg-[#38494c]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedBeats.includes(beat.id)}
                        onChange={() => handleBeatToggle(beat.id)}
                        className="w-4 h-4 accent-[#337f6c]"
                      />
                      <span className={`text-sm ${selectedBeats.includes(beat.id) ? "text-white" : "text-[#e2e8f0]"}`}>
                        {beat.name}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-[#64748b] mt-2">
                  {selectedBeats.length} area{selectedBeats.length !== 1 ? "s" : ""} selected
                </p>
              </div>

              {/* Start Button */}
              <button
                type="button"
                onClick={handleStart}
                className="w-full py-4 rounded-lg font-bold text-lg bg-[#337f6c] text-white hover:bg-[#337f6c]/90 active:scale-[0.99] transition-all"
              >
                Start Shift
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#414f64] px-6 py-3 border-t border-[#2d3548] flex justify-between">
          <p className="text-xs text-[#64748b]">MDT v1.0.0 • Proof of Concept</p>
          <p className="text-xs text-[#64748b]">© 2025 Flock Safety</p>
        </div>
      </div>
    </div>
  );
}
