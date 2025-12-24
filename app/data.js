export const destinations = {
  "Eco Park": { lat: 37.7749, lng: -122.4194 },
  "City Center": { lat: 37.784, lng: -122.409 },
  "University": { lat: 37.8715, lng: -122.273 },
  "River Walk": { lat: 37.768, lng: -122.45 },
  "Transit Hub": { lat: 37.8079, lng: -122.4177 },
  "Innovation Lab": { lat: 37.789, lng: -122.391 }
};

export const transportFactors = {
  bus: { emission: 0.08, farePerKm: 0.18, base: 0.5, label: "Bus" },
  metro: { emission: 0.05, farePerKm: 0.22, base: 0.8, label: "Metro" },
  rideshare: { emission: 0.18, farePerKm: 0.7, base: 1.5, label: "Ride-share" },
  bike: { emission: 0, farePerKm: 0, base: 0, label: "Bike" },
  walk: { emission: 0, farePerKm: 0, base: 0, label: "Walk" }
};

export const emissionTips = [
  { title: "Choose metro for peak commutes", impact: "High", save: 2.4 },
  { title: "Bike first/last mile to stations", impact: "Medium", save: 1.1 },
  { title: "Batch errands into single loop", impact: "Medium", save: 0.8 },
  { title: "Prefer reusable containers", impact: "Low", save: 0.3 },
  { title: "Travel off-peak where possible", impact: "Low", save: 0.4 },
  { title: "Switch to e-receipts for deliveries", impact: "Low", save: 0.2 }
];

export const safetyPoints = [
  { name: "Central Hospital", type: "Hospital", contact: "911 / +1-415-555-0101", lat: 37.773, lng: -122.421 },
  { name: "Mission Police", type: "Police", contact: "911 / +1-415-555-0114", lat: 37.759, lng: -122.414 },
  { name: "Harbor Fire Station", type: "Fire", contact: "911 / +1-415-555-0130", lat: 37.806, lng: -122.403 },
  { name: "Community Help Desk", type: "Help Desk", contact: "+1-415-555-0145", lat: 37.784, lng: -122.416 }
];

export const commuteEmissionFactors = {
  bus: 0.08,
  metro: 0.05,
  bike: 0,
  walk: 0,
  rideshare: 0.18
};

export const shipmentFactors = {
  truck: 0.12,
  train: 0.025,
  ship: 0.015,
  air: 0.6
};

