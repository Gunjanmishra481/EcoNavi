"use client";

import { useState } from "react";
import LiveMap from "../../components/LiveMap";
import { safetyPoints, destinations } from "../data";

export default function SafetyPage() {
  const [note, setNote] = useState("");
  const start = { ...destinations["Transit Hub"], label: "Transit Hub" };
  const dest = { ...destinations["City Center"], label: "City Center" };

  return (
    <main className="stack">
      <section className="card">
        <div className="section-title">
          <h2>Safety Points & Emergency Assistance</h2>
          <span className="badge red">Live map</span>
        </div>
        <div className="map-shell">
          <LiveMap start={start} dest={dest} safetyPoints={safetyPoints} />
        </div>
        <div className="row gap" style={{ marginTop: 12 }}>
          <button className="button" onClick={() => setNote("Safety points highlighted. Tap markers for contacts.")}>
            Show on map
          </button>
          <button
            className="button ghost danger-outline"
            onClick={() => {
              setNote("SOS triggered. Sharing approximate coordinates and contacting closest help.");
              alert("SOS sent to emergency services. Stay calm and follow instructions.");
            }}
          >
            SOS now
          </button>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>
          {note}
        </p>
      </section>

      <section className="card">
        <div className="section-title">
          <h2>Nearby safety points</h2>
          <span className="badge blue">List</span>
        </div>
        <div className="safety-grid">
          {safetyPoints.map((pt) => (
            <div key={pt.name} className="safety-card">
              <div className="row between">
                <strong>{pt.name}</strong>
                <span className="badge subtle">{pt.type}</span>
              </div>
              <div className="muted" style={{ marginTop: 6 }}>
                {pt.contact}
              </div>
              <div className="muted small">Lat {pt.lat.toFixed(3)}, Lng {pt.lng.toFixed(3)}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

