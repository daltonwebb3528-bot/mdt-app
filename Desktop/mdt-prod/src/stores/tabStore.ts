import { create } from "zustand";
import type { Tab, Alert } from "@/lib/types";

interface ChildTab {
  id: string;
  type: "person-search" | "plate-search" | "phone-search" | "address-search";
  title: string;
  data: unknown;
}

interface TabStore {
  tabs: Tab[];
  activeTabId: string;
  
  // Child tabs per parent alert
  childTabs: Record<string, ChildTab[]>;  // parentTabId -> children
  activeChildId: Record<string, string | null>; // parentTabId -> active child id
  
  // Linked incidents
  linkedIncidents: Record<string, string[]>; // groupId -> alertIds
  incidentGroups: Record<string, string>; // alertId -> groupId
  
  // Tab actions
  addTab: (tab: Tab) => void;
  addTabWithoutSwitch: (tab: Tab) => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  openAlertTab: (alert: Alert) => void;
  
  // Child tab actions
  addChildTab: (parentTabId: string, child: ChildTab) => void;
  removeChildTab: (parentTabId: string, childId: string) => void;
  setActiveChild: (parentTabId: string, childId: string | null) => void;
  getChildTabs: (parentTabId: string) => ChildTab[];
  getActiveChild: (parentTabId: string) => ChildTab | null;
  
  // Incident linking
  linkIncidents: (alertId1: string, alertId2: string) => void;
  unlinkIncident: (alertId: string) => void;
  getLinkedIncidents: (alertId: string) => string[];
}

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: [
    { id: "map", type: "map", title: "Map" },
    { id: "vms", type: "vms", title: "VMS" },
  ],
  activeTabId: "map",
  childTabs: {},
  activeChildId: {},
  linkedIncidents: {},
  incidentGroups: {},

  addTab: (tab) => {
    const existing = get().tabs.find((t) => t.id === tab.id);
    if (existing) {
      set({ activeTabId: tab.id });
    } else {
      set((state) => ({
        tabs: [...state.tabs, tab],
        activeTabId: tab.id,
        childTabs: { ...state.childTabs, [tab.id]: [] },
        activeChildId: { ...state.activeChildId, [tab.id]: null },
      }));
    }
  },

  addTabWithoutSwitch: (tab) => {
    const existing = get().tabs.find((t) => t.id === tab.id);
    if (!existing) {
      set((state) => ({
        tabs: [...state.tabs, tab],
        childTabs: { ...state.childTabs, [tab.id]: [] },
        activeChildId: { ...state.activeChildId, [tab.id]: null },
      }));
    }
  },

  removeTab: (id) => {
    if (id === "map" || id === "vms") return;
    set((state) => {
      const newTabs = state.tabs.filter((t) => t.id !== id);
      const newActiveId =
        state.activeTabId === id
          ? newTabs[newTabs.length - 1]?.id || "map"
          : state.activeTabId;
      
      // Clean up child tabs
      const newChildTabs = { ...state.childTabs };
      delete newChildTabs[id];
      const newActiveChildId = { ...state.activeChildId };
      delete newActiveChildId[id];
      
      return { 
        tabs: newTabs, 
        activeTabId: newActiveId,
        childTabs: newChildTabs,
        activeChildId: newActiveChildId,
      };
    });
  },

  setActiveTab: (id) => set({ activeTabId: id }),

  openAlertTab: (alert) => {
    const tabId = `alert-${alert.id}`;
    let tabTitle = "";
    
    switch (alert.type) {
      case "CAD":
        tabTitle = `CAD: ${alert.title.slice(0, 15)}...`;
        break;
      case "LPR":
        tabTitle = `LPR: ${(alert.rawData as { plate?: string }).plate || "Unknown"}`;
        break;
      case "AUDIO":
        tabTitle = `Audio: ${(alert.rawData as { subtype?: string }).subtype || "Alert"}`;
        break;
      case "FREEFORM":
        tabTitle = `Freeform: ${alert.title.slice(0, 12)}...`;
        break;
      case "PERSON":
        tabTitle = `Person: ${(alert.rawData as { name?: string }).name?.split(",")[0] || "Unknown"}`;
        break;
      default:
        tabTitle = `911: ${alert.title.slice(0, 15)}...`;
    }

    get().addTabWithoutSwitch({
      id: tabId,
      type: "alert",
      title: tabTitle,
      data: alert,
    });
  },

  // Child tab management
  addChildTab: (parentTabId, child) => {
    set((state) => {
      const existing = state.childTabs[parentTabId] || [];
      // Don't add duplicates
      if (existing.some(c => c.id === child.id)) {
        return { activeChildId: { ...state.activeChildId, [parentTabId]: child.id } };
      }
      return {
        childTabs: {
          ...state.childTabs,
          [parentTabId]: [...existing, child],
        },
        activeChildId: {
          ...state.activeChildId,
          [parentTabId]: child.id,
        },
      };
    });
  },

  removeChildTab: (parentTabId, childId) => {
    set((state) => {
      const existing = state.childTabs[parentTabId] || [];
      const newChildren = existing.filter(c => c.id !== childId);
      const wasActive = state.activeChildId[parentTabId] === childId;
      
      return {
        childTabs: {
          ...state.childTabs,
          [parentTabId]: newChildren,
        },
        activeChildId: {
          ...state.activeChildId,
          [parentTabId]: wasActive ? null : state.activeChildId[parentTabId],
        },
      };
    });
  },

  setActiveChild: (parentTabId, childId) => {
    set((state) => ({
      activeChildId: {
        ...state.activeChildId,
        [parentTabId]: childId,
      },
    }));
  },

  getChildTabs: (parentTabId) => {
    return get().childTabs[parentTabId] || [];
  },

  getActiveChild: (parentTabId) => {
    const state = get();
    const activeId = state.activeChildId[parentTabId];
    if (!activeId) return null;
    const children = state.childTabs[parentTabId] || [];
    return children.find(c => c.id === activeId) || null;
  },

  // Incident linking
  linkIncidents: (alertId1, alertId2) => {
    set((state) => {
      const group1 = state.incidentGroups[alertId1];
      const group2 = state.incidentGroups[alertId2];
      
      if (group1 && group2 && group1 === group2) {
        return state;
      }
      
      let newLinkedIncidents = { ...state.linkedIncidents };
      let newIncidentGroups = { ...state.incidentGroups };
      
      if (group1 && group2) {
        // Merge groups
        const group2Alerts = newLinkedIncidents[group2] || [];
        newLinkedIncidents[group1] = [...(newLinkedIncidents[group1] || []), ...group2Alerts];
        delete newLinkedIncidents[group2];
        group2Alerts.forEach(id => {
          newIncidentGroups[id] = group1;
        });
      } else if (group1) {
        newLinkedIncidents[group1] = [...(newLinkedIncidents[group1] || []), alertId2];
        newIncidentGroups[alertId2] = group1;
      } else if (group2) {
        newLinkedIncidents[group2] = [...(newLinkedIncidents[group2] || []), alertId1];
        newIncidentGroups[alertId1] = group2;
      } else {
        const newGroupId = `group-${Date.now()}`;
        newLinkedIncidents[newGroupId] = [alertId1, alertId2];
        newIncidentGroups[alertId1] = newGroupId;
        newIncidentGroups[alertId2] = newGroupId;
      }
      
      return {
        linkedIncidents: newLinkedIncidents,
        incidentGroups: newIncidentGroups,
      };
    });
  },

  unlinkIncident: (alertId) => {
    set((state) => {
      const groupId = state.incidentGroups[alertId];
      if (!groupId) return state;
      
      const newIncidentGroups = { ...state.incidentGroups };
      delete newIncidentGroups[alertId];
      
      const newLinkedIncidents = { ...state.linkedIncidents };
      newLinkedIncidents[groupId] = (newLinkedIncidents[groupId] || []).filter(id => id !== alertId);
      
      if (newLinkedIncidents[groupId].length <= 1) {
        const lastId = newLinkedIncidents[groupId][0];
        if (lastId) delete newIncidentGroups[lastId];
        delete newLinkedIncidents[groupId];
      }
      
      return {
        linkedIncidents: newLinkedIncidents,
        incidentGroups: newIncidentGroups,
      };
    });
  },

  getLinkedIncidents: (alertId) => {
    const state = get();
    const groupId = state.incidentGroups[alertId];
    if (!groupId) return [];
    return (state.linkedIncidents[groupId] || []).filter(id => id !== alertId);
  },
}));
