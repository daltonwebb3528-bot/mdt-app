"use client";

import { useTabStore } from "@/stores/tabStore";
import { useAlertStore } from "@/stores/alertStore";
import { MapView } from "@/components/map/MapView";
import { VMSView } from "@/components/vms/VMSView";
import { AlertDetail } from "@/components/alerts/AlertDetail";
import { PlateResults } from "@/components/search/PlateResults";
import { PersonResults } from "@/components/search/PersonResults";
import { PhoneResults } from "@/components/search/PhoneResults";
import { AddressResults } from "@/components/search/AddressResults";
import type { Alert, PlateSearchResult } from "@/lib/types";

export function MainContent() {
  const { tabs, activeTabId } = useTabStore();
  const { getSelectedAlert, selectedAlertId } = useAlertStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const selectedAlert = getSelectedAlert();

  // Render tab content
  const renderTabContent = () => {
    if (!activeTab || activeTab.type === "map") {
      return <MapView />;
    }

    if (activeTab.type === "vms") {
      return <VMSView />;
    }

    if (activeTab.type === "alert" && activeTab.data) {
      return <AlertDetail alert={activeTab.data as Alert} isPreview={false} />;
    }

    if (activeTab.type === "plate-search" && activeTab.data) {
      return <PlateResults data={activeTab.data as unknown as PlateSearchResult} />;
    }

    if (activeTab.type === "person-search" && activeTab.data) {
      return <PersonResults data={activeTab.data as unknown as { persons: [] }} />;
    }

    if (activeTab.type === "phone-search" && activeTab.data) {
      return <PhoneResults data={activeTab.data as unknown as Parameters<typeof PhoneResults>[0]["data"]} />;
    }

    if (activeTab.type === "address-search" && activeTab.data) {
      return <AddressResults data={activeTab.data as unknown as Parameters<typeof AddressResults>[0]["data"]} />;
    }

    return <MapView />;
  };

  // If an alert is selected from the feed, show it as a preview overlay
  const showPreviewOverlay = selectedAlertId && selectedAlert;

  return (
    <div className="relative w-full h-full">
      {/* Base layer - active tab content */}
      <div className="absolute inset-0 bg-mdt-bg">
        {renderTabContent()}
      </div>

      {/* Preview overlay - shows when alert selected from feed */}
      {showPreviewOverlay && (
        <div className="absolute inset-0 bg-mdt-bg z-10">
          <AlertDetail alert={selectedAlert} isPreview={true} />
        </div>
      )}
    </div>
  );
}
