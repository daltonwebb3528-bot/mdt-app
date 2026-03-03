"use client";

import type { Person, PersonSearchResult } from "@/lib/types";
import { useTabStore } from "@/stores/tabStore";

interface PersonResultsProps {
  data: PersonSearchResult;
}

export function PersonResults({ data }: PersonResultsProps) {
  const { persons } = data;
  const { addTab } = useTabStore();

  const searchPlate = (plate: string) => {
    fetch(`/api/search/plate?q=${encodeURIComponent(plate)}`)
      .then((res) => res.json())
      .then((plateData) => {
        addTab({
          id: `plate-${plate}`,
          type: "plate-search",
          title: `Plate: ${plate}`,
          data: plateData,
        });
      });
  };

  const searchPerson = (person: Person) => {
    addTab({
      id: `person-${Date.now()}`,
      type: "person-search",
      title: `Person: ${person.firstName} ${person.lastName}`,
      data: { persons: [person] } as PersonSearchResult,
    });
  };

  if (persons.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-mdt-muted">No persons found</p>
      </div>
    );
  }

  const p = persons[0];
  const hasWarrant = p.ncicStatus?.warrants?.length > 0;
  const hasAlerts = p.ncicStatus?.alerts?.length > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={`px-3 py-2 border-b flex items-center justify-between ${hasWarrant ? "bg-mdt-critical/20 border-mdt-critical" : "bg-mdt-panel border-mdt-border"}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">👤</span>
          <span className="font-bold text-lg">{p.firstName} {p.lastName}</span>
          {hasWarrant && <span className="px-2 py-0.5 bg-mdt-critical text-white text-xs font-bold rounded animate-pulse">WARRANTS</span>}
          {hasAlerts && <span className="px-2 py-0.5 bg-mdt-high text-black text-xs font-bold rounded">ALERTS</span>}
        </div>
        <span className="text-sm text-mdt-muted">DOB: {new Date(p.dob).toLocaleDateString()} | DL: {p.dlNumber}</span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Col 1 - Photo */}
        <div className="w-[20%] border-r border-mdt-border p-2 flex flex-col">
          <p className="text-[10px] text-mdt-muted mb-1">📷 PHOTO</p>
          <div className="flex-1 bg-mdt-bg rounded flex items-center justify-center">
            <div className="text-center">
              <span className="text-5xl">👤</span>
              <p className="text-[10px] text-mdt-muted mt-1">DMV Photo</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
            <div className="bg-mdt-bg rounded p-1">
              <p className="text-[10px] text-mdt-muted">HT</p>
              <p className="font-bold">5&#39;10&#34;</p>
            </div>
            <div className="bg-mdt-bg rounded p-1">
              <p className="text-[10px] text-mdt-muted">WT</p>
              <p className="font-bold">175</p>
            </div>
            <div className="bg-mdt-bg rounded p-1">
              <p className="text-[10px] text-mdt-muted">EYES</p>
              <p className="font-bold">BRN</p>
            </div>
            <div className="bg-mdt-bg rounded p-1">
              <p className="text-[10px] text-mdt-muted">HAIR</p>
              <p className="font-bold">BLK</p>
            </div>
          </div>
        </div>

        {/* Col 2 - NCIC */}
        <div className={`w-[25%] border-r p-2 flex flex-col overflow-y-auto ${hasWarrant ? "border-mdt-critical" : "border-mdt-border"}`}>
          <p className="text-[10px] text-mdt-critical font-bold mb-1">🚨 NCIC RETURN</p>
          
          {hasWarrant ? (
            <div className="bg-mdt-critical/20 border border-mdt-critical rounded p-2 mb-2">
              <p className="font-bold text-mdt-critical text-sm">ACTIVE WARRANTS</p>
              {p.ncicStatus.warrants.map((w, i) => (
                <div key={i} className="bg-mdt-bg rounded p-1.5 mt-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-xs text-mdt-critical">{w.type}</span>
                    <span className="text-[10px] text-mdt-muted">{w.date}</span>
                  </div>
                  <p className="text-xs">{w.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-mdt-low/20 border border-mdt-low rounded p-2 mb-2">
              <p className="font-bold text-mdt-low text-sm">NO WARRANTS</p>
              <p className="text-xs text-mdt-muted">NCIC clear</p>
            </div>
          )}

          {hasAlerts && (
            <div className="bg-mdt-high/20 border border-mdt-high rounded p-2 mb-2">
              <p className="font-bold text-mdt-high text-sm">OFFICER SAFETY</p>
              {p.ncicStatus.alerts.map((a, i) => (
                <p key={i} className="text-xs">⚠️ {a}</p>
              ))}
            </div>
          )}

          <div className="text-[10px] text-mdt-muted mt-auto">
            Query: {new Date().toLocaleTimeString()}<br/>ORI: AZ0040100
          </div>
        </div>

        {/* Col 3 - Agency/RMS */}
        <div className="w-[27%] border-r border-mdt-border p-2 flex flex-col overflow-y-auto">
          <p className="text-[10px] text-mdt-medium font-bold mb-1">🏛️ AGENCY DATA</p>
          
          <div className="bg-mdt-bg rounded p-2 mb-2">
            <p className="text-[10px] text-mdt-muted">RMS CONTACTS</p>
            <div className="space-y-1 mt-1">
              {[
                { date: "01/15/24", type: "Traffic Stop", case: "24-001234" },
                { date: "11/22/23", type: "Field Interview", case: "23-045678" },
                { date: "08/14/23", type: "Witness", case: "23-034567" },
              ].map((r, i) => (
                <div key={i} className="text-xs p-1 bg-mdt-panel rounded flex justify-between">
                  <span><span className="text-mdt-muted">{r.date}</span> {r.type}</span>
                  <span className="text-mdt-muted font-mono">{r.case}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-mdt-bg rounded p-2">
            <p className="text-[10px] text-mdt-muted">JAIL BOOKINGS</p>
            {hasWarrant || hasAlerts ? (
              <div className="space-y-1 mt-1">
                {[
                  { date: "06/10/23", charge: "DUI", rel: "Bond" },
                  { date: "02/28/22", charge: "Assault", rel: "Time Served" },
                ].slice(0, hasWarrant ? 2 : 1).map((j, i) => (
                  <div key={i} className="text-xs p-1 bg-mdt-panel rounded">
                    <div className="flex justify-between">
                      <span className="text-mdt-muted">{j.date}</span>
                      <span>{j.charge}</span>
                    </div>
                    <p className="text-mdt-muted">Release: {j.rel}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-mdt-muted mt-1">No booking history</p>
            )}
          </div>
        </div>

        {/* Col 4 - OSINT */}
        <div className="w-[28%] p-2 flex flex-col overflow-y-auto">
          <p className="text-[10px] text-mdt-info font-bold mb-1">🌐 OSINT</p>
          
          <div className="bg-mdt-bg rounded p-2 mb-2">
            <p className="text-[10px] text-mdt-muted">SOCIAL MEDIA</p>
            <div className="space-y-1 mt-1">
              {[
                { icon: "📘", platform: "Facebook", handle: `${p.firstName.toLowerCase()}${p.lastName.toLowerCase()}`, active: true },
                { icon: "📸", platform: "Instagram", handle: `${p.firstName.toLowerCase()}_az`, active: true },
                { icon: "🐦", platform: "X", handle: `${p.firstName.toLowerCase()}${Math.floor(Math.random()*1000)}`, active: false },
              ].map((s, i) => (
                <div key={i} className="text-xs p-1 bg-mdt-panel rounded flex items-center justify-between">
                  <span>{s.icon} @{s.handle}</span>
                  <span className={`text-[10px] ${s.active ? "text-mdt-low" : "text-mdt-muted"}`}>{s.active ? "Active" : "Inactive"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-mdt-bg rounded p-2 mb-2">
            <p className="text-[10px] text-mdt-muted">ADDRESSES</p>
            <div className="space-y-1 mt-1">
              <div className="text-xs p-1 bg-mdt-panel rounded">
                <span className="text-mdt-low font-bold">Current</span>
                <p>{p.address}</p>
              </div>
              <div className="text-xs p-1 bg-mdt-panel rounded">
                <span className="text-mdt-muted">Prior (2022)</span>
                <p>1234 Oak St, Tempe, AZ 85281</p>
              </div>
            </div>
          </div>

          <div className="bg-mdt-bg rounded p-2">
            <p className="text-[10px] text-mdt-muted">ASSOCIATES</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {["James Williams", "Maria Garcia", "Carlos Lopez"].map((n, i) => (
                <span key={i} className="text-xs px-1.5 py-0.5 bg-mdt-panel rounded">{n}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom - AI Summary & Vehicles */}
      <div className="h-40 border-t border-mdt-border flex">
        <div className="w-2/3 border-r border-mdt-border p-2">
          <p className="text-[10px] text-mdt-info font-bold">🤖 AI SUMMARY</p>
          <p className="text-sm">{p.aiSummary}</p>
        </div>
        <div className="w-1/3 p-2 overflow-y-auto">
          <p className="text-[10px] text-mdt-muted">🚗 LINKED VEHICLES</p>
          <div className="space-y-1 mt-1">
            {p.vehicles && p.vehicles.length > 0 ? p.vehicles.map((v, i) => (
              <button
                key={i}
                onClick={() => searchPlate(v.plate)}
                className={`w-full text-left text-xs p-1.5 rounded flex justify-between items-center hover:brightness-110 transition ${v.ncicStatus?.stolen ? "bg-mdt-critical/20 border border-mdt-critical" : "bg-mdt-bg"}`}
              >
                <div>
                  <span className="font-mono font-bold text-mdt-info">{v.plate}</span>
                  <span className="text-mdt-muted ml-2">{v.year} {v.color} {v.make}</span>
                </div>
                {v.ncicStatus?.stolen && <span className="px-1 text-[10px] bg-mdt-critical text-white rounded">STOLEN</span>}
              </button>
            )) : <p className="text-xs text-mdt-muted">No vehicles</p>}
          </div>
        </div>
      </div>

      {/* Other Results */}
      {persons.length > 1 && (
        <div className="h-16 border-t border-mdt-border p-2 overflow-x-auto">
          <p className="text-[10px] text-mdt-muted mb-1">OTHER MATCHES ({persons.length - 1})</p>
          <div className="flex gap-2">
            {persons.slice(1).map((op, i) => (
              <button
                key={i}
                onClick={() => searchPerson(op)}
                className="flex-shrink-0 text-xs p-1.5 bg-mdt-bg rounded flex items-center gap-2 hover:brightness-110 transition"
              >
                <span className="font-bold text-mdt-info">{op.firstName} {op.lastName}</span>
                <span className="text-mdt-muted">DOB: {new Date(op.dob).toLocaleDateString()}</span>
                {op.ncicStatus?.warrants?.length > 0 && <span className="px-1 bg-mdt-critical text-white rounded text-[10px]">WARRANTS</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
