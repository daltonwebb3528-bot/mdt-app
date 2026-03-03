"use client";

import { useState } from "react";
import { useTabStore } from "@/stores/tabStore";
import { useAlertStore } from "@/stores/alertStore";
import type { Alert } from "@/lib/types";
import { PlateResults } from "@/components/search/PlateResults";
import { PersonResults } from "@/components/search/PersonResults";
import { PhoneResults } from "@/components/search/PhoneResults";
import { AddressResults } from "@/components/search/AddressResults";

interface RelatedPanelProps {
  alertId: string;
}

export function RelatedPanel({ alertId }: RelatedPanelProps) {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState<{ id: string; type: string; title: string; data: unknown } | null>(null);
  
  const { 
    getLinkedIncidents, 
    linkIncidents,
    unlinkIncident,
    openAlertTab,
    setActiveTab,
    tabs,
    getChildTabs,
    removeChildTab,
  } = useTabStore();
  const { alerts } = useAlertStore();
  
  // Normalize ID
  const normalizedAlertId = alertId.startsWith("alert-") ? alertId.replace("alert-", "") : alertId;
  
  // Get linked incidents
  const linkedIncidentIds = getLinkedIncidents(normalizedAlertId);
  const linkedIncidents = linkedIncidentIds.map(id => {
    return alerts.find(a => a.id === id || a.id === id.replace("alert-", ""));
  }).filter(Boolean) as Alert[];

  // Get child searches
  const childSearches = getChildTabs(alertId);

  const availableToLink = alerts.filter(a => {
    return a.id !== normalizedAlertId && !linkedIncidentIds.includes(a.id);
  });

  const handleLinkIncident = (otherAlertId: string) => {
    linkIncidents(normalizedAlertId, otherAlertId);
    setShowLinkModal(false);
  };

  const handleSwitchToIncident = (incident: Alert) => {
    const tabId = `alert-${incident.id}`;
    const existingTab = tabs.find(t => t.id === tabId);
    if (existingTab) {
      setActiveTab(tabId);
    } else {
      openAlertTab(incident);
      setActiveTab(tabId);
    }
  };

  const hasLinkedIncidents = linkedIncidents.length > 0;
  const hasChildSearches = childSearches.length > 0;
  const hasContent = hasLinkedIncidents || hasChildSearches;

  // Render child search content
  const renderChildContent = () => {
    if (!selectedChild) return null;

    switch (selectedChild.type) {
      case "plate-search":
        return <PlateResults data={selectedChild.data as Parameters<typeof PlateResults>[0]["data"]} />;
      case "person-search":
        return <PersonResults data={selectedChild.data as Parameters<typeof PersonResults>[0]["data"]} />;
      case "phone-search":
        return <PhoneResults data={selectedChild.data as Parameters<typeof PhoneResults>[0]["data"]} />;
      case "address-search":
        return <AddressResults data={selectedChild.data as Parameters<typeof AddressResults>[0]["data"]} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="border-t border-mdt-border bg-mdt-panel">
        {/* Header */}
        <div className="px-3 py-2 flex items-center justify-between border-b border-mdt-border">
          <span className="text-sm font-bold text-mdt-muted">
            🔗 Related {hasContent && `(${linkedIncidents.length + childSearches.length})`}
          </span>
          <button
            onClick={() => setShowLinkModal(true)}
            className="px-3 py-1.5 bg-mdt-info/20 text-mdt-info font-semibold rounded text-sm hover:bg-mdt-info/30"
          >
            + Link Incident
          </button>
        </div>

        {/* Content Row */}
        {hasContent ? (
          <div className="p-2 flex gap-2 overflow-x-auto">
            {/* Linked Incidents */}
            {linkedIncidents.map((incident) => (
              <button
                key={incident.id}
                onClick={() => handleSwitchToIncident(incident)}
                className="flex-shrink-0 bg-mdt-high/20 border border-mdt-high rounded-lg p-2 min-w-[180px] text-left hover:bg-mdt-high/30 transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-mdt-high">🔗 LINKED</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      unlinkIncident(incident.id);
                    }}
                    className="text-mdt-muted hover:text-mdt-critical text-sm"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    incident.type === "CAD" ? "bg-mdt-critical text-white" :
                    incident.type === "AUDIO" ? "bg-mdt-high text-black" :
                    "bg-mdt-info text-black"
                  }`}>
                    {incident.type}
                  </span>
                  <span className="font-semibold text-sm truncate">{incident.title.slice(0, 20)}...</span>
                </div>
              </button>
            ))}

            {/* Child Searches */}
            {childSearches.map((child) => {
              const icon = child.type === "person-search" ? "👤" :
                          child.type === "plate-search" ? "🚗" :
                          child.type === "phone-search" ? "📞" : "🏠";
              const typeLabel = child.type === "person-search" ? "PERSON" :
                               child.type === "plate-search" ? "PLATE" :
                               child.type === "phone-search" ? "PHONE" : "ADDRESS";
              
              return (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className="flex-shrink-0 bg-mdt-bg border border-mdt-border rounded-lg p-2 min-w-[160px] text-left hover:border-mdt-info transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-mdt-info">{icon} {typeLabel}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeChildTab(alertId, child.id);
                      }}
                      className="text-mdt-muted hover:text-mdt-critical text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="font-semibold text-sm truncate">{child.title}</p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-3 text-center text-mdt-muted text-sm">
            No linked incidents or searches yet
          </div>
        )}
      </div>

      {/* Child Search Overlay */}
      {selectedChild && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
          {/* Header */}
          <div className="bg-mdt-panel border-b border-mdt-border px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedChild(null)}
                className="px-3 py-1.5 bg-mdt-border text-mdt-text rounded font-semibold text-sm hover:bg-mdt-muted/30"
              >
                ← Back to Incident
              </button>
              <span className="text-lg font-bold">
                {selectedChild.type === "person-search" ? "👤" :
                 selectedChild.type === "plate-search" ? "🚗" :
                 selectedChild.type === "phone-search" ? "📞" : "🏠"} {selectedChild.title}
              </span>
            </div>
            <button
              onClick={() => setSelectedChild(null)}
              className="text-mdt-muted hover:text-mdt-text text-2xl"
            >
              ×
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-auto bg-mdt-bg">
            {renderChildContent()}
          </div>
        </div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-mdt-panel border-2 border-mdt-border rounded-xl p-4 w-[500px] max-h-[70vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">🔗 Link Incidents</h3>
              <button
                onClick={() => setShowLinkModal(false)}
                className="text-mdt-muted hover:text-mdt-text text-2xl"
              >
                ×
              </button>
            </div>
            
            <p className="text-sm text-mdt-muted mb-3">
              Connect related incidents (gunshot → 911 call → CAD call)
            </p>

            {/* Already Linked */}
            {hasLinkedIncidents && (
              <div className="mb-4 p-3 bg-mdt-high/10 rounded-lg border border-mdt-high/30">
                <p className="text-xs font-bold text-mdt-high mb-2">Currently Linked:</p>
                <div className="space-y-1">
                  {linkedIncidents.map((incident) => (
                    <div key={incident.id} className="flex items-center justify-between bg-mdt-bg rounded p-2">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-mdt-high text-black">
                          {incident.type}
                        </span>
                        <span className="text-sm truncate">{incident.title}</span>
                      </div>
                      <button
                        onClick={() => unlinkIncident(incident.id)}
                        className="text-mdt-muted hover:text-mdt-critical text-sm px-2"
                      >
                        Unlink
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs font-bold text-mdt-muted mb-2">Available to link:</p>
            <div className="flex-1 overflow-y-auto space-y-2">
              {availableToLink.length === 0 ? (
                <p className="text-center text-mdt-muted py-4">No other incidents available</p>
              ) : (
                availableToLink.map((incident) => (
                  <button
                    key={incident.id}
                    onClick={() => handleLinkIncident(incident.id)}
                    className="w-full text-left bg-mdt-bg border border-mdt-border rounded-lg p-3 hover:border-mdt-info transition"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        incident.priority <= 1 ? "bg-mdt-critical text-white" :
                        incident.priority === 2 ? "bg-mdt-high text-black" :
                        "bg-mdt-medium text-black"
                      }`}>
                        {incident.type}
                      </span>
                      <span className="text-xs text-mdt-muted">
                        {new Date(incident.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="font-semibold truncate">{incident.title}</p>
                    <p className="text-xs text-mdt-muted truncate">{incident.locationAddr}</p>
                  </button>
                ))
              )}
            </div>

            <button
              onClick={() => setShowLinkModal(false)}
              className="mt-4 w-full py-2 bg-mdt-border text-mdt-text rounded-lg font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}