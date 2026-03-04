"use client";

import dynamic from "next/dynamic";
import type { PlateSearchResult, PersonSearchResult } from "@/lib/types";
import { useTabStore } from "@/stores/tabStore";

// Dynamically import map component to avoid SSR issues
const LprHeatMap = dynamic(() => import("./LprHeatMap").then((mod) => mod.LprHeatMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-mdt-bg">
      <div className="text-center text-mdt-muted">
        <span className="text-3xl">🗺️</span>
        <p className="text-xs mt-2">Loading map...</p>
      </div>
    </div>
  ),
});

interface PlateResultsProps {
  data: PlateSearchResult;
}

export function PlateResults({ data }: PlateResultsProps) {
  const { vehicle, owner, lprHistory, aiSummary } = data;
  const { addTab } = useTabStore();
  const isStolen = vehicle?.ncicStatus?.stolen;
  const hasWarrant = (owner?.ncicStatus?.warrants?.length ?? 0) > 0;
  const hasAlerts = (owner?.ncicStatus?.alerts?.length ?? 0) > 0;

  // Group LPR reads by date
  const groupedReads = lprHistory?.reduce((groups, read) => {
    const date = new Date(read.timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(read);
    return groups;
  }, {} as Record<string, typeof lprHistory>);

  const handleOwnerClick = () => {
    if (owner) {
      addTab({
        id: `person-${Date.now()}`,
        type: "person-search",
        title: `Person: ${owner.firstName} ${owner.lastName}`,
        data: { persons: [owner] } as PersonSearchResult,
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-mdt-bg">
      {/* Header */}
      <div
        className={`px-3 py-2 border-b flex items-center justify-between ${
          isStolen
            ? "bg-mdt-critical/20 border-mdt-critical"
            : "bg-mdt-panel border-mdt-border"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚗</span>
          <span className="font-mono font-bold text-2xl text-mdt-info">
            {vehicle?.plate}
          </span>
          {isStolen && (
            <span className="px-2 py-0.5 bg-mdt-critical text-white text-xs font-bold rounded animate-pulse">
              STOLEN
            </span>
          )}
          {hasWarrant && (
            <span className="px-2 py-0.5 bg-mdt-high text-black text-xs font-bold rounded">
              OWNER WARRANT
            </span>
          )}
        </div>
        <span className="text-sm text-mdt-muted">{vehicle?.state}</span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Col 1 - Vehicle Analysis (35%) */}
        <div className="w-[35%] border-r border-mdt-border p-2 flex flex-col overflow-y-auto">
          <p className="text-[10px] text-mdt-info font-bold mb-2">
            🔍 VEHICLE ANALYSIS
          </p>

          {/* NCIC Return */}
          <div className="mb-3">
            <p className="text-[10px] text-mdt-muted font-semibold mb-1">
              NCIC RETURN
            </p>
            <div
              className={`rounded p-2 ${
                isStolen
                  ? "bg-mdt-critical/20 border border-mdt-critical"
                  : "bg-mdt-panel"
              }`}
            >
              {isStolen && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-mdt-critical font-bold">
                    ⚠️ STOLEN VEHICLE
                  </span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div>
                  <span className="text-mdt-muted">Status</span>
                  <p
                    className={`font-semibold ${
                      isStolen ? "text-mdt-critical" : "text-mdt-low"
                    }`}
                  >
                    {isStolen ? "STOLEN" : "CLEAR"}
                  </p>
                </div>
                <div>
                  <span className="text-mdt-muted">Wanted</span>
                  <p className="font-semibold text-mdt-low">NO</p>
                </div>
                {isStolen && (
                  <>
                    <div>
                      <span className="text-mdt-muted">Stolen Date</span>
                      <p className="font-semibold">
                        {vehicle?.ncicStatus?.stolenDate || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <span className="text-mdt-muted">Case #</span>
                      <p className="font-semibold">
                        {vehicle?.ncicStatus?.caseNumber || "N/A"}
                      </p>
                    </div>
                  </>
                )}
                <div>
                  <span className="text-mdt-muted">Registration</span>
                  <p className="font-semibold text-mdt-low">VALID</p>
                </div>
                <div>
                  <span className="text-mdt-muted">Insurance</span>
                  <p className="font-semibold text-mdt-low">ACTIVE</p>
                </div>
              </div>
            </div>
          </div>

          {/* Registered Owner */}
          <div className="mb-3">
            <p className="text-[10px] text-mdt-muted font-semibold mb-1">
              REGISTERED OWNER
            </p>
            {owner ? (
              <div
                className={`rounded p-2 ${
                  hasWarrant
                    ? "bg-mdt-critical/20 border border-mdt-critical"
                    : hasAlerts
                    ? "bg-mdt-high/20 border border-mdt-high"
                    : "bg-mdt-panel"
                }`}
              >
                <div
                  className="flex items-center justify-between cursor-pointer hover:text-mdt-info"
                  onClick={handleOwnerClick}
                >
                  <span className="font-bold text-sm">
                    {owner.firstName} {owner.lastName}
                  </span>
                  <span className="text-mdt-info text-xs">→ Search</span>
                </div>
                <p className="text-xs text-mdt-muted mt-1">
                  DOB: {new Date(owner.dob).toLocaleDateString()}
                </p>
                <p className="text-xs text-mdt-muted">
                  DL: {owner.dlNumber} ({owner.dlState})
                </p>
                <p className="text-xs text-mdt-muted mt-1">{owner.address}</p>

                {hasWarrant && (
                  <div className="mt-2 pt-2 border-t border-mdt-critical/50">
                    <p className="font-bold text-mdt-critical text-xs">
                      ⚠️ ACTIVE WARRANTS
                    </p>
                    {owner.ncicStatus.warrants.map((w, i) => (
                      <p key={i} className="text-xs mt-0.5">
                        <span className="font-semibold">{w.type}</span>:{" "}
                        {w.description}
                      </p>
                    ))}
                  </div>
                )}

                {hasAlerts && (
                  <div className="mt-2 pt-2 border-t border-mdt-high/50">
                    <p className="font-bold text-mdt-high text-xs">
                      ⚠️ ALERTS
                    </p>
                    {owner.ncicStatus.alerts.map((a, i) => (
                      <p key={i} className="text-xs">
                        {a}
                      </p>
                    ))}
                  </div>
                )}

                {!hasWarrant && !hasAlerts && (
                  <div className="mt-2 pt-2 border-t border-mdt-low/50">
                    <p className="font-bold text-mdt-low text-xs">✓ CLEAR</p>
                    <p className="text-xs text-mdt-muted">
                      No warrants or alerts
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-mdt-panel rounded p-2">
                <p className="text-mdt-muted text-sm">Owner info unavailable</p>
              </div>
            )}
          </div>

          {/* RMS Vehicle History */}
          <div className="mb-3">
            <p className="text-[10px] text-mdt-muted font-semibold mb-1">
              RMS VEHICLE HISTORY
            </p>
            <div className="bg-mdt-panel rounded p-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-mdt-muted">Traffic Stops</span>
                  <span className="font-semibold">2</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-mdt-muted">Field Interviews</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-mdt-muted">Case Involvement</span>
                  <span className="font-semibold">1</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-mdt-border">
                <p className="text-[10px] text-mdt-muted">LAST CONTACT</p>
                <p className="text-xs">Traffic Stop - 12/15/2024</p>
                <p className="text-[10px] text-mdt-muted mt-1">
                  Unit 2431 - Warning issued
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle Flags */}
          {vehicle?.flags && vehicle.flags.length > 0 && (
            <div>
              <p className="text-[10px] text-mdt-muted font-semibold mb-1">
                FLAGS
              </p>
              <div className="flex flex-wrap gap-1">
                {vehicle.flags.map((flag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-mdt-critical text-white text-[10px] font-bold rounded"
                  >
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Col 2 - LPR Read History (30%) */}
        <div className="w-[30%] border-r border-mdt-border flex flex-col overflow-hidden">
          <div className="px-2 pt-2 pb-1 border-b border-mdt-border bg-mdt-panel">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-mdt-info font-bold">
                📷 LPR READS
              </p>
              <span className="text-[10px] text-mdt-muted">
                {lprHistory?.length || 0} total
              </span>
            </div>
            <div className="flex text-[9px] text-mdt-muted mt-1 gap-4">
              <span className="flex-1">Image</span>
              <span className="flex-[2]">Org and Device Name</span>
              <span className="w-20 text-right">Date/Time</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {groupedReads && Object.keys(groupedReads).length > 0 ? (
              Object.entries(groupedReads).map(([date, reads]) => (
                <div key={date}>
                  {/* Date Header */}
                  <div className="bg-mdt-bg px-2 py-1.5 border-b border-mdt-border sticky top-0 flex items-center gap-2">
                    <span className="text-mdt-muted">▼</span>
                    <span className="text-xs font-semibold text-mdt-text">
                      {date}
                    </span>
                    <span className="text-xs text-mdt-muted">
                      ({reads.length})
                    </span>
                  </div>

                  {/* Reads for this date */}
                  {reads.map((read, i) => (
                    <div
                      key={read.id || i}
                      className="flex items-center px-2 py-1.5 border-b border-mdt-border/50 hover:bg-mdt-panel cursor-pointer"
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-10 bg-mdt-panel rounded overflow-hidden flex-shrink-0 mr-2">
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-mdt-panel to-mdt-bg">
                          <span className="text-lg">🚗</span>
                        </div>
                      </div>

                      {/* Location Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-mdt-text truncate">
                          Flock City PD - Law Enforcement
                        </p>
                        <p className="text-[10px] text-mdt-muted truncate">
                          {read.cameraName || read.cameraId}
                        </p>
                      </div>

                      {/* Timestamp */}
                      <div className="text-right ml-2 flex-shrink-0">
                        <p className="text-xs text-mdt-text">
                          {new Date(read.timestamp).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="ml-2 text-mdt-muted hover:text-mdt-text cursor-pointer">
                        ⋮
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-mdt-muted">
                <div className="text-center">
                  <span className="text-3xl">📷</span>
                  <p className="text-xs mt-2">No LPR reads found</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Col 3 - Vehicle Details + Heat Map (35%) */}
        <div className="w-[35%] flex flex-col overflow-hidden">
          {/* Vehicle Details Panel */}
          <div className="p-3 border-b border-mdt-border bg-mdt-panel">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-mdt-text">Vehicle Details</p>
              <span className="px-2 py-0.5 bg-mdt-info/20 text-mdt-info text-[10px] rounded">
                Hotlist: Law Enforcement Demo
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-mdt-muted">Plate</span>
                <span className="text-sm font-bold text-mdt-info">
                  {vehicle?.plate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-mdt-muted">Body</span>
                <span className="text-sm font-semibold">Sedan</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-mdt-muted">Plate State</span>
                <span className="text-sm font-semibold text-mdt-info">
                  {vehicle?.state}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-mdt-muted">Make</span>
                <span className="text-sm font-semibold">{vehicle?.make}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-mdt-muted">Plate Type</span>
                <span className="text-sm font-semibold">Regular</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-mdt-muted">Color</span>
                <span className="text-sm font-semibold">{vehicle?.color}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-mdt-muted">Year</span>
                <span className="text-sm font-semibold">{vehicle?.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-mdt-muted">Model</span>
                <span className="text-sm font-semibold">{vehicle?.model}</span>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-mdt-border">
              <div className="flex justify-between">
                <span className="text-xs text-mdt-muted">VIN</span>
                <span className="text-xs font-mono">{vehicle?.vin}</span>
              </div>
            </div>
          </div>

          {/* Heat Map */}
          <div className="flex-1 relative">
            <LprHeatMap lprHistory={lprHistory} />
          </div>
        </div>
      </div>

      {/* Bottom - AI Summary */}
      <div className="h-20 border-t border-mdt-border p-3 bg-mdt-panel">
        <p className="text-[10px] text-mdt-info font-bold">🤖 AI SUMMARY</p>
        <p className="text-sm mt-1">{aiSummary}</p>
      </div>
    </div>
  );
}
