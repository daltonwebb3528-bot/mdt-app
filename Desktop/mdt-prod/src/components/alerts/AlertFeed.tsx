"use client";

import { useEffect } from "react";
import { useAlertStore } from "@/stores/alertStore";
import { AlertCard } from "./AlertCard";
import type { Alert, AlertType } from "@/lib/types";

const filterOptions: { value: AlertType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "CAD", label: "CAD" },
  { value: "LPR", label: "LPR" },
  { value: "AUDIO", label: "Audio" },
  { value: "FREEFORM", label: "Freeform" },
  { value: "PERSON", label: "Person" },
  { value: "CALL_911", label: "911" },
];

export function AlertFeed() {
  const { alerts, filter, selectedAlertId, setAlerts, addAlert, setFilter, filteredAlerts, setSelectedAlert } = useAlertStore();

  useEffect(() => {
    // Load initial alerts
    fetch("/api/alerts")
      .then((res) => res.json())
      .then((data) => setAlerts(data.alerts))
      .catch(console.error);

    // Subscribe to SSE stream
    const eventSource = new EventSource("/api/alerts/stream");
    eventSource.onmessage = (event) => {
      const alert = JSON.parse(event.data) as Alert;
      addAlert(alert);
    };

    return () => eventSource.close();
  }, [setAlerts, addAlert]);

  const displayedAlerts = filteredAlerts();

  return (
    <div className="w-80 h-full bg-mdt-panel border-r-2 border-mdt-border flex flex-col">
      <div className="p-4 border-b-2 border-mdt-border">
        <h2 className="font-bold text-xl mb-3">Alerts</h2>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-4 py-2 text-base rounded-lg transition-colors font-semibold ${
                filter === opt.value
                  ? "bg-mdt-info text-mdt-bg"
                  : "bg-mdt-border hover:bg-mdt-border/80"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {displayedAlerts.length === 0 ? (
          <p className="text-mdt-muted text-base text-center py-4">No alerts</p>
        ) : (
          displayedAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onClick={() => setSelectedAlert(alert.id)}
              isSelected={selectedAlertId === alert.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
