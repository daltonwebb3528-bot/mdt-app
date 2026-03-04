"use client";

import { useState, useEffect, useCallback } from "react";
import type { Alert } from "@/lib/types";
import { useTabStore } from "@/stores/tabStore";
import { IncidentFeed } from "./IncidentFeed";
import { RelatedPanel } from "./RelatedPanel";
import { voiceEvents, speakSummary } from "@/components/voice/VoiceControl";

interface LPRDetailProps {
  alert: Alert;
  isPreview?: boolean;
}

export function LPRDetail({ alert, isPreview = false }: LPRDetailProps) {
  const [aiLoaded, setAiLoaded] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const { openAlertTab, addChildTab } = useTabStore();
  
  const alertTabId = `alert-${alert.id}`;
  
  const initialComments = [
    { id: "1", author: "DISPATCH", text: "Unit 4A21 advised of LPR hit.", timestamp: new Date(Date.now() - 60000) },
  ];

  const rawData = alert.rawData as { plate?: string; camera?: string; confidence?: number; direction?: string };
  const isStolen = alert.title.includes("STOLEN");
  const isWanted = alert.title.includes("WANTED");

  // Generate hotlist data based on alert
  const hotlistData = {
    source: "Custom Hotlist",
    hotlistName: isStolen ? "Law Enforcement Demo Scenarios" : "Regional BOLO List",
    reason: isStolen ? "Stolen Vehicle" : isWanted ? "Wanted Person Associated" : "Routine Read",
    notes: isStolen ? "Confirm with dispatch before approach" : "No notes",
    state: "AZ",
    plate: rawData.plate || "UNKNOWN",
    body: ["Sedan", "Pickup", "SUV", "Coupe"][Math.floor(Math.random() * 4)],
    make: ["Toyota", "Honda", "Ford", "Chevrolet", "Nissan"][Math.floor(Math.random() * 5)],
    color: ["Black", "White", "Red", "Silver", "Blue"][Math.floor(Math.random() * 5)],
    agencyName: "Phoenix PD - District 4",
    device: rawData.camera || "Mobile LPR Unit",
    location: alert.locationAddr,
    network: "Phoenix Metro LPR Network",
    caseNumber: isStolen ? `24-${100000 + Math.floor(Math.random() * 900000)}` : "N/A",
    timestamp: new Date(alert.createdAt).toLocaleString(),
  };

  // AI Analysis data - memoize to prevent regeneration
  const [aiData, setAiData] = useState<{
    ncic: {
      vehicleStatus: string;
      stolenDate: string | null;
      stolenLocation: string | null;
      registration: string;
      insurance: string;
      title: string;
      liens: string;
    };
    owner: {
      name: string;
      dob: string;
      dl: string;
      address: string;
      warrants: Array<{ type: string; desc: string; date: string }>;
      alerts: string[];
      priors: string[];
    };
    rmsHistory: Array<{ date: string; type: string; unit: string; disp: string; case: string }>;
    lprHistory: Array<{ date: string; time: string; location: string; camera: string | undefined }>;
    associates: Array<{ name: string; relation: string; flags: string[] }>;
  } | null>(null);

  const loadAi = useCallback(() => {
    if (aiLoading || aiLoaded) return;
    
    setAiLoading(true);
    setTimeout(() => {
      const ai = {
        ncic: {
          vehicleStatus: isStolen ? "STOLEN" : "CLEAR",
          stolenDate: isStolen ? "02/01/2024" : null,
          stolenLocation: isStolen ? "4500 E Camelback Rd, Phoenix" : null,
          registration: "VALID - Expires 08/2025",
          insurance: "ACTIVE - State Farm",
          title: "CLEAR",
          liens: "NONE",
        },
        owner: {
          name: "JOHNSON, MICHAEL T",
          dob: "07/15/1985",
          dl: "D12345678",
          address: "1234 W Oak St, Phoenix, AZ 85015",
          warrants: isStolen ? [{ type: "FELONY", desc: "Failure to Appear - Burglary", date: "01/20/2024" }] : [],
          alerts: isStolen ? ["ARMED AND DANGEROUS", "FLIGHT RISK"] : [],
          priors: isStolen ? ["Burglary (2022)", "Auto Theft (2019)", "Assault (2018)"] : ["Traffic (2023)"],
        },
        rmsHistory: [
          { date: "02/15/24", type: "Traffic Stop", unit: "4A15", disp: "Citation", case: "24-023456" },
          { date: "01/28/24", type: "Field Interview", unit: "4B22", disp: "FI Card", case: "24-018234" },
          { date: "12/10/23", type: "Suspicious Vehicle", unit: "4A21", disp: "GOA", case: "23-145678" },
          { date: "11/05/23", type: "Traffic Stop", unit: "3C14", disp: "Warning", case: "23-132456" },
        ],
        lprHistory: [
          { date: "Today", time: new Date(alert.createdAt).toLocaleTimeString(), location: alert.locationAddr, camera: rawData.camera },
          { date: "02/23/24", time: "14:32", location: "N Scottsdale Rd & E Shea Blvd", camera: "Fixed - Intersection" },
          { date: "02/20/24", time: "09:15", location: "E Camelback Rd & N 24th St", camera: "Mobile Unit" },
          { date: "02/18/24", time: "22:47", location: "W Indian School Rd & N 7th Ave", camera: "Fixed - Parking" },
        ],
        associates: [
          { name: "JOHNSON, SARAH M", relation: "Spouse", flags: [] },
          { name: "WILLIAMS, DEREK J", relation: "Known Associate", flags: ["Gang Affiliated"] },
          { name: "GARCIA, MARIA L", relation: "Relative", flags: [] },
        ],
      };
      
      setAiData(ai);
      setAiLoading(false);
      setAiLoaded(true);
      
      // Speak summary after analysis completes
      const summaryData = {
        plate: rawData.plate,
        vehicleStatus: ai.ncic.vehicleStatus,
        owner: ai.owner,
        hotlistReason: hotlistData.reason,
        vehicle: `${hotlistData.color} ${hotlistData.make} ${hotlistData.body}`,
      };
      speakSummary("lpr", summaryData);
      
    }, 1200);
  }, [aiLoading, aiLoaded, isStolen, alert.createdAt, alert.locationAddr, rawData.camera, rawData.plate, hotlistData.reason, hotlistData.color, hotlistData.make, hotlistData.body]);

  // Listen for voice commands
  useEffect(() => {
    const unsubscribe = voiceEvents.on((command) => {
      if (command === "run-analysis") {
        loadAi();
      }
    });
    return unsubscribe;
  }, [loadAi]);

  const searchPerson = (name: string) => {
    fetch(`/api/search/person?q=${encodeURIComponent(name)}`)
      .then(r => r.json())
      .then(data => {
        addChildTab(alertTabId, {
          id: `person-${Date.now()}`,
          type: "person-search",
          title: name,
          data,
        });
      });
  };

  const searchPlate = (plate: string) => {
    fetch(`/api/search/plate?q=${encodeURIComponent(plate)}`)
      .then(r => r.json())
      .then(data => {
        addChildTab(alertTabId, {
          id: `plate-${plate}`,
          type: "plate-search",
          title: plate,
          data,
        });
      });
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
        {/* Left Column - Capture */}
        <div className="w-[30%] border-r border-mdt-border flex flex-col overflow-hidden">
          <div className={`px-3 py-2 border-b flex items-center gap-2 ${isStolen ? "bg-mdt-critical/20 border-mdt-critical" : "bg-mdt-panel border-mdt-border"}`}>
            <span className="text-xl">🚗</span>
            <span className="font-bold">{alert.title}</span>
            {isStolen && <span className="px-2 py-0.5 bg-mdt-critical text-white text-xs font-bold rounded animate-pulse">STOLEN</span>}
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {/* Plate Capture */}
            <div className="bg-mdt-bg rounded p-2">
              <div className="aspect-[2/1] bg-gradient-to-b from-gray-700 to-gray-900 rounded flex items-center justify-center mb-2">
                <div className="bg-white text-black font-mono text-2xl font-bold px-3 py-1.5 rounded border-4 border-black">
                  {rawData.plate || "UNKNOWN"}
                </div>
              </div>
              <div className="aspect-[2/1] bg-gradient-to-b from-gray-800 to-gray-950 rounded flex items-center justify-center">
                <span className="text-5xl opacity-40">🚙</span>
              </div>
            </div>

            {/* Capture Stats */}
            <div className="grid grid-cols-2 gap-1">
              <div className="bg-mdt-bg rounded p-1.5">
                <p className="text-[10px] text-mdt-muted">CONFIDENCE</p>
                <p className="font-bold text-mdt-low">{rawData.confidence || 98}%</p>
              </div>
              <div className="bg-mdt-bg rounded p-1.5">
                <p className="text-[10px] text-mdt-muted">DIRECTION</p>
                <p className="font-bold">{rawData.direction || "EB"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column - Alert Status / Hotlist Info */}
        <div className="w-[35%] border-r border-mdt-border flex flex-col overflow-hidden">
          <div className="bg-mdt-panel px-3 py-2 border-b border-mdt-border">
            <span className="font-bold">🚨 Alert Status</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {[
              ["Source", hotlistData.source],
              ["Hotlist Name", hotlistData.hotlistName],
              ["Reason", hotlistData.reason, isStolen ? "text-mdt-critical font-bold" : ""],
              ["Notes", hotlistData.notes],
              ["State, Plate", `${hotlistData.state}, ${hotlistData.plate}`],
              ["Body, Make, Color", `${hotlistData.body}, ${hotlistData.make}, ${hotlistData.color}`],
              ["Agency Name", hotlistData.agencyName],
              ["Device", hotlistData.device],
              ["Location", hotlistData.location],
              ["Network", hotlistData.network],
              ["Case Number", hotlistData.caseNumber, isStolen ? "text-mdt-info font-mono" : ""],
              ["Timestamp", hotlistData.timestamp],
            ].map(([label, value, extraClass], i) => (
              <div key={i} className="bg-mdt-bg rounded p-1.5">
                <p className="text-[10px] text-mdt-muted">{label}</p>
                <p className={`text-xs ${extraClass || ""}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - AI Analysis */}
        <div className="w-[35%] flex flex-col overflow-hidden">
          <div className="bg-mdt-panel px-3 py-2 border-b border-mdt-border flex items-center justify-between">
            <span className="font-bold text-mdt-info">🤖 AI Analysis</span>
            {!aiLoaded && (
              <button onClick={loadAi} disabled={aiLoading} className="px-3 py-1 bg-mdt-info text-black font-bold rounded text-xs">
                {aiLoading ? "⏳ Running..." : "▶ Run NCIC"}
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {!aiLoaded && !aiLoading && (
              <div className="h-full flex items-center justify-center text-mdt-muted text-xs text-center p-2">
                Click "Run NCIC" or say "Run Analysis" for vehicle status, registration, owner info, and associated persons
              </div>
            )}
            {aiLoading && (
              <div className="h-full flex items-center justify-center text-mdt-info animate-pulse text-sm">Querying systems...</div>
            )}
            {aiLoaded && aiData && (
              <div className="space-y-2">
                {/* NCIC Return */}
                <div className={`rounded p-2 ${aiData.ncic.vehicleStatus === "STOLEN" ? "bg-mdt-critical/20 border border-mdt-critical" : "bg-mdt-low/20 border border-mdt-low"}`}>
                  <p className="text-[10px] text-mdt-muted mb-1">🚨 NCIC RETURN</p>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-xs">
                      <span>Vehicle Status</span>
                      <span className={`font-bold ${aiData.ncic.vehicleStatus === "STOLEN" ? "text-mdt-critical" : "text-mdt-low"}`}>{aiData.ncic.vehicleStatus}</span>
                    </div>
                    {aiData.ncic.stolenDate && (
                      <>
                        <div className="flex justify-between text-xs">
                          <span>Stolen Date</span>
                          <span className="text-mdt-critical">{aiData.ncic.stolenDate}</span>
                        </div>
                        <div className="text-xs text-mdt-muted">From: {aiData.ncic.stolenLocation}</div>
                      </>
                    )}
                    <div className="flex justify-between text-xs">
                      <span>Registration</span>
                      <span className="text-mdt-low">{aiData.ncic.registration}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Insurance</span>
                      <span className="text-mdt-low">{aiData.ncic.insurance}</span>
                    </div>
                  </div>
                </div>

                {/* Owner */}
                <div className={`rounded p-2 ${aiData.owner.warrants.length > 0 ? "bg-mdt-critical/20 border border-mdt-critical" : "bg-mdt-bg"}`}>
                  <p className="text-[10px] text-mdt-muted mb-1">👤 REGISTERED OWNER</p>
                  <button onClick={() => searchPerson(aiData.owner.name)} className="w-full text-left hover:bg-mdt-info/20 rounded p-1 -m-1">
                    <p className="font-bold text-sm text-mdt-info">{aiData.owner.name} →</p>
                    <p className="text-[10px] text-mdt-muted">DOB: {aiData.owner.dob} | DL: {aiData.owner.dl}</p>
                  </button>
                  {aiData.owner.warrants.length > 0 && (
                    <div className="mt-1 p-1 bg-mdt-critical/30 rounded">
                      <p className="text-[10px] text-mdt-critical font-bold">⚠️ WARRANTS</p>
                      {aiData.owner.warrants.map((w, i) => (
                        <p key={i} className="text-xs">{w.type}: {w.desc}</p>
                      ))}
                    </div>
                  )}
                  {aiData.owner.alerts.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {aiData.owner.alerts.map((a, i) => (
                        <span key={i} className="px-1 py-0.5 text-[10px] bg-mdt-high text-black rounded font-bold">{a}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* RMS History */}
                <div className="bg-mdt-bg rounded p-2">
                  <p className="text-[10px] text-mdt-muted mb-1">📋 RMS VEHICLE HISTORY</p>
                  <div className="space-y-0.5">
                    {aiData.rmsHistory.map((h, i) => (
                      <div key={i} className="flex justify-between text-[10px] p-0.5 bg-mdt-panel rounded">
                        <span><span className="text-mdt-muted">{h.date}</span> {h.type}</span>
                        <span className="text-mdt-muted">{h.disp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* LPR History */}
                <div className="bg-mdt-bg rounded p-2">
                  <p className="text-[10px] text-mdt-muted mb-1">📍 LPR HISTORY</p>
                  <div className="space-y-0.5">
                    {aiData.lprHistory.map((h, i) => (
                      <div key={i} className="text-[10px] p-0.5 bg-mdt-panel rounded">
                        <div className="flex justify-between">
                          <span className="text-mdt-muted">{h.date} {h.time}</span>
                          <span className="text-mdt-muted">{h.camera}</span>
                        </div>
                        <p className="truncate">{h.location}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Associates */}
                <div className="bg-mdt-bg rounded p-2">
                  <p className="text-[10px] text-mdt-muted mb-1">👥 ASSOCIATED PERSONS</p>
                  <div className="space-y-0.5">
                    {aiData.associates.map((a, i) => (
                      <button key={i} onClick={() => searchPerson(a.name)} className="w-full flex justify-between items-center text-xs p-1 bg-mdt-panel rounded hover:bg-mdt-info/20 text-left">
                        <div>
                          <span className="text-mdt-info font-semibold">{a.name}</span>
                          <span className="text-mdt-muted ml-1">({a.relation})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {a.flags.map((f, j) => (
                            <span key={j} className="px-1 text-[10px] bg-mdt-critical/20 text-mdt-critical rounded">{f}</span>
                          ))}
                          <span className="text-mdt-info">→</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Linked Incidents Panel */}
      <RelatedPanel alertId={alertTabId} />

      {/* Bottom - Incident Feed */}
      <IncidentFeed 
        alertId={alert.id} 
        initialComments={initialComments}
        height="h-28"
      />
    </div>
  );
}
