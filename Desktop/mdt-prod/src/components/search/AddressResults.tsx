"use client";

import { useTabStore } from "@/stores/tabStore";

interface Resident {
  name: string;
  relationship: string;
  dob: string;
  hasWarrants: boolean;
  warrantType?: string;
}

interface Vehicle {
  plate: string;
  make: string;
  model: string;
  year: number;
  color: string;
}

interface PriorCall {
  date: string;
  type: string;
  disposition: string;
  caseNumber: string;
}

interface AddressResult {
  address: string;
  normalizedAddress: string;
  propertyType: string;
  propertyOwner: string;
  yearBuilt: number;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  assessedValue: string;
  residents: Resident[];
  registeredVehicles: Vehicle[];
  priorCalls: PriorCall[];
  totalCallsLast2Years: number;
  officerSafetyAlerts: string[];
  aiSummary: string;
}

interface AddressResultsProps {
  data: AddressResult;
}

export function AddressResults({ data }: AddressResultsProps) {
  const { addTab } = useTabStore();

  const searchPerson = (name: string) => {
    fetch(`/api/search/person?q=${encodeURIComponent(name)}`)
      .then((res) => res.json())
      .then((personData) => {
        addTab({
          id: `person-${Date.now()}`,
          type: "person-search",
          title: `Person: ${name}`,
          data: personData,
        });
      });
  };

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

  const hasWarrants = data.residents.some(r => r.hasWarrants);

  return (
    <div className="h-full flex flex-col bg-mdt-bg">
      {/* Officer Safety Banner */}
      {data.officerSafetyAlerts.length > 0 && (
        <div className="bg-mdt-critical/20 border-b-2 border-mdt-critical px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold text-mdt-critical uppercase">Officer Safety Alert</p>
              {data.officerSafetyAlerts.map((alert, i) => (
                <p key={i} className="text-sm">{alert}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Property Info */}
        <div className="w-1/3 border-r border-mdt-border flex flex-col">
          <div className="bg-mdt-panel px-4 py-3 border-b border-mdt-border">
            <span className="font-bold text-lg text-mdt-info">🏠 Property Details</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Address */}
            <div className="bg-mdt-panel rounded-lg p-4">
              <p className="text-xs text-mdt-muted uppercase mb-1">Address</p>
              <p className="text-xl font-bold">{data.normalizedAddress}</p>
            </div>

            {/* Property Info */}
            <div className="bg-mdt-panel rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-mdt-muted">Property Type</p>
                  <p className="text-sm font-semibold">{data.propertyType}</p>
                </div>
                <div>
                  <p className="text-xs text-mdt-muted">Year Built</p>
                  <p className="text-sm font-semibold">{data.yearBuilt}</p>
                </div>
                <div>
                  <p className="text-xs text-mdt-muted">Size</p>
                  <p className="text-sm font-semibold">{data.sqft.toLocaleString()} sqft</p>
                </div>
                <div>
                  <p className="text-xs text-mdt-muted">Bed/Bath</p>
                  <p className="text-sm font-semibold">{data.bedrooms}bd / {data.bathrooms}ba</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-mdt-muted">Assessed Value</p>
                <p className="text-lg font-bold text-mdt-info">{data.assessedValue}</p>
              </div>
            </div>

            {/* AI Summary */}
            <div className="bg-mdt-info/10 border border-mdt-info/30 rounded-lg p-4">
              <p className="text-xs text-mdt-info font-bold uppercase mb-2">🤖 AI Analysis</p>
              <p className="text-sm">{data.aiSummary}</p>
            </div>
          </div>
        </div>

        {/* Middle Column - Linked Individuals & Vehicles */}
        <div className="w-1/3 border-r border-mdt-border flex flex-col">
          <div className="bg-mdt-panel px-4 py-3 border-b border-mdt-border">
            <span className="font-bold text-lg">👥 Linked Individuals ({data.residents.length})</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {data.residents.map((resident, i) => (
              <button
                key={i}
                onClick={() => searchPerson(resident.name)}
                className={`w-full text-left rounded-lg p-3 hover:brightness-110 transition ${
                  resident.hasWarrants 
                    ? "bg-mdt-critical/20 border-l-4 border-mdt-critical" 
                    : "bg-mdt-panel"
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-base font-bold text-mdt-info hover:underline">
                    {resident.name}
                  </span>
                  {resident.hasWarrants && (
                    <span className="px-2 py-0.5 bg-mdt-critical text-white text-xs font-bold rounded">
                      WARRANT
                    </span>
                  )}
                </div>
                <p className="text-xs text-mdt-muted">{resident.relationship}</p>
                <p className="text-xs text-mdt-muted">DOB: {resident.dob}</p>
                {resident.hasWarrants && (
                  <p className="text-sm font-semibold text-mdt-critical mt-1">{resident.warrantType}</p>
                )}
              </button>
            ))}

            {/* Linked Vehicles */}
            <div className="pt-4 border-t border-mdt-border">
              <p className="text-sm font-bold text-mdt-muted uppercase mb-3">🚗 Linked Vehicles ({data.registeredVehicles.length})</p>
            </div>
            {data.registeredVehicles.length === 0 ? (
              <p className="text-mdt-muted text-center py-4">No vehicles linked to this address</p>
            ) : (
              data.registeredVehicles.map((vehicle, i) => (
                <button
                  key={i}
                  onClick={() => searchPlate(vehicle.plate)}
                  className="w-full text-left bg-mdt-panel rounded-lg p-4 hover:brightness-110 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-2xl font-mono font-bold text-mdt-info">
                      {vehicle.plate}
                    </span>
                    <span className="text-xs text-mdt-muted">AZ</span>
                  </div>
                  <p className="text-lg font-semibold">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                  <p className="text-sm text-mdt-muted">{vehicle.color}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column - Prior Calls */}
        <div className="w-1/3 flex flex-col">
          <div className="bg-mdt-panel px-4 py-3 border-b border-mdt-border flex justify-between items-center">
            <span className="font-bold text-lg">📋 Prior Calls</span>
            <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
              data.totalCallsLast2Years > 10 ? "bg-mdt-critical/20 text-mdt-critical" :
              data.totalCallsLast2Years > 5 ? "bg-mdt-high/20 text-mdt-high" :
              "bg-mdt-border"
            }`}>
              {data.totalCallsLast2Years} in 2 yrs
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {data.priorCalls.length === 0 ? (
              <p className="text-mdt-muted text-center py-8">No prior calls for service</p>
            ) : (
              <div className="space-y-2">
                {data.priorCalls.map((call, i) => (
                  <div key={i} className="bg-mdt-panel rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-sm">{call.type}</p>
                      <p className="text-xs text-mdt-muted">{call.date}</p>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        call.disposition === "Arrest Made" ? "bg-mdt-critical/20 text-mdt-critical" :
                        call.disposition === "Citation Issued" ? "bg-mdt-high/20 text-mdt-high" :
                        "bg-mdt-border text-mdt-muted"
                      }`}>
                        {call.disposition}
                      </span>
                      <span className="text-xs font-mono text-mdt-muted">{call.caseNumber}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
