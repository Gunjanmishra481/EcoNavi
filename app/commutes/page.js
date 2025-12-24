"use client";

import { useEffect, useMemo, useState } from "react";
import { commuteEmissionFactors, transportFactors } from "../data";

export default function CommutesPage() {
  const [commutes, setCommutes] = useState([]);
  const [form, setForm] = useState({ mode: "bus", distance: 5 });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("en_commutes") || "[]");
    setCommutes(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("en_commutes", JSON.stringify(commutes));
  }, [commutes]);

  const stats = useMemo(() => {
    const weeklySaved = commutes.reduce((s, c) => s + c.savings, 0);
    const weeklyEmissions = commutes.reduce((s, c) => s + c.emission, 0);
    const goalProgress = Math.min(100, Math.round((weeklySaved / 12) * 100));
    const credits = Math.round(weeklySaved * 10);
    return { weeklySaved, weeklyEmissions, goalProgress, credits };
  }, [commutes]);

  function addCommute() {
    const distance = parseFloat(form.distance || "0");
    const factor = commuteEmissionFactors[form.mode] || 0.12;
    const emission = distance * factor;
    const carEmission = distance * 0.21;
    const savings = Math.max(0, carEmission - emission);
    const entry = { mode: form.mode, modeLabel: transportFactors[form.mode]?.label || form.mode, distance, emission, savings };
    setCommutes((prev) => [...prev, entry]);
  }

  return (
    <main className="stack">
      <section className="card">
        <div className="section-title">
          <h2>Commute Tracker</h2>
          <span className="badge green">Weekly</span>
        </div>
        <div className="grid grid-3">
          <div className="stat">
            <div>Weekly emissions</div>
            <strong>{stats.weeklyEmissions.toFixed(2)} kg</strong>
          </div>
          <div className="stat">
            <div>CO₂ saved vs. car</div>
            <strong>+{stats.weeklySaved.toFixed(2)} kg</strong>
          </div>
          <div className="stat">
            <div>Goal progress</div>
            <strong>{stats.goalProgress}%</strong>
          </div>
        </div>
        <div className="progress" style={{ margin: "12px 0" }}>
          <div className="progress-inner" style={{ width: `${stats.goalProgress}%` }} />
        </div>
        <ul className="list">
          {commutes.slice(-8).map((c, i) => (
            <li key={i}>
              <div>
                <strong>{c.modeLabel}</strong>
                <div className="muted small">
                  {c.distance} km • {c.emission.toFixed(2)} kg CO₂e
                </div>
              </div>
              <span className="pill-small">Saved {c.savings.toFixed(2)} kg</span>
            </li>
          ))}
        </ul>
        <div className="grid grid-2" style={{ marginTop: 12 }}>
          <div className="field">
            <label>Mode</label>
            <select className="select" value={form.mode} onChange={(e) => setForm((p) => ({ ...p, mode: e.target.value }))}>
              <option value="bus">Bus</option>
              <option value="metro">Metro</option>
              <option value="bike">Bike</option>
              <option value="walk">Walk</option>
              <option value="rideshare">Ride-share</option>
            </select>
          </div>
          <div className="field">
            <label>Distance (km)</label>
            <input className="input" type="number" min="0" value={form.distance} onChange={(e) => setForm((p) => ({ ...p, distance: e.target.value }))} />
          </div>
        </div>
        <button className="button" style={{ marginTop: 10 }} onClick={addCommute}>
          Add commute
        </button>
      </section>

      <section className="card">
        <div className="section-title">
          <h2>Credits earned from commutes</h2>
          <span className="badge orange">{stats.credits} pts</span>
        </div>
        <p className="muted">Credits auto-calculate from your CO₂ savings (10 pts per kg saved). Use them in the Rewards hub.</p>
      </section>
    </main>
  );
}

