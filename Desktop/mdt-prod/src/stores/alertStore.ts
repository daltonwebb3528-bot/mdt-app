import { create } from "zustand";
import type { Alert, AlertType } from "@/lib/types";

interface AlertStore {
  alerts: Alert[];
  filter: AlertType | "ALL";
  selectedAlertId: string | null;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  setFilter: (filter: AlertType | "ALL") => void;
  setSelectedAlert: (id: string | null) => void;
  getSelectedAlert: () => Alert | null;
  filteredAlerts: () => Alert[];
}

export const useAlertStore = create<AlertStore>((set, get) => ({
  alerts: [],
  filter: "ALL",
  selectedAlertId: null,

  setAlerts: (alerts) => set({ alerts }),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 100), // Keep last 100
    })),

  setFilter: (filter) => set({ filter }),

  setSelectedAlert: (id) => set({ selectedAlertId: id }),

  getSelectedAlert: () => {
    const { alerts, selectedAlertId } = get();
    return alerts.find((a) => a.id === selectedAlertId) || null;
  },

  filteredAlerts: () => {
    const { alerts, filter } = get();
    if (filter === "ALL") return alerts;
    return alerts.filter((a) => a.type === filter);
  },
}));
