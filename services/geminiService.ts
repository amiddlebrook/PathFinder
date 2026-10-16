import type { Trip, RiskAssessmentData } from "../types";

export interface LiveWeatherData {
  locationName: string;
  daily: { day: string; high_f: number; low_f: number; condition: string }[];
  hourly: { time: string; temp_f: number; condition: string }[];
}
async function request<T>(path: string, location: string): Promise<T> {
  const res = await fetch(`${path}?name=${encodeURIComponent(location.trim())}`);
  const body = await res.json() as T & {error?: string};
  if (!res.ok) throw new Error(body.error || "Service unavailable. Reconnect and retry.");
  return body;
}
export function getCoordinatesForLocation(locationName: string) {
  return request<{lat:number;lng:number}>("/api/geocode",locationName);
}
export function getWeatherForLocation(location: string) {
  return request<LiveWeatherData>("/api/weather",location);
}

/**
 * Planning checklist — not a trail-specific risk score or AI safety assessment.
 * Never invent route difficulty or site conditions without verified trail data.
 */
export async function generateRiskAssessment(trip: Trip): Promise<RiskAssessmentData> {
  const location = await getCoordinatesForLocation(trip.destination);
  const durationDays = Math.max(1, Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime())/86400000)+1);
  const extended = durationDays > 2;
  return {
    location,
    trailDifficulty: {
      rating: "Unverified",
      analysis: "Trail difficulty and elevation are not verified. Check official park information, route distance, elevation gain and trail closures before departure."
    },
    weatherAnalysis: {
      summary: `Planning checklist for ${trip.destination}, ${durationDays} day${durationDays===1?"":"s"}. This is not a weather forecast for your travel dates.`,
      recommendation: "Check a current weather forecast, official alerts and local ranger guidance immediately before leaving. Mountain and desert conditions can change rapidly."
    },
    potentialHazards: [
      {hazard:"Navigation and route changes",mitigation:"Carry a downloaded official map or paper map and compass; share your planned route and turnaround time."},
      {hazard:"Weather exposure",mitigation:"Check warnings and precipitation, wind and temperature. Pack insulated layers, rain protection and sun protection."},
      {hazard:"Dehydration and water",mitigation:"Calculate water needs, confirm reliable refill locations and carry a suitable treatment method."},
      {hazard:"Limited communications",mitigation:"Tell a trusted contact your itinerary; consider a satellite SOS device and know how to summon help."},
      ...(extended?[{hazard:"Multi-day resupply",mitigation:"Plan food, fuel and water for each day plus contingency supplies."}]:[])
    ],
    recommendedGear: ["Paper or legally downloaded offline map","Navigation compass","First-aid kit","Emergency shelter","Extra water and purification","Headlamp and spare power",...(extended?["Additional food and insulation"]:[])]
  };
}
