export type AlertType = "CAD" | "LPR" | "AUDIO" | "CALL_911" | "FREEFORM" | "PERSON";
export type AudioAlertSubtype = "GUNSHOT" | "DISTRESS" | "CRASH";
export type AlertStatus = "active" | "acknowledged" | "cleared";
export type Priority = 0 | 1 | 2 | 3 | 4;

export interface Alert {
  id: string;
  type: AlertType;
  priority: Priority;
  title: string;
  summary: string;
  locationLat: number;
  locationLng: number;
  locationAddr: string;
  rawData: Record<string, unknown>;
  aiSummary: string;
  status: AlertStatus;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  state: string;
  make: string;
  model: string;
  year: number;
  color: string;
  vin: string;
  ownerId: string | null;
  owner?: Person;
  ncicStatus: {
    stolen: boolean;
    stolenDate?: string;
    caseNumber?: string;
    wanted: boolean;
  };
  flags: string[];
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  dlNumber: string;
  dlState: string;
  address: string;
  ncicStatus: {
    warrants: Array<{ type: string; description: string; date: string }>;
    alerts: string[];
  };
  flags: string[];
  aiSummary: string;
  vehicles?: Vehicle[];
}

export interface LprRead {
  id: string;
  plate: string;
  cameraId: string;
  cameraName: string;
  locationLat: number;
  locationLng: number;
  timestamp: string;
  imageUrl: string;
}

export interface Tab {
  id: string;
  type: "map" | "vms" | "alert" | "plate-search" | "person-search" | "phone-search" | "address-search";
  title: string;
  data?: Alert | Vehicle | Person;
}

export interface PlateSearchResult {
  vehicle: Vehicle | null;
  owner: Person | null;
  lprHistory: LprRead[];
  aiSummary: string;
}

export interface PersonSearchResult {
  persons: Person[];
}

export interface User {
  id: string;
  email: string;
  name?: string;
  badge?: string;
  unit?: string;
}
