"use client";

import { useTabStore } from "@/stores/tabStore";

interface PhoneResult {
  phone: string;
  carrier: string;
  lineType: string;
  registeredName: string;
  registeredAddress: string;
  accountStatus: string;
  accountAge: string;
  associatedPersons: Array<{
    name: string;
    relationship: string;
    dob: string;
  }>;
  callHistory: Array<{
    date: string;
    type: string;
    duration: string;
    otherNumber: string;
  }>;
  priorIncidents: Array<{
    date: string;
    type: string;
    caseNumber: string;
  }>;
  aiSummary: string;
}

interface PhoneResultsProps {
  data: PhoneResult;
}

export function PhoneResults({ data }: PhoneResultsProps) {
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

  return (
    <div className="h-full flex bg-mdt-bg">
      {/* Left Column - Phone Info */}
      <div className="w-1/3 border-r border-mdt-border flex flex-col">
        <div className="bg-mdt-panel px-4 py-3 border-b border-mdt-border">
          <span className="font-bold text-lg text-mdt-info">📞 Phone Details</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Phone Number */}
          <div className="bg-mdt-panel rounded-lg p-4">
            <p className="text-xs text-mdt-muted uppercase mb-1">Phone Number</p>
            <p className="text-3xl font-mono font-bold text-mdt-info">{data.phone}</p>
          </div>

          {/* Carrier Info */}
          <div className="bg-mdt-panel rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-mdt-muted uppercase">Carrier</p>
                <p className="text-lg font-semibold">{data.carrier}</p>
              </div>
              <div>
                <p className="text-xs text-mdt-muted uppercase">Line Type</p>
                <p className="text-lg font-semibold">{data.lineType}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-mdt-muted uppercase">Status</p>
                <p className={`text-lg font-semibold ${data.accountStatus === "Active" ? "text-mdt-low" : "text-mdt-critical"}`}>
                  {data.accountStatus}
                </p>
              </div>
              <div>
                <p className="text-xs text-mdt-muted uppercase">Account Age</p>
                <p className="text-lg font-semibold">{data.accountAge}</p>
              </div>
            </div>
          </div>

          {/* Registered To */}
          <div className="bg-mdt-panel rounded-lg p-4">
            <p className="text-xs text-mdt-muted uppercase mb-2">Registered To</p>
            <button
              onClick={() => searchPerson(data.registeredName)}
              className="text-xl font-bold text-mdt-info hover:underline text-left"
            >
              {data.registeredName}
            </button>
            <p className="text-sm text-mdt-muted mt-1">{data.registeredAddress}</p>
          </div>

          {/* AI Summary */}
          <div className="bg-mdt-info/10 border border-mdt-info/30 rounded-lg p-4">
            <p className="text-xs text-mdt-info font-bold uppercase mb-2">🤖 AI Analysis</p>
            <p className="text-sm">{data.aiSummary}</p>
          </div>
        </div>
      </div>

      {/* Middle Column - Associated Persons */}
      <div className="w-1/3 border-r border-mdt-border flex flex-col">
        <div className="bg-mdt-panel px-4 py-3 border-b border-mdt-border">
          <span className="font-bold text-lg">👥 Associated Persons</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {data.associatedPersons.map((person, i) => (
            <div key={i} className="bg-mdt-panel rounded-lg p-4">
              <button
                onClick={() => searchPerson(person.name)}
                className="text-lg font-bold text-mdt-info hover:underline text-left"
              >
                {person.name}
              </button>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <p className="text-xs text-mdt-muted">Relationship</p>
                  <p className="text-sm font-semibold">{person.relationship}</p>
                </div>
                <div>
                  <p className="text-xs text-mdt-muted">DOB</p>
                  <p className="text-sm font-semibold">{person.dob}</p>
                </div>
              </div>
            </div>
          ))}

          {data.priorIncidents.length > 0 && (
            <>
              <div className="pt-4 border-t border-mdt-border">
                <p className="text-sm font-bold text-mdt-muted uppercase mb-3">Prior Incidents</p>
              </div>
              {data.priorIncidents.map((incident, i) => (
                <div key={i} className="bg-mdt-high/10 border-l-4 border-mdt-high rounded-r-lg p-3">
                  <p className="font-semibold">{incident.type}</p>
                  <div className="flex justify-between text-sm text-mdt-muted mt-1">
                    <span>{incident.date}</span>
                    <span className="font-mono">{incident.caseNumber}</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Right Column - Call History */}
      <div className="w-1/3 flex flex-col">
        <div className="bg-mdt-panel px-4 py-3 border-b border-mdt-border">
          <span className="font-bold text-lg">📋 Recent Call History</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {data.callHistory.map((call, i) => (
              <div key={i} className="bg-mdt-panel rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      call.type === "Incoming" ? "bg-mdt-low/20 text-mdt-low" :
                      call.type === "Outgoing" ? "bg-mdt-info/20 text-mdt-info" :
                      "bg-mdt-critical/20 text-mdt-critical"
                    }`}>
                      {call.type}
                    </span>
                    <p className="font-mono text-lg mt-1">{call.otherNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-mdt-muted">{new Date(call.date).toLocaleDateString()}</p>
                    <p className="text-sm font-semibold">{call.duration}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
