"use client";

import { useState, useEffect } from "react";
import { useTabStore } from "@/stores/tabStore";
import { useAlertStore } from "@/stores/alertStore";
import { VoiceControl, speakSummaryWithQuery, voiceEvents } from "@/components/voice/VoiceControl";
import type { PlateSearchResult, PersonSearchResult } from "@/lib/types";

type OtherSearchType = "phone" | "address" | "ssn" | "vin";

interface VoiceCommand {
  action: "plate" | "person" | "phone" | "address" | "read" | "analysis" | "unknown";
  query: string;
  raw: string;
}

export function TopBar() {
  const [plateQuery, setPlateQuery] = useState("");
  const [personQuery, setPersonQuery] = useState("");
  const [otherQuery, setOtherQuery] = useState("");
  const [otherType, setOtherType] = useState<OtherSearchType>("phone");
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState("----");
  const { addTab, tabs, activeTabId } = useTabStore();
  const { setSelectedAlert } = useAlertStore();

  // Load unit from localStorage
  useEffect(() => {
    const savedUnit = localStorage.getItem("mdt_unit");
    if (savedUnit) {
      setUnit(savedUnit);
    }
  }, []);

  const handlePlateSearch = async (query?: string, fromVoice = false) => {
    const searchQuery = query || plateQuery.trim();
    if (!searchQuery) return;

    setLoading(true);
    setSelectedAlert(null);
    
    try {
      const res = await fetch(`/api/search/plate?q=${encodeURIComponent(searchQuery)}`);
      const data: PlateSearchResult = await res.json();

      addTab({
        id: `plate-${searchQuery.toUpperCase()}`,
        type: "plate-search",
        title: `Plate: ${searchQuery.toUpperCase()}`,
        data: data as unknown as undefined,
      });
      setPlateQuery("");

      // Auto-speak summary for voice searches, passing the original query
      if (fromVoice) {
        await speakSummaryWithQuery("plate", data, searchQuery.toUpperCase());
      }
    } catch (err) {
      console.error("Plate search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonSearch = async (query?: string, fromVoice = false) => {
    const searchQuery = query || personQuery.trim();
    if (!searchQuery) return;

    setLoading(true);
    setSelectedAlert(null);
    
    try {
      const res = await fetch(`/api/search/person?q=${encodeURIComponent(searchQuery)}`);
      const data: PersonSearchResult = await res.json();

      addTab({
        id: `person-${Date.now()}`,
        type: "person-search",
        title: `Person: ${searchQuery}`,
        data: data as unknown as undefined,
      });
      setPersonQuery("");

      // Auto-speak summary for voice searches, passing the original query
      if (fromVoice) {
        await speakSummaryWithQuery("person", data, searchQuery);
      }
    } catch (err) {
      console.error("Person search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSearch = async (query: string, fromVoice = false) => {
    if (!query) return;

    setLoading(true);
    setSelectedAlert(null);
    
    try {
      const res = await fetch(`/api/search/phone?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      addTab({
        id: `phone-${Date.now()}`,
        type: "phone-search",
        title: `Phone: ${query}`,
        data: data as unknown as undefined,
      });

      if (fromVoice) {
        await speakSummaryWithQuery("phone", data, query);
      }
    } catch (err) {
      console.error("Phone search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSearch = async (query: string, fromVoice = false) => {
    if (!query) return;

    setLoading(true);
    setSelectedAlert(null);
    
    try {
      const res = await fetch(`/api/search/address?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      addTab({
        id: `address-${Date.now()}`,
        type: "address-search",
        title: `Address: ${query}`,
        data: data as unknown as undefined,
      });

      if (fromVoice) {
        await speakSummaryWithQuery("address", data, query);
      }
    } catch (err) {
      console.error("Address search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReadCurrentAnalysis = async () => {
    // Find the active tab and read its summary
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab?.data) {
      const { speakText } = await import("@/components/voice/VoiceControl");
      await speakText("No active search results to read.");
      return;
    }

    const type = activeTab.type.replace("-search", "");
    // Extract query from tab title
    const query = activeTab.title.split(": ")[1] || "";
    await speakSummaryWithQuery(type, activeTab.data, query);
  };

  const handleVoiceCommand = async (command: VoiceCommand) => {
    switch (command.action) {
      case "plate":
        await handlePlateSearch(command.query, true);
        break;
      case "person":
        // Pass the raw transcript for person so we get "Bob Smith 1-1-1980" not just parsed name
        await handlePersonSearch(command.query || command.raw.replace(/^(run|check|search|find)\s*(person|name|subject)?\s*/i, '').trim(), true);
        break;
      case "phone":
        await handlePhoneSearch(command.query, true);
        break;
      case "address":
        await handleAddressSearch(command.query, true);
        break;
      case "read":
        await handleReadCurrentAnalysis();
        break;
      case "analysis":
        // Emit event for alert components to handle
        voiceEvents.emit("run-analysis");
        break;
      default:
        const { speakText } = await import("@/components/voice/VoiceControl");
        await speakText(`Sorry, I didn't understand: ${command.raw}`);
    }
  };

  const handleOtherSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otherQuery.trim()) return;

    setLoading(true);
    setSelectedAlert(null);
    
    try {
      const res = await fetch(`/api/search/${otherType}?q=${encodeURIComponent(otherQuery.trim())}`);
      const data = await res.json();

      const typeLabels: Record<OtherSearchType, string> = {
        phone: "Phone",
        address: "Address", 
        ssn: "SSN",
        vin: "VIN",
      };

      const tabType = otherType === "ssn" ? "person-search" 
        : otherType === "vin" ? "plate-search"
        : otherType === "phone" ? "phone-search"
        : "address-search";

      addTab({
        id: `${otherType}-${Date.now()}`,
        type: tabType,
        title: `${typeLabels[otherType]}: ${otherQuery.trim()}`,
        data: data as unknown as undefined,
      });
      setOtherQuery("");
    } catch (err) {
      console.error("Other search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholder = () => {
    switch (otherType) {
      case "phone": return "480-555-1234";
      case "address": return "123 Main St";
      case "ssn": return "123-45-6789";
      case "vin": return "1HGBH41JXMN109186";
    }
  };

  return (
    <div className="h-24 bg-mdt-panel border-b-2 border-mdt-border flex items-center px-6 gap-6">
      {/* Voice Control */}
      <VoiceControl onCommand={handleVoiceCommand} />

      {/* Divider */}
      <div className="w-px h-12 bg-mdt-border" />

      {/* Plate Search */}
      <form onSubmit={(e) => { e.preventDefault(); handlePlateSearch(); }} className="flex items-center gap-3">
        <label className="text-sm font-bold text-mdt-muted uppercase tracking-wide">Plate</label>
        <input
          type="text"
          value={plateQuery}
          onChange={(e) => setPlateQuery(e.target.value.toUpperCase())}
          placeholder="ABC1234"
          className="w-36 px-4 py-3 bg-mdt-bg border-2 border-mdt-border rounded-xl text-lg font-mono font-bold focus:outline-none focus:border-mdt-accent"
          maxLength={10}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-3 bg-mdt-accent text-white font-bold rounded-xl text-lg hover:brightness-110 disabled:opacity-50"
        >
          🔍
        </button>
      </form>

      {/* Person Search */}
      <form onSubmit={(e) => { e.preventDefault(); handlePersonSearch(); }} className="flex items-center gap-3">
        <label className="text-sm font-bold text-mdt-muted uppercase tracking-wide">Person</label>
        <input
          type="text"
          value={personQuery}
          onChange={(e) => setPersonQuery(e.target.value)}
          placeholder="Name or DL#"
          className="w-40 px-4 py-3 bg-mdt-bg border-2 border-mdt-border rounded-xl text-lg focus:outline-none focus:border-mdt-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-3 bg-mdt-accent text-white font-bold rounded-xl text-lg hover:brightness-110 disabled:opacity-50"
        >
          🔍
        </button>
      </form>

      {/* Other Search with Dropdown */}
      <form onSubmit={handleOtherSearch} className="flex items-center gap-3">
        <select
          value={otherType}
          onChange={(e) => setOtherType(e.target.value as OtherSearchType)}
          className="px-3 py-3 bg-mdt-bg border-2 border-mdt-border rounded-xl text-lg font-bold text-mdt-accent focus:outline-none focus:border-mdt-accent cursor-pointer"
        >
          <option value="phone">Phone</option>
          <option value="address">Address</option>
          <option value="ssn">SSN</option>
          <option value="vin">VIN</option>
        </select>
        <input
          type="text"
          value={otherQuery}
          onChange={(e) => setOtherQuery(e.target.value)}
          placeholder={getPlaceholder()}
          className="w-44 px-4 py-3 bg-mdt-bg border-2 border-mdt-border rounded-xl text-lg focus:outline-none focus:border-mdt-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-3 bg-mdt-accent text-white font-bold rounded-xl text-lg hover:brightness-110 disabled:opacity-50"
        >
          🔍
        </button>
      </form>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Unit ID */}
      <div className="text-right">
        <span className="text-sm text-mdt-muted uppercase tracking-wide">Unit</span>
        <p className="text-3xl font-bold text-mdt-accent">{unit}</p>
      </div>
    </div>
  );
}
