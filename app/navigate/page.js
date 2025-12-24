"use client";

import { useMemo, useState } from "react";
import LiveMap from "../../components/LiveMap";
import { destinations, transportFactors, emissionTips } from "../data";

function haversine(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export default function NavigatePage() {
  const [start, setStart] = useState("Transit Hub");
  const [destination, setDestination] = useState("Eco Park");
  const startPoint = destinations[start] || destinations["Transit Hub"];
  const destPoint = destinations[destination] || destinations["Eco Park"];

  const route = useMemo(() => {
    const distance = haversine(startPoint, destPoint);
    const saved = Math.max(0, distance * 0.21 - distance * 0.08);
    return {
      distance: distance.toFixed(2),
      saved: saved.toFixed(2),
    };
  }, [startPoint, destPoint]);

  const fareCards = useMemo(() => {
    const distance = parseFloat(route.distance || "0");
    const fares = Object.entries(transportFactors).map(([key, v]) => {
      const fare = v.base + distance * v.farePerKm;
      const emission = distance * v.emission;
      return { ...v, key, fare: fare.toFixed(2), emission: emission.toFixed(2) };
    });
    return fares.sort((a, b) => parseFloat(a.fare) - parseFloat(b.fare));
  }, [route.distance]);

  return (
    <main className="stack">
      <section className="card">
        <div className="section-title">
          <h2>Navigation & Optimized Routes</h2>
          <span className="badge green">{route.distance} km</span>
        </div>
        <div className="grid grid-2">
          <div className="stack">
            <div className="field">
              <label>Start</label>
              <input className="input" value={start} onChange={(e) => setStart(e.target.value)} placeholder="e.g., Current location" />
            </div>
            <div className="field">
              <label>Destination</label>
              <input className="input" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g., Eco Park" />
            </div>
            <div className="chips">
              {Object.keys(destinations).map((d) => (
                <div key={d} className={`chip ${d === destination ? "active" : ""}`} onClick={() => setDestination(d)}>
                  {d}
                </div>
              ))}
            </div>
            <p className="muted">Real-time map below uses OpenStreetMap tiles with live pan/zoom.</p>
          </div>
          <div className="map-shell">
            <LiveMap start={{ ...startPoint, label: start }} dest={{ ...destPoint, label: destination }} />
          </div>
        </div>
        <div className="stat-row">
          <div className="stat">
            <div>CO₂ saved vs. car</div>
            <strong>{route.saved} kg</strong>
          </div>
          <div className="stat">
            <div>Distance</div>
            <strong>{route.distance} km</strong>
          </div>
        </div>
      </section>

      <section className="grid grid-2">
        <div className="card">
          <div className="section-title">
            <h2>Transport Fare Comparison</h2>
            <span className="badge blue">Live calc</span>
          </div>
          <div className="fare-grid">
            {fareCards.map((f, idx) => (
              <div key={f.key} className="fare-card">
                <div className="row between">
                  <strong>{f.label}</strong>
                  {idx === 0 && <span className="badge green">Cheapest</span>}
                </div>
                <div className="muted">${f.fare}</div>
                <div className="pill-small">{f.emission} kg CO₂e</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
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
        </div>
      </section>
    </main>
  );
}

