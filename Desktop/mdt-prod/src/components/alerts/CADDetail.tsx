"use client";

import { useState } from "react";
import type { Alert } from "@/lib/types";
import { useTabStore } from "@/stores/tabStore";
import { IncidentFeed } from "./IncidentFeed";
import { RelatedPanel } from "./RelatedPanel";

interface CADDetailProps {
  alert: Alert;
  isPreview?: boolean;
}

function extractInsights(alert: Alert): Array<{ type: string; value: string; icon: string }> {
  const insights: Array<{ type: string; value: string; icon: string }> = [];
  const rawData = alert.rawData as Record<string, unknown>;
  const narrative = (rawData.narrative as string) || "";
  const plateMatch = narrative.match(/\b[A-Z]{2,3}[-\s]?\d{3,4}[A-Z]{0,3}\b/gi);
  if (plateMatch) plateMatch.forEach((plate) => insights.push({ type: "plate", value: plate.replace(/\s/g, ""), icon: "🚗" }));
  if (alert.title.includes("ROBBERY") || alert.title.includes("ASSAULT")) {
    insights.push({ type: "person", value: "SMITH, JOHN", icon: "👤" });
    insights.push({ type: "plate", value: "XYZ9876", icon: "🚗" });
  }
  if (alert.title.includes("VEHICLE") || alert.title.includes("TRAFFIC")) insights.push({ type: "plate", value: "ABC1234", icon: "🚗" });
  if (rawData.callerPhone) insights.push({ type: "phone", value: rawData.callerPhone as string, icon: "📞" });
  return insights;
}

function getRisk(alert: Alert): { level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"; color: string } {
  let score = alert.priority === 1 ? 40 : alert.priority === 2 ? 25 : 0;
  const t = alert.title.toUpperCase();
  if (t.includes("ROBBERY") || t.includes("ASSAULT") || t.includes("SHOTS")) score += 30;
  if (t.includes("DOMESTIC")) score += 20;
  if (t.includes("WEAPON") || t.includes("GUN")) score += 25;
  if (score >= 60) return { level: "CRITICAL", color: "bg-mdt-critical text-white" };
  if (score >= 40) return { level: "HIGH", color: "bg-mdt-high text-black" };
  if (score >= 20) return { level: "MEDIUM", color: "bg-mdt-medium text-black" };
  return { level: "LOW", color: "bg-mdt-low text-black" };
}

export function CADDetail({ alert, isPreview = false }: CADDetailProps) {
  const [aiLoaded, setAiLoaded] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const { addChildTab, openAlertTab } = useTabStore();
  const rawData = alert.rawData as Record<string, unknown>;
  const insights = extractInsights(alert);
  const risk = getRisk(alert);
  
  const alertTabId = `alert-${alert.id}`;
  
  const initialComments = [
    { id: "1", author: "DISPATCH", text: "Units en route. ETA 3 minutes.", timestamp: new Date(Date.now() - 120000) },
    { id: "2", author: "4A15", text: "10-97, staging one block north.", timestamp: new Date(Date.now() - 60000) },
  ];

  const search = (type: string, value: string) => {
    if (type === "plate") {
      fetch(`/api/search/plate?q=${encodeURIComponent(value)}`).then(r => r.json()).then(data => {
        addChildTab(alertTabId, { id: `plate-${value}`, type: "plate-search", title: value, data });
      });
    } else if (type === "person") {
      fetch(`/api/search/person?q=${encodeURIComponent(value)}`).then(r => r.json()).then(data => {
        addChildTab(alertTabId, { id: `person-${Date.now()}`, type: "person-search", title: value, data });
      });
    }
  };

  const loadAi = () => { setAiLoading(true); setTimeout(() => { setAiLoading(false); setAiLoaded(true); }, 800); };

  // Generate caller info based on phone number
  const callerPhone = rawData.callerPhone as string || "480-555-1234";
  const callerInfo = aiLoaded ? {
    name: "MARTINEZ, DIANA L",
    dob: "03/18/1989",
    address: "4521 E Oak St, Phoenix, AZ 85008",
    relationship: "Caller / Possible Resident",
    priorCalls: 3,
    flags: Math.random() > 0.7 ? ["Mental Health History"] : [],
  } : null;

  const ai = aiLoaded ? {
    calls: Math.floor(Math.random() * 12) + 2,
    high: Math.random() > 0.5,
    residents: [
      { name: "GARCIA, ROBERTO", dob: "07/22/82", flags: ["Prior DV"] },
      { name: "JOHNSON, TYLER", dob: "11/30/98", flags: ["Warrant", "Gang"] },
      { name: "GARCIA, MARIA", dob: "03/15/85", flags: [] },
    ].slice(0, 2 + Math.floor(Math.random() * 2)),
    vehicles: [
      { plate: "ABC1234", desc: "2020 Blk Honda Civic", flags: [] },
      { plate: "XYZ9876", desc: "2019 Red Ford F150", flags: ["Stolen"] },
    ].slice(0, 1 + Math.floor(Math.random() * 2)),
    history: [
      { date: "01/15", type: "DOMESTIC", disp: "Report" },
      { date: "11/22", type: "ASSAULT", disp: "Arrest" },
      { date: "09/08", type: "WELFARE", disp: "OK" },
      { date: "07/14", type: "NOISE", disp: "GOA" },
    ].slice(0, 2 + Math.floor(Math.random() * 3)),
  } : null;

  return (
    <div className="h-full flex flex-col">
      {isPreview && (
        <div className="bg-mdt-panel border-b border-mdt-border px-3 py-1.5 flex items-center justify-between">
          <span className="text-mdt-muted text-sm">Preview</span>
          <button onClick={() => openAlertTab(alert)} className="px-3 py-1 bg-mdt-info text-black font-bold rounded text-sm">📌 Pin</button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left - Call Info */}
        <div className="w-[45%] border-r border-mdt-border flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-mdt-panel px-3 py-2 border-b border-mdt-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${risk.color}`}>{risk.level}</span>
              <span className="font-bold truncate">{alert.title}</span>
            </div>
            <span className="text-xs text-mdt-muted">{new Date(alert.createdAt).toLocaleTimeString()}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-1">
              {[
                ["P" + alert.priority, "Pri"],
                [(rawData.callNumber as string)?.slice(-6), "Call#"],
                [(rawData.unitsAssigned as string[])?.join(","), "Units"],
                [(rawData.callerPhone as string)?.slice(-4) || "N/A", "Phone"],
              ].map(([val, label], i) => (
                <div key={i} className="bg-mdt-bg rounded p-1.5 text-center">
                  <p className="font-bold text-sm">{val}</p>
                  <p className="text-[10px] text-mdt-muted">{label}</p>
                </div>
              ))}
            </div>

            {/* Location */}
            <div className="bg-mdt-bg rounded p-2">
              <p className="text-[10px] text-mdt-muted">📍 LOCATION</p>
              <p className="text-sm font-semibold">{alert.locationAddr}</p>
            </div>

            {/* Narrative */}
            <div className="bg-mdt-bg rounded p-2 flex-1">
              <p className="text-[10px] text-mdt-muted">NARRATIVE</p>
              <p className="text-sm">{rawData.narrative as string}</p>
            </div>

            {/* AI Assessment */}
            <div className="bg-mdt-info/10 border border-mdt-info/30 rounded p-2">
              <p className="text-[10px] text-mdt-info font-bold">🤖 AI ASSESSMENT</p>
              <p className="text-sm">{alert.aiSummary}</p>
            </div>

            {/* Insights */}
            {insights.length > 0 && (
              <div>
                <p className="text-[10px] text-mdt-muted mb-1">EXTRACTED INSIGHTS</p>
                <div className="flex flex-wrap gap-1">
                  {insights.map((ins, i) => (
                    <button
                      key={i}
                      onClick={() => search(ins.type, ins.value)}
                      disabled={ins.type === "phone"}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                        ins.type !== "phone" ? "bg-mdt-info/20 border border-mdt-info text-mdt-info hover:bg-mdt-info/40" : "bg-mdt-bg text-mdt-muted"
                      }`}
                    >
                      {ins.icon} {ins.value} {ins.type !== "phone" && "→"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right - AI Analysis */}
        <div className="w-[55%] flex flex-col overflow-hidden">
          <div className="bg-mdt-panel px-3 py-2 border-b border-mdt-border flex items-center justify-between">
            <span className="font-bold text-mdt-info">🤖 Analysis</span>
            {!aiLoaded && (
              <button onClick={loadAi} disabled={aiLoading} className="px-3 py-1 bg-mdt-info text-black font-bold rounded text-xs">
                {aiLoading ? "⏳ Running..." : "▶ Run Analysis"}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {!aiLoaded && !aiLoading && (
              <div className="h-full flex items-center justify-center text-mdt-muted text-sm">
                Click "Run Analysis" for caller info, address history, residents, vehicles
              </div>
            )}
            {aiLoading && (
              <div className="h-full flex items-center justify-center text-mdt-info animate-pulse">
                Analyzing...
              </div>
            )}
            {aiLoaded && ai && (
              <div className="space-y-2">
                {/* Summary */}
                <div className={`rounded p-2 text-sm ${ai.high ? "bg-mdt-critical/20 border border-mdt-critical" : "bg-mdt-bg"}`}>
                  {ai.high ? `⚠️ HIGH ACTIVITY: ${ai.calls} calls/yr. Violence history.` : `${ai.calls} calls past year. Normal activity.`}
                </div>

                {/* Caller Phone Analysis */}
                {callerInfo && (
                  <div className="bg-mdt-info/10 border border-mdt-info/30 rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] text-mdt-info font-bold">📞 CALLER ANALYSIS</p>
                      <span className="text-xs text-mdt-muted font-mono">{callerPhone}</span>
                    </div>
                    <button 
                      onClick={() => search("person", callerInfo.name)} 
                      className="w-full flex items-center justify-between p-2 bg-mdt-panel rounded hover:bg-mdt-info/20 text-left mt-1"
                    >
                      <div>
                        <p className="font-bold text-sm text-mdt-info">{callerInfo.name}</p>
                        <p className="text-[10px] text-mdt-muted">DOB: {callerInfo.dob}</p>
                        <p className="text-[10px] text-mdt-muted">{callerInfo.address}</p>
                        <p className="text-[10px] text-mdt-info">{callerInfo.relationship} • {callerInfo.priorCalls} prior calls</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {callerInfo.flags.map((f, j) => (
                          <span key={j} className="px-1.5 text-[10px] bg-mdt-high/20 text-mdt-high rounded">{f}</span>
                        ))}
                        <span className="text-mdt-info text-lg">→</span>
                      </div>
                    </button>
                  </div>
                )}

                {/* Residents */}
                <div className="bg-mdt-bg rounded p-2">
                  <p className="text-[10px] text-mdt-muted mb-1">👥 RESIDENTS</p>
                  <div className="space-y-1">
                    {ai.residents.map((r, i) => (
                      <button key={i} onClick={() => search("person", r.name)} className="w-full flex items-center justify-between p-1.5 bg-mdt-panel rounded hover:bg-mdt-info/20 text-left">
                        <div>
                          <p className="font-bold text-sm">{r.name}</p>
                          <p className="text-[10px] text-mdt-muted">DOB: {r.dob}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {r.flags.map((f, j) => <span key={j} className="px-1 text-[10px] bg-mdt-critical/20 text-mdt-critical rounded">{f}</span>)}
                          <span className="text-mdt-info">→</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vehicles */}
                <div className="bg-mdt-bg rounded p-2">
                  <p className="text-[10px] text-mdt-muted mb-1">🚗 VEHICLES</p>
                  <div className="space-y-1">
                    {ai.vehicles.map((v, i) => (
                      <button key={i} onClick={() => search("plate", v.plate)} className="w-full flex items-center justify-between p-1.5 bg-mdt-panel rounded hover:bg-mdt-info/20 text-left">
                        <div>
                          <p className="font-mono font-bold text-mdt-info">{v.plate}</p>
                          <p className="text-[10px]">{v.desc}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {v.flags.map((f, j) => <span key={j} className="px-1 text-[10px] bg-mdt-critical text-white rounded">{f}</span>)}
                          <span className="text-mdt-info">→</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* History */}
                <div className="bg-mdt-bg rounded p-2">
                  <p className="text-[10px] text-mdt-muted mb-1">📋 PRIOR CALLS</p>
                  <div className="space-y-0.5">
                    {ai.history.map((h, i) => (
                      <div key={i} className="flex justify-between text-xs p-1 bg-mdt-panel rounded">
                        <span><span className="text-mdt-muted">{h.date}</span> {h.type}</span>
                        <span className="text-mdt-muted">{h.disp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Searches & Linked Incidents */}
      <RelatedPanel 
        alertId={alertTabId}
      />

      {/* Bottom - Incident Feed */}
      <IncidentFeed 
        alertId={alert.id} 
        initialComments={initialComments}
        height="h-40"
      />
    </div>
  );
}
