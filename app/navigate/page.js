"use client";

import { useEffect, useMemo, useState } from "react";
import LiveMap from "../../components/LiveMap";
import { emissionTips } from "../data";

const profiles = [
  { key: "car", label: "Car", icon: "🚗", factor: 0.21, fallbackSpeedKmh: 70 },
  { key: "bike", label: "Bike", icon: "🚲", factor: 0.0, fallbackSpeedKmh: 15 },
  { key: "foot", label: "Walk", icon: "🚶", factor: 0.0, fallbackSpeedKmh: 5 },
];

const NOMINATIM = "https://nominatim.openstreetmap.org/search";

function decodePolyline(str) {
  let index = 0,
    lat = 0,
    lng = 0,
    coordinates = [];

  while (index < str.length) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push([lng / 1e5, lat / 1e5]);
  }

  return coordinates;
}

async function geocode(q) {
  if (!q) return [];
  const url = `${NOMINATIM}?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((r) => ({
    label: r.display_name,
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
  }));
}

async function fetchRoute(profileKey, start, dest) {
  // Use openstreetmap.de OSRM instances with per-mode speeds
  const base = `https://routing.openstreetmap.de/routed-${profileKey}`;
  const url = `${base}/route/v1/${profileKey}/${start.lng},${start.lat};${dest.lng},${dest.lat}?overview=full&geometries=polyline`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Routing failed");
  const json = await res.json();
  const route = json.routes?.[0];
  if (!route) throw new Error("No route");
  return {
    distanceKm: route.distance / 1000,
    durationMin: route.duration / 60,
    geometry: decodePolyline(route.geometry),
  };
}

export default function NavigatePage() {
  const [startInput, setStartInput] = useState("Chennai International Airport");
  const [destInput, setDestInput] = useState("Bengaluru, Karnataka");
  const [start, setStart] = useState({ lat: 12.9903, lng: 80.1709, label: "Chennai International Airport" });
  const [dest, setDest] = useState({ lat: 12.9716, lng: 77.5946, label: "Bengaluru, Karnataka" });
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [activeRoute, setActiveRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (startInput.length > 2) {
        const res = await geocode(startInput);
        setStartSuggestions(res);
      } else {
        setStartSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(delay);
  }, [startInput]);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (destInput.length > 2) {
        const res = await geocode(destInput);
        setDestSuggestions(res);
      } else {
        setDestSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(delay);
  }, [destInput]);

  const summary = useMemo(() => {
    if (!activeRoute) return { distance: 0, saved: 0 };
    const distance = activeRoute.distanceKm;
    const saved = Math.max(0, distance * 0.21 - distance * 0.08);
    return { distance, saved };
  }, [activeRoute]);

  const findRoutes = async () => {
    if (!start || !dest) return;
    setLoading(true);
    setError("");
    try {
      const results = await Promise.all(
        profiles.map(async (p) => {
          try {
            const r = await fetchRoute(p.key, start, dest);
            return { ...p, ...r, emissions: r.distanceKm * p.factor };
          } catch (err) {
            // Fallback: straight-line distance with heuristic speed
            const dx = dest.lng - start.lng;
            const dy = dest.lat - start.lat;
            const approxKm = Math.sqrt(dx * dx + dy * dy) * 111; // rough degrees->km
            const durationMin = (approxKm / p.fallbackSpeedKmh) * 60;
            return { ...p, distanceKm: approxKm, durationMin, geometry: [], emissions: approxKm * p.factor, fallback: true };
          }
        })
      );
      setRoutes(results);
      setActiveRoute(results[0]);
    } catch (err) {
      console.error(err);
      setError("Could not fetch routes. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    findRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="stack">
      <section className="card">
        <div className="section-title">
          <h2>Navigation & Live Routes</h2>
          <span className="badge green">{summary.distance.toFixed(2)} km</span>
        </div>
        <div className="grid grid-2">
          <div className="stack">
            <div className="field suggest">
              <label>Start</label>
              <input className="input" value={startInput} onChange={(e) => setStartInput(e.target.value)} placeholder="Search a place..." />
              {startSuggestions.length > 0 && (
                <div className="suggestions">
                  {startSuggestions.map((s) => (
                    <button
                      key={s.label}
                      className="suggestion"
                      onClick={() => {
                        setStartInput(s.label);
                        setStart({ ...s });
                        setStartSuggestions([]);
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="field suggest">
              <label>Destination</label>
              <input className="input" value={destInput} onChange={(e) => setDestInput(e.target.value)} placeholder="Search a place..." />
              {destSuggestions.length > 0 && (
                <div className="suggestions">
                  {destSuggestions.map((s) => (
                    <button
                      key={s.label}
                      className="suggestion"
                      onClick={() => {
                        setDestInput(s.label);
                        setDest({ ...s });
                        setDestSuggestions([]);
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="row gap">
              <button className="button" onClick={findRoutes} disabled={loading}>
                {loading ? "Fetching routes..." : "Update routes"}
              </button>
              <div className="pill">Live map & autocomplete powered by OSM/OSRM</div>
            </div>
            {error && <div className="pill-small" style={{ color: "#b91c1c" }}>{error}</div>}
            <div className="stat-row">
              <div className="stat">
                <div>CO₂ saved vs car</div>
                <strong>+{summary.saved.toFixed(2)} kg</strong>
              </div>
              <div className="stat">
                <div>Distance</div>
                <strong>{summary.distance.toFixed(2)} km</strong>
              </div>
            </div>
          </div>
          <div className="map-shell">
            <LiveMap start={{ ...start, label: startInput }} dest={{ ...dest, label: destInput }} routeCoords={activeRoute?.geometry || []} />
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-title">
          <h2>Commute options</h2>
          <span className="badge blue">ETA & emissions</span>
        </div>
        <div className="options-row">
          {routes.map((r) => {
            const eta = Math.round(r.durationMin);
            return (
              <button key={r.key} className={`option-tile ${activeRoute?.key === r.key ? "active" : ""}`} onClick={() => setActiveRoute(r)}>
                <div className="row between">
                  <div className="row gap">
                    <span className="option-icon">{r.icon}</span>
                    <div>
                      <div className="option-label">{r.label}</div>
                      <div className="muted small">{r.distanceKm.toFixed(1)} km</div>
                    </div>
                  </div>
                  <div className="badge subtle">{eta} min</div>
                </div>
                <div className="muted small">Emissions: {r.emissions.toFixed(2)} kg CO₂e</div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="card">
        <div className="section-title">
          <h2>Emission Reduction Tips</h2>
          <span className="badge green">Impact</span>
        </div>
        <div className="tips">
          {emissionTips.map((t) => (
            <div key={t.title} className="tip">
              <div className="row between">
                <strong>{t.title}</strong>
                <span className={`badge ${t.impact === "High" ? "red" : t.impact === "Medium" ? "orange" : "blue"}`}>{t.impact}</span>
              </div>
              <div className="pill-small">~{t.save} kg CO₂ saved</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

