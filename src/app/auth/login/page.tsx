"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [unit, setUnit] = useState("");
  const [selectedBeats, setSelectedBeats] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleBeatToggle = (beatId: string) => {
    if (beatId === "citywide") {
      // If citywide is selected, select all beats
      if (selectedBeats.includes("citywide")) {
        setSelectedBeats([]);
      } else {
        setSelectedBeats(BEATS.map((b) => b.id));
      }
    } else {
      setSelectedBeats((prev) =>
        prev.includes(beatId)
          ? prev.filter((id) => id !== beatId)
          : [...prev, beatId]
      );
    }
  };

  const handleStart = () => {
    if (!unit.trim()) {
      alert("Please enter your unit number");
      return;
    }
    if (selectedBeats.length === 0) {
      alert("Please select at least one beat");
      return;
    }

    setIsLoading(true);

    // Store in localStorage for the session
    localStorage.setItem("mdt_unit", unit.toUpperCase());
    localStorage.setItem("mdt_beats", JSON.stringify(selectedBeats));

    // Redirect to main app
    setTimeout(() => {
      router.push("/");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-mdt-bg flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-mdt-panel rounded-lg border border-mdt-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-4 border-b border-mdt-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🚔</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Mobile Data Terminal
              </h1>
              <p className="text-blue-200 text-sm">
                Flock Safety Integration Platform
              </p>
            </div>
          </div>
        </div>

        {/* Main Content - Two Columns */}
        <div className="flex flex-col md:flex-row">
          {/* Left Side - QR Code */}
          <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-mdt-border flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg inline-block mb-4">
                {/* QR Code Placeholder */}
                <svg
                  width="180"
                  height="180"
                  viewBox="0 0 180 180"
                  className="text-black"
                >
                  {/* QR Code Pattern - Simplified representation */}
                  <rect width="180" height="180" fill="white" />
                  {/* Corner squares */}
                  <rect x="10" y="10" width="40" height="40" fill="black" />
                  <rect x="15" y="15" width="30" height="30" fill="white" />
                  <rect x="20" y="20" width="20" height="20" fill="black" />

                  <rect x="130" y="10" width="40" height="40" fill="black" />
                  <rect x="135" y="15" width="30" height="30" fill="white" />
                  <rect x="140" y="20" width="20" height="20" fill="black" />

                  <rect x="10" y="130" width="40" height="40" fill="black" />
                  <rect x="15" y="135" width="30" height="30" fill="white" />
                  <rect x="20" y="140" width="20" height="20" fill="black" />

                  {/* Data pattern */}
                  <rect x="60" y="10" width="10" height="10" fill="black" />
                  <rect x="80" y="10" width="10" height="10" fill="black" />
                  <rect x="100" y="10" width="10" height="10" fill="black" />
                  <rect x="60" y="30" width="10" height="10" fill="black" />
                  <rect x="90" y="30" width="10" height="10" fill="black" />
                  <rect x="110" y="30" width="10" height="10" fill="black" />

                  <rect x="10" y="60" width="10" height="10" fill="black" />
                  <rect x="30" y="60" width="10" height="10" fill="black" />
                  <rect x="10" y="80" width="10" height="10" fill="black" />
                  <rect x="30" y="80" width="10" height="10" fill="black" />
                  <rect x="10" y="100" width="10" height="10" fill="black" />

                  <rect x="60" y="60" width="10" height="10" fill="black" />
                  <rect x="80" y="60" width="10" height="10" fill="black" />
                  <rect x="100" y="60" width="10" height="10" fill="black" />
                  <rect x="70" y="70" width="10" height="10" fill="black" />
                  <rect x="90" y="70" width="10" height="10" fill="black" />
                  <rect x="110" y="70" width="10" height="10" fill="black" />
                  <rect x="60" y="80" width="10" height="10" fill="black" />
                  <rect x="80" y="80" width="10" height="10" fill="black" />
                  <rect x="100" y="80" width="10" height="10" fill="black" />
                  <rect x="70" y="90" width="10" height="10" fill="black" />
                  <rect x="90" y="90" width="10" height="10" fill="black" />
                  <rect x="60" y="100" width="10" height="10" fill="black" />
                  <rect x="80" y="100" width="10" height="10" fill="black" />
                  <rect x="100" y="100" width="10" height="10" fill="black" />

                  <rect x="130" y="60" width="10" height="10" fill="black" />
                  <rect x="150" y="60" width="10" height="10" fill="black" />
                  <rect x="140" y="70" width="10" height="10" fill="black" />
                  <rect x="160" y="70" width="10" height="10" fill="black" />
                  <rect x="130" y="80" width="10" height="10" fill="black" />
                  <rect x="150" y="80" width="10" height="10" fill="black" />
                  <rect x="140" y="90" width="10" height="10" fill="black" />
                  <rect x="160" y="90" width="10" height="10" fill="black" />
                  <rect x="130" y="100" width="10" height="10" fill="black" />
                  <rect x="150" y="100" width="10" height="10" fill="black" />

                  <rect x="60" y="130" width="10" height="10" fill="black" />
                  <rect x="80" y="130" width="10" height="10" fill="black" />
                  <rect x="100" y="130" width="10" height="10" fill="black" />
                  <rect x="70" y="140" width="10" height="10" fill="black" />
                  <rect x="90" y="140" width="10" height="10" fill="black" />
                  <rect x="60" y="150" width="10" height="10" fill="black" />
                  <rect x="80" y="150" width="10" height="10" fill="black" />
                  <rect x="100" y="150" width="10" height="10" fill="black" />
                  <rect x="70" y="160" width="10" height="10" fill="black" />
                  <rect x="90" y="160" width="10" height="10" fill="black" />

                  <rect x="130" y="130" width="10" height="10" fill="black" />
                  <rect x="150" y="130" width="10" height="10" fill="black" />
                  <rect x="140" y="140" width="10" height="10" fill="black" />
                  <rect x="160" y="140" width="10" height="10" fill="black" />
                  <rect x="130" y="150" width="10" height="10" fill="black" />
                  <rect x="150" y="150" width="10" height="10" fill="black" />
                  <rect x="140" y="160" width="10" height="10" fill="black" />
                  <rect x="160" y="160" width="10" height="10" fill="black" />
                </svg>
              </div>

              <h2 className="text-lg font-bold text-white mb-2">
                Link Your Location
              </h2>
              <p className="text-mdt-muted text-sm max-w-xs">
                Scan this QR code with the{" "}
                <span className="text-mdt-info font-semibold">
                  Flock Mobile App
                </span>{" "}
                to share your live location with dispatch and enable proximity
                alerts.
              </p>

              <div className="mt-6 p-3 bg-mdt-bg rounded-lg border border-mdt-border">
                <div className="flex items-center gap-2 text-mdt-muted text-xs">
                  <span className="w-2 h-2 bg-mdt-low rounded-full animate-pulse"></span>
                  <span>Waiting for mobile connection...</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Unit & Beat Selection */}
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
                  className="w-full px-4 py-3 bg-mdt-bg border border-mdt-border rounded-lg text-white text-lg font-mono placeholder:text-mdt-muted focus:outline-none focus:border-mdt-info focus:ring-1 focus:ring-mdt-info"
                  maxLength={10}
                />
              </div>

              {/* Beat Selection */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  What areas do you want to receive alerts from?
                </label>
                <div className="bg-mdt-bg border border-mdt-border rounded-lg p-3 max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-1 gap-1">
                    {BEATS.map((beat) => (
                      <label
                        key={beat.id}
                        className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors ${
                          selectedBeats.includes(beat.id)
                            ? "bg-mdt-info/20 border border-mdt-info"
                            : "hover:bg-mdt-panel border border-transparent"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedBeats.includes(beat.id)}
                          onChange={() => handleBeatToggle(beat.id)}
                          className="w-4 h-4 rounded border-mdt-border text-mdt-info focus:ring-mdt-info focus:ring-offset-0 bg-mdt-bg"
                        />
                        <span
                          className={`text-sm ${
                            selectedBeats.includes(beat.id)
                              ? "text-white font-medium"
                              : "text-mdt-text"
                          }`}
                        >
                          {beat.name}
                        </span>
                        {beat.id === "citywide" && (
                          <span className="ml-auto text-xs text-mdt-muted">
                            Select All
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-mdt-muted mt-2">
                  {selectedBeats.length} beat
                  {selectedBeats.length !== 1 ? "s" : ""} selected
                </p>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStart}
                disabled={isLoading}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                  isLoading
                    ? "bg-mdt-muted text-mdt-bg cursor-not-allowed"
                    : "bg-mdt-info text-white hover:bg-mdt-info/90 active:scale-[0.99]"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Starting MDT...
                  </span>
                ) : (
                  "Start Shift"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-mdt-bg px-6 py-3 border-t border-mdt-border flex items-center justify-between">
          <p className="text-xs text-mdt-muted">
            MDT v1.0.0 • Proof of Concept
          </p>
          <p className="text-xs text-mdt-muted">
            © 2025 Flock Safety • For Demo Purposes Only
          </p>
        </div>
      </div>
    </div>
  );
}
