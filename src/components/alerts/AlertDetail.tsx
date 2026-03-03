"use client";

import type { Alert } from "@/lib/types";
import { useTabStore } from "@/stores/tabStore";
import { CADDetail } from "./CADDetail";
import { LPRDetail } from "./LPRDetail";
import { IncidentFeed } from "./IncidentFeed";

interface AlertDetailProps {
  alert: Alert;
  isPreview?: boolean;
}

export function AlertDetail({ alert, isPreview = false }: AlertDetailProps) {
  // Route to specific detail view based on type
  if (alert.type === "CAD") {
    return <CADDetail alert={alert} isPreview={isPreview} />;
  }

  if (alert.type === "LPR") {
    return <LPRDetail alert={alert} isPreview={isPreview} />;
  }

  // Generic detail view for other types with incident feed
  return <GenericAlertDetail alert={alert} isPreview={isPreview} />;
}

function GenericAlertDetail({ alert, isPreview }: { alert: Alert; isPreview: boolean }) {
  const { openAlertTab } = useTabStore();
  
  const initialComments = [
    { id: "1", author: "DISPATCH", text: "Units notified and en route.", timestamp: new Date(Date.now() - 180000) },
    { id: "2", author: "4A15", text: "Copy, responding from E Thomas.", timestamp: new Date(Date.now() - 90000) },
  ];

  const priorityColors: Record<number, string> = {
    1: "bg-mdt-critical text-white",
    2: "bg-mdt-high text-black",
    3: "bg-mdt-medium text-black",
    4: "bg-mdt-low text-black",
  };

  return (
    <div className="h-full flex flex-col">
      {isPreview && (
        <div className="bg-mdt-panel border-b border-mdt-border px-3 py-1.5 flex items-center justify-between">
          <span className="text-mdt-muted text-sm">Preview</span>
          <button onClick={() => openAlertTab(alert)} className="px-3 py-1 bg-mdt-info text-black font-bold rounded text-sm">📌 Pin</button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left - Alert Info */}
        <div className="w-1/2 border-r border-mdt-border flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-mdt-panel px-3 py-2 border-b border-mdt-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${priorityColors[alert.priority]}`}>
                P{alert.priority}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-mdt-border">{alert.type}</span>
              <span className="font-bold truncate">{alert.title}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {/* Summary */}
            <div className="bg-mdt-bg rounded p-2">
              <p className="text-[10px] text-mdt-muted">SUMMARY</p>
              <p className="text-sm">{alert.summary}</p>
            </div>

            {/* Location */}
            <div className="bg-mdt-bg rounded p-2">
              <p className="text-[10px] text-mdt-muted">📍 LOCATION</p>
              <p className="text-sm font-semibold">{alert.locationAddr}</p>
              <p className="text-[10px] text-mdt-muted">{alert.locationLat.toFixed(4)}, {alert.locationLng.toFixed(4)}</p>
            </div>

            {/* Time */}
            <div className="bg-mdt-bg rounded p-2">
              <p className="text-[10px] text-mdt-muted">🕐 TIME</p>
              <p className="text-sm font-semibold">{new Date(alert.createdAt).toLocaleString()}</p>
            </div>

            {/* Type Specific */}
            {alert.type === "AUDIO" && (
              <div className="bg-mdt-critical/20 border border-mdt-critical rounded p-2">
                <p className="text-[10px] text-mdt-critical font-bold">🔊 AUDIO ALERT - {String((alert.rawData as Record<string, unknown>).subtype || "")}</p>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {Boolean((alert.rawData as Record<string, unknown>).rounds) && (
                    <div>
                      <p className="text-[10px] text-mdt-muted">Rounds</p>
                      <p className="text-2xl font-bold text-mdt-critical">{Number((alert.rawData as Record<string, unknown>).rounds)}</p>
                    </div>
                  )}
                  {Boolean((alert.rawData as Record<string, unknown>).duration) && (
                    <div>
                      <p className="text-[10px] text-mdt-muted">Duration</p>
                      <p className="text-2xl font-bold text-mdt-critical">{Number((alert.rawData as Record<string, unknown>).duration)}s</p>
                    </div>
                  )}
                  {Boolean((alert.rawData as Record<string, unknown>).severity) && (
                    <div>
                      <p className="text-[10px] text-mdt-muted">Severity</p>
                      <p className="text-lg font-bold text-mdt-critical">{String((alert.rawData as Record<string, unknown>).severity)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-mdt-muted">Confidence</p>
                    <p className="text-lg font-bold">{Number((alert.rawData as Record<string, unknown>).confidence || 0)}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-mdt-muted">Sensor</p>
                    <p className="font-mono text-sm">{String((alert.rawData as Record<string, unknown>).sensor || "")}</p>
                  </div>
                </div>
              </div>
            )}

            {alert.type === "CALL_911" && (
              <div className="bg-mdt-bg rounded p-2">
                <p className="text-[10px] text-mdt-muted">📞 911 DETAILS</p>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <p className="text-[10px] text-mdt-muted">Caller ID</p>
                    <p className="text-sm font-semibold">{(alert.rawData as Record<string, unknown>).callerId as string}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-mdt-muted">Duration</p>
                    <p className="text-sm font-semibold">{(alert.rawData as Record<string, unknown>).callDuration as number}s</p>
                  </div>
                </div>
              </div>
            )}

            {alert.type === "FREEFORM" && (
              <div className="bg-mdt-info/20 border border-mdt-info rounded p-2">
                <p className="text-[10px] text-mdt-info font-bold">📹 FREEFORM SEARCH</p>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <p className="text-[10px] text-mdt-muted">Source</p>
                    <p className="text-sm font-semibold">{(alert.rawData as Record<string, unknown>).source as string}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-mdt-muted">Camera</p>
                    <p className="text-sm font-semibold">{(alert.rawData as Record<string, unknown>).camera as string}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-mdt-muted">Operator</p>
                    <p className="text-sm font-semibold">{(alert.rawData as Record<string, unknown>).operator as string}</p>
                  </div>
                </div>
              </div>
            )}

            {alert.type === "PERSON" && (
              <div className="bg-mdt-high/20 border border-mdt-high rounded p-2">
                <p className="text-[10px] text-mdt-high font-bold">👤 PERSON ALERT</p>
                <div className="space-y-2 mt-1">
                  <div>
                    <p className="text-[10px] text-mdt-muted">Subject</p>
                    <p className="text-lg font-bold">{(alert.rawData as Record<string, unknown>).name as string}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-mdt-muted">Reason</p>
                    <p className="text-sm font-semibold text-mdt-high">{(alert.rawData as Record<string, unknown>).reason as string}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-mdt-muted">Match Confidence</p>
                      <p className="text-lg font-bold">{(alert.rawData as Record<string, unknown>).matchConfidence as number}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-mdt-muted">Camera</p>
                      <p className="text-sm font-semibold">{(alert.rawData as Record<string, unknown>).camera as string}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Analysis */}
            <div className="bg-mdt-info/10 border border-mdt-info/30 rounded p-2">
              <p className="text-[10px] text-mdt-info font-bold">🤖 AI ANALYSIS</p>
              <p className="text-sm">{alert.aiSummary}</p>
            </div>
          </div>
        </div>

        {/* Right - Additional Context */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          <div className="bg-mdt-panel px-3 py-2 border-b border-mdt-border">
            <span className="font-bold text-mdt-info">📊 Context</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {/* Map placeholder */}
            <div className="bg-mdt-bg rounded p-2 aspect-video flex items-center justify-center">
              <div className="text-center text-mdt-muted">
                <span className="text-4xl">🗺️</span>
                <p className="text-xs mt-1">Location Map</p>
              </div>
            </div>

            {/* Nearby Units */}
            <div className="bg-mdt-bg rounded p-2">
              <p className="text-[10px] text-mdt-muted">NEARBY UNITS</p>
              <div className="space-y-1 mt-1">
                {["4A21 - 0.3 mi", "4A15 - 0.8 mi", "4B12 - 1.2 mi"].map((u, i) => (
                  <div key={i} className="flex justify-between text-xs p-1 bg-mdt-panel rounded">
                    <span className="font-bold text-mdt-info">{u.split(" - ")[0]}</span>
                    <span className="text-mdt-muted">{u.split(" - ")[1]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-mdt-bg rounded p-2">
              <p className="text-[10px] text-mdt-muted">AREA ACTIVITY (24HR)</p>
              <div className="space-y-1 mt-1">
                {[
                  { type: "Traffic Stop", time: "2hr ago" },
                  { type: "Welfare Check", time: "6hr ago" },
                  { type: "Noise Complaint", time: "18hr ago" },
                ].map((a, i) => (
                  <div key={i} className="flex justify-between text-xs p-1 bg-mdt-panel rounded">
                    <span>{a.type}</span>
                    <span className="text-mdt-muted">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom - Incident Feed */}
      <IncidentFeed 
        alertId={alert.id} 
        initialComments={initialComments}
        height="h-48"
      />
    </div>
  );
}
