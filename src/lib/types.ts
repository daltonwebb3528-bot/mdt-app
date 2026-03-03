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

// Search result types
export interface PlateSearchResult {
  vehicle: Vehicle | null;
  owner: Person | null;
  lprHistory: LprRead[];
  aiSummary: string;
}

export interface PersonSearchResult {
  persons: Person[];
}

export interface PhoneSearchResult {
  phone: string;
  carrier: string;
  lineType: string;
  registeredName: string;
  registeredAddress: string;
  accountStatus: string;
  accountAge: string;
  associatedPersons: Array<{ name: string; relationship: string; dob: string }>;
  callHistory: Array<{ date: string; type: string; duration: string; otherNumber: string }>;
  priorIncidents: Array<{ date: string; type: string; caseNumber: string }>;
  aiSummary: string;
}

export interface AddressSearchResult {
  address: string;
  normalizedAddress: string;
  propertyType: string;
  propertyOwner: string;
  yearBuilt: number;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  assessedValue: string;
  residents: Array<{
    name: string;
    relationship: string;
    dob: string;
    hasWarrants: boolean;
    warrantType?: string;
  }>;
  registeredVehicles: Array<{
    plate: string;
    make: string;
    model: string;
    year: number;
    color: string;
  }>;
  priorCalls: Array<{
    date: string;
    type: string;
    disposition: string;
    caseNumber: string;
  }>;
  totalCallsLast2Years: number;
  officerSafetyAlerts: string[];
  aiSummary: string;
}

// Tab data can be an alert, or any search result type
export type TabData = 
  | Alert 
  | Vehicle 
  | Person 
  | PlateSearchResult 
  | PersonSearchResult 
  | PhoneSearchResult 
  | AddressSearchResult;

export interface Tab {
  id: string;
  type: "map" | "vms" | "alert" | "plate-search" | "person-search" | "phone-search" | "address-search";
  title: string;
  data?: TabData;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  badge?: string;
  unit?: string;
}
