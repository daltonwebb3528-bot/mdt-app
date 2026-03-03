"use client";

import { useTabStore } from "@/stores/tabStore";
import { useAlertStore } from "@/stores/alertStore";

export function TabBar() {
  const { 
    tabs, 
    activeTabId, 
    setActiveTab, 
    removeTab,
    getChildTabs,
  } = useTabStore();
  const { setSelectedAlert } = useAlertStore();

  const handleTabClick = (tabId: string) => {
    setSelectedAlert(null);
    setActiveTab(tabId);
  };

  return (
    <div className="h-12 bg-mdt-bg border-b-2 border-mdt-border flex items-end overflow-x-auto">
      {tabs.map((tab) => {
        const childCount = getChildTabs(tab.id).length;
        const isActive = activeTabId === tab.id;
        
        return (
          <div
            key={tab.id}
            className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer border-t-4 transition-colors min-w-0 ${
              isActive
                ? "bg-mdt-panel border-t-mdt-info text-mdt-text"
                : "bg-mdt-bg border-t-transparent text-mdt-muted hover:bg-mdt-panel/50"
            }`}
            onClick={() => handleTabClick(tab.id)}
          >
            <span className="truncate text-sm font-semibold max-w-36">{tab.title}</span>
            {childCount > 0 && (
              <span className="text-[10px] bg-mdt-info/30 text-mdt-info px-1.5 py-0.5 rounded-full font-bold">
                {childCount}
              </span>
            )}
            {tab.id !== "map" && tab.id !== "vms" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTab(tab.id);
                }}
                className="text-mdt-muted hover:text-mdt-text text-xl leading-none font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-mdt-border"
              >
                ×
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
