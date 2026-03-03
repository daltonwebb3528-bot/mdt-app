"use client";

import { useState } from "react";
import { useTabStore } from "@/stores/tabStore";
import { useAlertStore } from "@/stores/alertStore";
import type { PlateSearchResult } from "@/lib/types";

type OtherSearchType = "phone" | "address" | "ssn" | "vin";

export function TopBar() {
  const [plateQuery, setPlateQuery] = useState("");
  const [personQuery, setPersonQuery] = useState("");
  const [otherQuery, setOtherQuery] = useState("");
  const [otherType, setOtherType] = useState<OtherSearchType>("phone");
  const [loading, setLoading] = useState(false);
  const { addTab } = useTabStore();
  const { setSelectedAlert } = useAlertStore();

  const handlePlateSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateQuery.trim()) return;

    setLoading(true);
    setSelectedAlert(null);
    
    try {
      const res = await fetch(`/api/search/plate?q=${encodeURIComponent(plateQuery.trim())}`);
      const data: PlateSearchResult = await res.json();

      addTab({
        id: `plate-${plateQuery.trim().toUpperCase()}`,
        type: "plate-search",
        title: `Plate: ${plateQuery.trim().toUpperCase()}`,
        data: data as unknown as undefined,
      });
      setPlateQuery("");
    } catch (err) {
      console.error("Plate search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personQuery.trim()) return;

    setLoading(true);
    setSelectedAlert(null);
    
    try {
      const res = await fetch(`/api/search/person?q=${encodeURIComponent(personQuery.trim())}`);
      const data = await res.json();

      addTab({
        id: `person-${Date.now()}`,
        type: "person-search",
        title: `Person: ${personQuery.trim()}`,
        data: data as unknown as undefined,
      });
      setPersonQuery("");
    } catch (err) {
      console.error("Person search error:", err);
    } finally {
      setLoading(false);
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

      // SSN returns person results, VIN returns plate results, phone/address have their own
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
    <div className="h-24 bg-mdt-panel border-b-2 border-mdt-border flex items-center px-6 gap-8">
      {/* Plate Search */}
      <form onSubmit={handlePlateSearch} className="flex items-center gap-3">
        <label className="text-sm font-bold text-mdt-muted uppercase tracking-wide">Plate</label>
        <input
          type="text"
          value={plateQuery}
          onChange={(e) => setPlateQuery(e.target.value.toUpperCase())}
          placeholder="ABC1234"
          className="w-44 px-4 py-3 bg-mdt-bg border-2 border-mdt-border rounded-xl text-lg font-mono font-bold focus:outline-none focus:border-mdt-info"
          maxLength={10}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-mdt-info text-mdt-bg font-bold rounded-xl text-lg hover:brightness-110 disabled:opacity-50"
        >
          🔍
        </button>
      </form>

      {/* Person Search */}
      <form onSubmit={handlePersonSearch} className="flex items-center gap-3">
        <label className="text-sm font-bold text-mdt-muted uppercase tracking-wide">Person</label>
        <input
          type="text"
          value={personQuery}
          onChange={(e) => setPersonQuery(e.target.value)}
          placeholder="Name or DL#"
          className="w-48 px-4 py-3 bg-mdt-bg border-2 border-mdt-border rounded-xl text-lg focus:outline-none focus:border-mdt-info"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-mdt-info text-mdt-bg font-bold rounded-xl text-lg hover:brightness-110 disabled:opacity-50"
        >
          🔍
        </button>
      </form>

      {/* Other Search with Dropdown */}
      <form onSubmit={handleOtherSearch} className="flex items-center gap-3">
        <select
          value={otherType}
          onChange={(e) => setOtherType(e.target.value as OtherSearchType)}
          className="px-3 py-3 bg-mdt-bg border-2 border-mdt-border rounded-xl text-lg font-bold text-mdt-info focus:outline-none focus:border-mdt-info cursor-pointer"
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
          className="w-52 px-4 py-3 bg-mdt-bg border-2 border-mdt-border rounded-xl text-lg focus:outline-none focus:border-mdt-info"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-mdt-info text-mdt-bg font-bold rounded-xl text-lg hover:brightness-110 disabled:opacity-50"
        >
          🔍
        </button>
      </form>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Unit ID */}
      <div className="text-right">
        <span className="text-sm text-mdt-muted uppercase tracking-wide">Unit</span>
        <p className="text-3xl font-bold text-mdt-info">4A21</p>
      </div>
    </div>
  );
}
