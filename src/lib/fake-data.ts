// Deterministic random based on seed string
function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = ["JAMES", "JOHN", "ROBERT", "MICHAEL", "WILLIAM", "DAVID", "RICHARD", "JOSEPH", "THOMAS", "CHARLES", "MARY", "PATRICIA", "JENNIFER", "LINDA", "ELIZABETH", "BARBARA", "SUSAN", "JESSICA", "SARAH", "KAREN"];
const LAST_NAMES = ["SMITH", "JOHNSON", "WILLIAMS", "BROWN", "JONES", "GARCIA", "MILLER", "DAVIS", "RODRIGUEZ", "MARTINEZ", "HERNANDEZ", "LOPEZ", "GONZALEZ", "WILSON", "ANDERSON", "THOMAS", "TAYLOR", "MOORE", "JACKSON", "MARTIN"];
const STREETS = ["Main St", "Oak Ave", "Maple Dr", "Cedar Ln", "Pine Rd", "Elm St", "Washington Blvd", "Park Ave", "Lake Dr", "Hill Rd", "Valley Way", "River Rd", "Forest Dr", "Sunset Blvd", "Highland Ave"];
const CITIES = ["Phoenix", "Mesa", "Chandler", "Scottsdale", "Tempe", "Gilbert", "Glendale", "Peoria"];
const MAKES = ["Honda", "Toyota", "Ford", "Chevrolet", "Nissan", "Dodge", "BMW", "Mercedes", "Kia", "Hyundai"];
const MODELS: Record<string, string[]> = {
  Honda: ["Civic", "Accord", "CR-V", "Pilot"],
  Toyota: ["Camry", "Corolla", "RAV4", "Tacoma"],
  Ford: ["F-150", "Mustang", "Explorer", "Escape"],
  Chevrolet: ["Silverado", "Malibu", "Equinox", "Tahoe"],
  Nissan: ["Altima", "Sentra", "Rogue", "Frontier"],
  Dodge: ["Charger", "Challenger", "Ram", "Durango"],
  BMW: ["3 Series", "5 Series", "X3", "X5"],
  Mercedes: ["C-Class", "E-Class", "GLC", "GLE"],
  Kia: ["Optima", "Sorento", "Sportage", "Soul"],
  Hyundai: ["Elantra", "Sonata", "Tucson", "Santa Fe"],
};
const COLORS = ["Black", "White", "Silver", "Gray", "Red", "Blue", "Green", "Brown", "Tan"];
const WARRANT_TYPES = ["Felony Warrant", "Misdemeanor Warrant", "Bench Warrant", "Failure to Appear"];
const FLAGS = ["Gang Member", "Armed & Dangerous", "Mental Health", "Prior Violence", "Felony History", "Drug History", "DV History"];

// Generate person with specific name (for voice search)
export function generatePersonWithName(seed: string, firstName: string, lastName: string) {
  const rand = seededRandom(seed);
  const street = STREETS[Math.floor(rand() * STREETS.length)];
  const city = CITIES[Math.floor(rand() * CITIES.length)];
  const hasWarrant = rand() < 0.15;
  const numFlags = rand() < 0.3 ? Math.floor(rand() * 3) + 1 : 0;

  const warrants = hasWarrant ? [{
    type: WARRANT_TYPES[Math.floor(rand() * WARRANT_TYPES.length)],
    description: "Outstanding warrant for arrest",
    date: `${String(Math.floor(rand() * 12) + 1).padStart(2, "0")}/${String(Math.floor(rand() * 28) + 1).padStart(2, "0")}/2024`,
  }] : [];

  const flags: string[] = [];
  for (let i = 0; i < numFlags; i++) {
    const flag = FLAGS[Math.floor(rand() * FLAGS.length)];
    if (!flags.includes(flag)) flags.push(flag);
  }

  return {
    id: `person-${seed}`,
    firstName: firstName.toUpperCase(),
    lastName: lastName.toUpperCase(),
    dob: `${String(Math.floor(rand() * 12) + 1).padStart(2, "0")}/${String(Math.floor(rand() * 28) + 1).padStart(2, "0")}/${1960 + Math.floor(rand() * 45)}`,
    dlNumber: `D${String(Math.floor(rand() * 90000000) + 10000000)}`,
    dlState: "AZ",
    address: `${Math.floor(rand() * 9000) + 1000} ${street}, ${city}, AZ ${85000 + Math.floor(rand() * 999)}`,
    ncicStatus: {
      warrants,
      alerts: rand() < 0.1 ? ["Person of Interest - Case #2024-" + Math.floor(rand() * 9999)] : [],
    },
    flags,
    aiSummary: `${firstName.toUpperCase()} ${lastName.toUpperCase()} has ${warrants.length > 0 ? "active warrants" : "no active warrants"}. ${flags.length > 0 ? `Flagged: ${flags.join(", ")}.` : "No flags on file."}`,
  };
}

export function generatePerson(seed: string) {
  const rand = seededRandom(seed);
  const firstName = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
  return generatePersonWithName(seed, firstName, lastName);
}

export function generateVehicle(plate: string) {
  const rand = seededRandom(plate);
  const make = MAKES[Math.floor(rand() * MAKES.length)];
  const model = MODELS[make][Math.floor(rand() * MODELS[make].length)];
  const color = COLORS[Math.floor(rand() * COLORS.length)];
  const year = 2015 + Math.floor(rand() * 10);
  const isStolen = rand() < 0.1;
  const owner = generatePerson(plate + "-owner");

  return {
    vehicle: {
      id: `veh-${plate}`,
      plate: plate.toUpperCase(),
      state: "AZ",
      make,
      model,
      year,
      color,
      vin: `1HD1${plate.toUpperCase().padEnd(13, "X")}`.slice(0, 17),
      ownerId: owner.id,
      ncicStatus: {
        stolen: isStolen,
        stolenDate: isStolen ? "01/15/2025" : undefined,
        caseNumber: isStolen ? `2025-${Math.floor(rand() * 99999)}` : undefined,
        wanted: false,
      },
      flags: isStolen ? ["STOLEN VEHICLE"] : [],
    },
    owner,
  };
}

export function generateLprHistory(plate: string, count = 5) {
  const rand = seededRandom(plate + "-lpr");
  const reads = [];
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    const hoursAgo = Math.floor(rand() * 720); // Up to 30 days
    reads.push({
      id: `lpr-${plate}-${i}`,
      plate: plate.toUpperCase(),
      cameraId: `CAM-${Math.floor(rand() * 999)}`,
      cameraName: `${STREETS[Math.floor(rand() * STREETS.length)]} & ${STREETS[Math.floor(rand() * STREETS.length)]}`,
      locationLat: 33.4 + rand() * 0.2,
      locationLng: -112.0 + rand() * 0.3,
      timestamp: new Date(now - hoursAgo * 3600000).toISOString(),
      imageUrl: "",
    });
  }
  
  return reads.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function generatePhoneResult(phone: string) {
  const rand = seededRandom(phone);
  const person = generatePerson(phone);
  
  return {
    phone: phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3"),
    carrier: ["Verizon", "AT&T", "T-Mobile", "Sprint"][Math.floor(rand() * 4)],
    lineType: rand() < 0.7 ? "Mobile" : "Landline",
    registeredName: `${person.firstName} ${person.lastName}`,
    registeredAddress: person.address,
    accountStatus: "Active",
    accountAge: `${Math.floor(rand() * 10) + 1} years`,
    associatedPersons: [
      { name: `${person.firstName} ${person.lastName}`, relationship: "Primary", dob: person.dob },
    ],
    callHistory: [
      { date: "Today 14:32", type: "911", duration: "2:15", otherNumber: "911" },
      { date: "03/01 09:15", type: "Outgoing", duration: "5:42", otherNumber: "(480) 555-0199" },
    ],
    priorIncidents: rand() < 0.3 ? [
      { date: "01/15/2025", type: "Welfare Check", caseNumber: `2025-${Math.floor(rand() * 99999)}` },
    ] : [],
    aiSummary: `Phone registered to ${person.firstName} ${person.lastName}. ${rand() < 0.3 ? "Prior 911 calls from this number." : "No significant history."}`,
  };
}

export function generateAddressResult(address: string) {
  const rand = seededRandom(address);
  const residents = [generatePerson(address + "-1")];
  if (rand() < 0.6) residents.push(generatePerson(address + "-2"));
  if (rand() < 0.3) residents.push(generatePerson(address + "-3"));
  
  const vehicles = residents.slice(0, 2).map((r, i) => {
    const v = generateVehicle(address + `-veh-${i}`);
    return { plate: v.vehicle.plate, make: v.vehicle.make, model: v.vehicle.model, year: v.vehicle.year, color: v.vehicle.color };
  });

  const callCount = Math.floor(rand() * 15);
  const hasOfficerSafety = rand() < 0.2;

  return {
    address: address,
    normalizedAddress: address.toUpperCase(),
    propertyType: rand() < 0.7 ? "Single Family Residence" : "Apartment",
    propertyOwner: `${residents[0].firstName} ${residents[0].lastName}`,
    yearBuilt: 1970 + Math.floor(rand() * 50),
    sqft: 1200 + Math.floor(rand() * 2000),
    bedrooms: 2 + Math.floor(rand() * 4),
    bathrooms: 1 + Math.floor(rand() * 3),
    assessedValue: `$${(200000 + Math.floor(rand() * 400000)).toLocaleString()}`,
    residents: residents.map(r => ({
      name: `${r.firstName} ${r.lastName}`,
      relationship: r === residents[0] ? "Owner" : "Resident",
      dob: r.dob,
      hasWarrants: r.ncicStatus.warrants.length > 0,
      warrantType: r.ncicStatus.warrants[0]?.type,
    })),
    registeredVehicles: vehicles,
    priorCalls: Array.from({ length: Math.min(callCount, 5) }, (_, i) => ({
      date: `${String(Math.floor(rand() * 12) + 1).padStart(2, "0")}/${String(Math.floor(rand() * 28) + 1).padStart(2, "0")}/2024`,
      type: ["Domestic", "Noise", "Welfare", "Suspicious", "Alarm"][Math.floor(rand() * 5)],
      disposition: ["Report Taken", "Gone on Arrival", "Civil Matter", "Arrest"][Math.floor(rand() * 4)],
      caseNumber: `2024-${Math.floor(rand() * 99999)}`,
    })),
    totalCallsLast2Years: callCount,
    officerSafetyAlerts: hasOfficerSafety ? ["Weapons on premises", "History of violence toward officers"] : [],
    aiSummary: `${callCount} calls in past 2 years. ${hasOfficerSafety ? "⚠️ OFFICER SAFETY ALERTS ON FILE." : "No officer safety concerns."}`,
  };
}

const CAD_TYPES = [
  { code: "459", title: "Burglary in Progress", priority: 1 },
  { code: "211", title: "Robbery", priority: 0 },
  { code: "415", title: "Disturbance", priority: 2 },
  { code: "10-16", title: "Domestic Violence", priority: 1 },
  { code: "10-50", title: "Traffic Collision", priority: 2 },
  { code: "10-52", title: "Ambulance Needed", priority: 1 },
  { code: "245", title: "Assault with Deadly Weapon", priority: 0 },
  { code: "207", title: "Kidnapping", priority: 0 },
  { code: "10-31", title: "Crime in Progress", priority: 1 },
  { code: "904", title: "Fire", priority: 1 },
];

export function generateAlert(id: string, type?: string) {
  const rand = seededRandom(id);
  const alertType = type || ["CAD", "LPR", "AUDIO"][Math.floor(rand() * 3)];
  const street = STREETS[Math.floor(rand() * STREETS.length)];
  const city = CITIES[Math.floor(rand() * CITIES.length)];
  const address = `${Math.floor(rand() * 9000) + 1000} ${street}, ${city}, AZ`;

  if (alertType === "CAD") {
    const cadType = CAD_TYPES[Math.floor(rand() * CAD_TYPES.length)];
    return {
      id,
      type: "CAD",
      priority: cadType.priority,
      title: `${cadType.code} - ${cadType.title}`,
      summary: `Responding to ${cadType.title.toLowerCase()} at ${address}`,
      locationLat: 33.4 + rand() * 0.2,
      locationLng: -112.0 + rand() * 0.3,
      locationAddr: address,
      rawData: {
        callNumber: `CAD-${Math.floor(rand() * 999999)}`,
        callType: cadType.code,
        callerPhone: `480${Math.floor(rand() * 9000000) + 1000000}`,
        callerName: rand() < 0.5 ? "Anonymous" : `${FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)]}`,
        narrative: `Caller reports ${cadType.title.toLowerCase()}. ${rand() < 0.3 ? "Suspect is still on scene." : "Unknown if suspect still on scene."}`,
        unitsAssigned: [`${Math.floor(rand() * 9) + 1}A${Math.floor(rand() * 99) + 1}`],
      },
      aiSummary: `High priority ${cadType.title.toLowerCase()} call. ${rand() < 0.3 ? "Exercise caution - possible weapons involved." : "Standard response protocol."}`,
      status: "active",
      createdAt: new Date().toISOString(),
    };
  }

  if (alertType === "LPR") {
    const plate = `${String.fromCharCode(65 + Math.floor(rand() * 26))}${String.fromCharCode(65 + Math.floor(rand() * 26))}${String.fromCharCode(65 + Math.floor(rand() * 26))}${Math.floor(rand() * 9000) + 1000}`;
    const isStolen = rand() < 0.4;
    const isWanted = !isStolen && rand() < 0.3;
    
    return {
      id,
      type: "LPR",
      priority: isStolen ? 1 : 2,
      title: isStolen ? `STOLEN VEHICLE - ${plate}` : isWanted ? `WANTED VEHICLE - ${plate}` : `LPR HIT - ${plate}`,
      summary: `License plate reader hit on ${plate}`,
      locationLat: 33.4 + rand() * 0.2,
      locationLng: -112.0 + rand() * 0.3,
      locationAddr: address,
      rawData: {
        plate,
        camera: `LPR-${Math.floor(rand() * 999)}`,
        confidence: 95 + Math.floor(rand() * 5),
        direction: ["Northbound", "Southbound", "Eastbound", "Westbound"][Math.floor(rand() * 4)],
        hotlistReason: isStolen ? "Stolen Vehicle" : isWanted ? "Wanted - Felony" : "BOLO",
      },
      aiSummary: isStolen ? "⚠️ STOLEN VEHICLE - Approach with caution" : "Vehicle flagged in system",
      status: "active",
      createdAt: new Date().toISOString(),
    };
  }

  // AUDIO (gunshot, etc)
  const subtype = ["GUNSHOT", "DISTRESS", "CRASH"][Math.floor(rand() * 3)];
  return {
    id,
    type: "AUDIO",
    priority: subtype === "GUNSHOT" ? 0 : 2,
    title: `Audio Alert - ${subtype}`,
    summary: `${subtype} detected at ${address}`,
    locationLat: 33.4 + rand() * 0.2,
    locationLng: -112.0 + rand() * 0.3,
    locationAddr: address,
    rawData: {
      subtype,
      confidence: 85 + Math.floor(rand() * 15),
      sensorId: `AUDIO-${Math.floor(rand() * 999)}`,
      timestamp: new Date().toISOString(),
    },
    aiSummary: subtype === "GUNSHOT" ? "⚠️ Possible gunfire detected. Multiple sensors confirm." : `${subtype} audio pattern detected.`,
    status: "active",
    createdAt: new Date().toISOString(),
  };
}
