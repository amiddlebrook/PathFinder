type Assets = { fetch(request: Request): Promise<Response> };
interface Env { ASSETS: Assets }
interface Context { waitUntil(task: Promise<unknown>): void }

const json = (body: unknown, status = 200, ttl = 0): Response => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": ttl ? `public, max-age=${ttl}` : "no-store",
    "x-content-type-options": "nosniff",
  }
});

const places: Record<string, [number, number, string]> = {
  "yosemite": [37.7456, -119.5936, "Yosemite National Park"],
  "yellowstone": [44.4280, -110.5885, "Yellowstone National Park"],
  "zion": [37.2982, -113.0263, "Zion National Park"],
  "grand canyon": [36.1069, -112.1129, "Grand Canyon National Park"],
  "rocky mountain": [40.3428, -105.6836, "Rocky Mountain National Park"],
  "glacier national park": [48.6960, -113.7180, "Glacier National Park"],
  "olympic national park": [47.8021, -123.6044, "Olympic National Park"],
  "mount rainier": [46.8800, -121.7269, "Mount Rainier National Park"],
  "acadia": [44.3386, -68.2733, "Acadia National Park"],
  "arches national park": [38.7331, -109.5925, "Arches National Park"]
};
function knownPlace(query: string) {
  const q = query.toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
  const key = Object.keys(places).find(p => q === p || q.startsWith(p + " ") || (p.length > 8 && q.includes(p)));
  if (!key) return null;
  const [lat, lng, name] = places[key];
  return {lat, lng, name};
}

async function coordinates(query: string): Promise<{lat: number; lng: number; name: string}> {
  const known = knownPlace(query);
  if (known) return known;
  const url = "https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(query) + "&count=1&language=en&format=json";
  const upstream = await fetch(url, {headers: {"accept": "application/json"}});
  if (!upstream.ok) throw new Error("Geocoding service unavailable");
  const data = await upstream.json() as { results?: {latitude: number; longitude: number; name: string; admin1?: string; country?: string}[] };
  const r = data.results?.[0];
  if (!r || !Number.isFinite(r.latitude) || !Number.isFinite(r.longitude)) throw new Error("Location not found. Try a nearby city or a well-known national park.");
  return {lat:r.latitude, lng:r.longitude, name: [r.name,r.admin1,r.country].filter(Boolean).join(", ")};
}
function condition(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Cloudy";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 95) return "Thunderstorms";
  return "Variable";
}
async function forecast(place: {lat:number;lng:number;name:string}) {
  const q = new URLSearchParams({
    latitude: String(place.lat), longitude: String(place.lng),
    daily: "temperature_2m_max,temperature_2m_min,weather_code",
    hourly: "temperature_2m,weather_code",
    temperature_unit:"fahrenheit", timezone:"auto", forecast_days:"7", forecast_hours:"8"
  });
  const upstream = await fetch("https://api.open-meteo.com/v1/forecast?"+q.toString(), {headers: {"accept": "application/json"}});
  if (!upstream.ok) throw new Error("Forecast temporarily unavailable");
  const data = await upstream.json() as {
    daily?: {time:string[];temperature_2m_max:number[];temperature_2m_min:number[];weather_code:number[]};
    hourly?: {time:string[];temperature_2m:number[];weather_code:number[]};
  };
  if (!data.daily?.time || !data.hourly?.time) throw new Error("Incomplete weather response");
  return {
    locationName: place.name,
    daily: data.daily.time.map((date,i)=>({
      day: new Intl.DateTimeFormat("en-US",{weekday:"short", timeZone:"UTC"}).format(new Date(date+"T12:00:00Z")),
      high_f:Math.round(data.daily!.temperature_2m_max[i]),
      low_f:Math.round(data.daily!.temperature_2m_min[i]),
      condition:condition(data.daily!.weather_code[i])
    })),
    hourly: data.hourly.time.slice(0,8).map((time,i)=>({
      time: new Date(time+"Z").toLocaleTimeString("en-US",{hour:"numeric",hour12:true,timeZone:"UTC"}),
      temp_f:Math.round(data.hourly!.temperature_2m[i]),
      condition:condition(data.hourly!.weather_code[i])
    }))
  };
}
async function api(request: Request): Promise<Response> {
  if (request.method !== "GET") return json({error:"Method not allowed"},405);
  const url = new URL(request.url);
  const name = (url.searchParams.get("name") || "").trim();
  if (name.length < 2 || name.length > 120) return json({error:"Enter a location between 2 and 120 characters."},400);
  try {
    const place = await coordinates(name);
    if (url.pathname === "/api/geocode") return json(place,200,86400);
    if (url.pathname === "/api/weather") return json(await forecast(place),200,900);
    return json({error:"Not found"},404);
  } catch (err) {
    return json({error:err instanceof Error?err.message:"Service unavailable"},502);
  }
}
export default {
  async fetch(request: Request, env: Env, ctx: Context): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (!path.startsWith("/api/")) return env.ASSETS.fetch(request);
    if (!["/api/weather","/api/geocode"].includes(path)) return json({error:"Not found"},404);
    const cache = (caches as CacheStorage & {default: Cache}).default;
    if (request.method === "GET") {
      const hit = await cache.match(request);
      if (hit) return hit;
    }
    const response = await api(request);
    if (response.ok) ctx.waitUntil(cache.put(request, response.clone()));
    return response;
  }
};
