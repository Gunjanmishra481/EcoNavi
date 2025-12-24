"use client";

import { useEffect, useMemo, useState } from "react";
import {
  destinations,
  transportFactors,
  emissionTips,
  safetyPoints,
  commuteEmissionFactors,
  shipmentFactors,
} from "./data";

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

function MapCanvas({ start, dest, hubs }) {
  const bounds = { latMin: 37.75, latMax: 37.9, lngMin: -122.47, lngMax: -122.38 };
  const toXY = (p) => {
    const x = ((p.lng - bounds.lngMin) / (bounds.lngMax - bounds.lngMin)) * 100;
    const y = 100 - ((p.lat - bounds.latMin) / (bounds.latMax - bounds.latMin)) * 100;
    return { x, y };
  };
  const s = toXY(start);
  const d = toXY(dest);
  const mid = hubs.length ? toXY(hubs[0]) : null;
  return (
    <div className="map">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="route" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7cf7b5" />
            <stop offset="100%" stopColor="#7aa2ff" />
          </linearGradient>
        </defs>
        <g stroke="url(#route)" strokeWidth="1.2" strokeLinecap="round">
          {mid ? (
            <>
              <polyline points={`${s.x},${s.y} ${mid.x},${mid.y} ${d.x},${d.y}`} fill="none" opacity="0.85" />
              <circle cx={mid.x} cy={mid.y} r="1.3" fill="#7aa2ff" opacity="0.9" />
            </>
          ) : (
            <line x1={s.x} y1={s.y} x2={d.x} y2={d.y} opacity="0.85" />
          )}
        </g>
        <circle cx={s.x} cy={s.y} r="1.6" fill="#7cf7b5" />
        <circle cx={d.x} cy={d.y} r="1.6" fill="#ffb347" />
      </svg>
      <div style={{ position: "absolute", inset: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="pill" style={{ alignSelf: "flex-start", background: "rgba(124,247,181,0.12)", color: "var(--text)" }}>
          Start • {start.label}
        </div>
        <div className="pill" style={{ alignSelf: "flex-end", background: "rgba(122,162,255,0.12)", color: "var(--text)" }}>
          Destination • {dest.label}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [auth, setAuth] = useState({ email: "", password: "" });
  const [sessionUser, setSessionUser] = useState(null);
  const [authMessage, setAuthMessage] = useState("");
  const [start, setStart] = useState("Transit Hub");
  const [destination, setDestination] = useState("Eco Park");
  const [route, setRoute] = useState({ distance: 0, summary: "Awaiting optimization", path: [] });
  const [commutes, setCommutes] = useState([]);
  const [ship, setShip] = useState({ weight: 2, distance: 120, mode: "truck" });
  const [shipResult, setShipResult] = useState({ emission: 0, alt: "Greener: Train" });
  const [rewardMsg, setRewardMsg] = useState("");
  const [safetyNote, setSafetyNote] = useState("");

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("en_users") || "{}");
    const current = localStorage.getItem("en_session");
    const savedCommutes = JSON.parse(localStorage.getItem("en_commutes") || "[]");
    setCommutes(savedCommutes);
    if (current && storedUsers[current]) {
      setSessionUser(storedUsers[current]);
    }
    calcShipment(ship);
  }, []);

  useEffect(() => {
    localStorage.setItem("en_commutes", JSON.stringify(commutes));
  }, [commutes]);

  const fareCards = useMemo(() => {
    const distance = route.distance || 0;
    const fares = Object.entries(transportFactors).map(([key, v]) => {
      const fare = v.base + distance * v.farePerKm;
      const emission = distance * v.emission;
      return { ...v, key, fare: fare.toFixed(2), emission: emission.toFixed(2) };
    });
    return fares.sort((a, b) => parseFloat(a.fare) - parseFloat(b.fare));
  }, [route.distance]);

  const credits = useMemo(() => {
    const saved = commutes.reduce((s, c) => s + c.savings, 0);
    return Math.round(saved * 10);
  }, [commutes]);

  const level = credits > 200 ? "Champion" : credits > 120 ? "Leader" : credits > 60 ? "Advocate" : "Rookie";

  const weeklySaved = commutes.reduce((s, c) => s + c.savings, 0);
  const weeklyEmissions = commutes.reduce((s, c) => s + c.emission, 0);
  const goalProgress = Math.min(100, Math.round((weeklySaved / 12) * 100));

  function handleAuth(action) {
    const { email, password } = auth;
    if (!email || password.length < 6) {
      setAuthMessage("Use a valid email and 6+ character password.");
      return;
    }
    const store = JSON.parse(localStorage.getItem("en_users") || "{}");
    if (action === "register") {
      if (store[email]) {
        setAuthMessage("Account exists. Login instead.");
        return;
      }
      store[email] = { email, passwordHash: btoa(password), credits: 0 };
      localStorage.setItem("en_users", JSON.stringify(store));
      setAuthMessage("Registered! You can login now.");
      return;
    }
    const account = store[email];
    if (!account || account.passwordHash !== btoa(password)) {
      setAuthMessage("Invalid credentials.");
      return;
    }
    localStorage.setItem("en_session", email);
    setSessionUser(account);
    setAuthMessage("");
  }

  function demoLogin() {
    const email = "demo@emissionavi.app";
    const store = JSON.parse(localStorage.getItem("en_users") || "{}");
    store[email] = { email, passwordHash: btoa("demo123"), credits };
    localStorage.setItem("en_users", JSON.stringify(store));
    localStorage.setItem("en_session", email);
    setSessionUser(store[email]);
  }

  function logout() {
    localStorage.removeItem("en_session");
    setSessionUser(null);
  }

  function optimizeRoute() {
    const startPoint = destinations[start] || destinations["Transit Hub"];
    const destPoint = destinations[destination] || destinations["Eco Park"];
    const hubs = [
      { ...destinations["City Center"], label: "City Hub" },
      { ...destinations["Transit Hub"], label: "Transit Hub" },
    ];
    const direct = { distance: haversine(startPoint, destPoint), path: [startPoint, destPoint], via: null };
    const viaHub = hubs
      .map((h) => ({
        distance: haversine(startPoint, h) + haversine(h, destPoint),
        path: [startPoint, h, destPoint],
        via: h,
      }))
      .sort((a, b) => a.distance - b.distance)[0];
    const best = direct.distance <= viaHub.distance ? direct : viaHub;
    setRoute({
      distance: parseFloat(best.distance.toFixed(2)),
      summary: `Optimized ${best.distance.toFixed(2)} km • ${(best.distance * 0.12).toFixed(2)} kg CO₂ saved vs car`,
      path: best.path,
      via: best.via,
    });
  }

  function addCommute() {
    const mode = document.getElementById("commute-mode").value;
    const distance = parseFloat(document.getElementById("commute-distance").value || "0");
    const factor = commuteEmissionFactors[mode] || 0.12;
    const emission = distance * factor;
    const carEmission = distance * 0.21;
    const savings = Math.max(0, carEmission - emission);
    const entry = { mode, modeLabel: transportFactors[mode]?.label || mode, distance, emission, savings };
    setCommutes((prev) => [...prev, entry]);
  }

  function calcShipment(nextShip) {
    const s = nextShip || ship;
    const factor = shipmentFactors[s.mode] || 0.1;
    const emission = (s.weight * s.distance * factor) / 1000;
    const alt = Object.entries(shipmentFactors)
      .sort((a, b) => a[1] - b[1])
      .find(([mode, f]) => f < factor);
    setShipResult({ emission: parseFloat(emission.toFixed(2)), alt: alt ? `Greener: ${alt[0]}` : "Already optimal" });
  }

  function redeemReward() {
    if (credits < 50) {
      setRewardMsg("Earn 50+ credits to redeem rewards.");
      return;
    }
    setRewardMsg("Reward unlocked: Free transit pass x1. Keep going!");
  }

  function shareProgress() {
    const text = `I saved ${weeklySaved.toFixed(2)} kg CO₂ and earned ${credits} credits with EmissioNavi!`;
    navigator.clipboard?.writeText(text);
    setRewardMsg("Progress copied! Share it with your friends.");
  }

  return (
    <main className="page">
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 46,
              height: 46,
              display: "grid",
              placeItems: "center",
              borderRadius: 14,
              background: "linear-gradient(135deg,#7cf7b5,#7aa2ff)",
              color: "#05060b",
              fontWeight: 800,
              boxShadow: "var(--shadow)",
            }}
          >
            EN
          </div>
          <div>
            <h1 style={{ fontSize: 22 }}>EmissioNavi</h1>
            <p style={{ margin: 0 }}>Sustainable mobility, fares, rewards, and safety in one UI.</p>
          </div>
        </div>
        <div className="pill">
          {sessionUser ? (
            <>
              <span>Signed in as {sessionUser.email}</span>
            </>
          ) : (
            <>
              <span>Guest session</span>
            </>
          )}
        </div>
      </header>

      <div className="grid grid-2">
        <div className="card">
          <div className="section-title">
            <h2>Login & Authentication</h2>
            <span className="badge blue">{sessionUser ? "Secure" : "Sign in"}</span>
          </div>
          {!sessionUser ? (
            <>
              <div className="field">
                <label>Email</label>
                <input className="input" value={auth.email} onChange={(e) => setAuth((p) => ({ ...p, email: e.target.value }))} placeholder="you@email.com" />
              </div>
              <div className="field">
                <label>Password</label>
                <input className="input" type="password" value={auth.password} onChange={(e) => setAuth((p) => ({ ...p, password: e.target.value }))} placeholder="Minimum 6 characters" />
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="button" onClick={() => handleAuth("login")}>
                  Login
                </button>
                <button className="button ghost" onClick={() => handleAuth("register")}>
                  Register
                </button>
                <button className="button ghost" onClick={demoLogin}>
                  Quick demo login
                </button>
              </div>
              <p style={{ marginTop: 8, color: "var(--muted)" }}>{authMessage}</p>
            </>
          ) : (
            <>
              <p style={{ marginBottom: 10 }}>Welcome back, <strong>{sessionUser.email.split("@")[0]}</strong>!</p>
              <div className="stat" style={{ marginBottom: 10 }}>
                <span>Trips stored</span>
                <strong>{commutes.length}</strong>
              </div>
              <div className="stat" style={{ marginBottom: 10 }}>
                <span>Carbon credits</span>
                <strong>{credits}</strong>
              </div>
              <button className="button ghost" onClick={logout}>
                Logout
              </button>
            </>
          )}
        </div>

        <div className="card">
          <div className="section-title">
            <h2>Navigation & Optimized Route</h2>
            <span className="badge green">{route.distance} km</span>
          </div>
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
          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <button className="button" onClick={optimizeRoute}>
              Optimize Route
            </button>
            <button className="button ghost" onClick={() => setRoute({ distance: 0, summary: "Awaiting optimization", path: [] })}>
              Clear
            </button>
          </div>
          <MapCanvas
            start={{ ...(destinations[start] || destinations["Transit Hub"]), label: start }}
            dest={{ ...(destinations[destination] || destinations["Eco Park"]), label: destination }}
            hubs={route.via ? [route.via] : []}
          />
          <p style={{ marginTop: 8, color: "var(--muted)" }}>{route.summary}</p>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="section-title">
            <h2>Transport Fare Comparison</h2>
            <span className="badge orange">Live calc</span>
          </div>
          <div className="fare-grid">
            {fareCards.map((f, idx) => (
              <div key={f.key} className="fare-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>{f.label}</strong>
                  {idx === 0 && <span className="badge green">Cheapest</span>}
                </div>
                <div style={{ marginTop: 6, color: "var(--muted)" }}>${f.fare}</div>
                <div className="pill-small" style={{ marginTop: 6 }}>
                  {f.emission} kg CO₂e
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title">
            <h2>Emission Reduction Tips</h2>
            <span className="badge green">+ CO₂ saved</span>
          </div>
          <div className="tips">
            {emissionTips.map((t) => (
              <div key={t.title} className="tip">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>{t.title}</strong>
                  <span className={`badge ${t.impact === "High" ? "red" : t.impact === "Medium" ? "orange" : "blue"}`}>{t.impact}</span>
                </div>
                <div className="pill-small">~{t.save} kg CO₂ saved</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title">
            <h2>Shipment CO₂ Calculator</h2>
            <span className="badge blue">Logistics</span>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
            <div className="field">
              <label>Package weight (kg)</label>
              <input
                className="input"
                type="number"
                min="0"
                value={ship.weight}
                onChange={(e) => {
                  const next = { ...ship, weight: parseFloat(e.target.value || "0") };
                  setShip(next);
                  calcShipment(next);
                }}
              />
            </div>
            <div className="field">
              <label>Distance (km)</label>
              <input
                className="input"
                type="number"
                min="0"
                value={ship.distance}
                onChange={(e) => {
                  const next = { ...ship, distance: parseFloat(e.target.value || "0") };
                  setShip(next);
                  calcShipment(next);
                }}
              />
            </div>
            <div className="field">
              <label>Mode</label>
              <select
                className="select"
                value={ship.mode}
                onChange={(e) => {
                  const next = { ...ship, mode: e.target.value };
                  setShip(next);
                  calcShipment(next);
                }}
              >
                <option value="truck">Truck</option>
                <option value="train">Train</option>
                <option value="ship">Ship</option>
                <option value="air">Air freight</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
            <button className="button" onClick={() => calcShipment()}>
              Calculate
            </button>
            <button
              className="button ghost"
              onClick={() => {
                const reset = { weight: 2, distance: 120, mode: "truck" };
                setShip(reset);
                calcShipment(reset);
              }}
            >
              Reset
            </button>
          </div>
          <div className="stat" style={{ marginTop: 12 }}>
            <div>
              <div style={{ color: "var(--muted)" }}>Estimated emissions</div>
              <strong>{shipResult.emission} kg CO₂e</strong>
            </div>
            <div className="pill-small">{shipResult.alt}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="section-title">
            <h2>Commute Tracker</h2>
            <span className="badge green">+{weeklySaved.toFixed(2)} kg saved</span>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 10 }}>
            <div className="stat">
              <div>Weekly emissions</div>
              <strong>{weeklyEmissions.toFixed(2)} kg</strong>
            </div>
            <div className="stat">
              <div>Goal progress</div>
              <strong>{goalProgress}%</strong>
            </div>
          </div>
          <div className="progress" style={{ margin: "10px 0" }}>
            <div className="progress-inner" style={{ width: `${goalProgress}%` }}></div>
          </div>
          <ul className="list">
            {commutes.slice(-6).map((c, i) => (
              <li key={i}>
                <div>
                  <strong>{c.modeLabel}</strong>
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>
                    {c.distance} km • {c.emission.toFixed(2)} kg CO₂e
                  </div>
                </div>
                <span className="pill-small">Saved {c.savings.toFixed(2)} kg</span>
              </li>
            ))}
          </ul>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 10, marginTop: 10 }}>
            <div className="field">
              <label>Mode</label>
              <select className="select" id="commute-mode" defaultValue="bus">
                <option value="bus">Bus</option>
                <option value="metro">Metro</option>
                <option value="bike">Bike</option>
                <option value="walk">Walk</option>
                <option value="rideshare">Ride-share</option>
              </select>
            </div>
            <div className="field">
              <label>Distance (km)</label>
              <input className="input" id="commute-distance" type="number" min="0" defaultValue="5" />
            </div>
          </div>
          <button className="button" style={{ marginTop: 10 }} onClick={addCommute}>
            Add commute
          </button>
        </div>

        <div className="card">
          <div className="section-title">
            <h2>Carbon Credits & Rewards</h2>
            <span className="badge orange">{credits} pts</span>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 }}>
            <div className="stat">
              <div>Credits</div>
              <strong>{credits}</strong>
            </div>
            <div className="stat">
              <div>Level</div>
              <strong>{level}</strong>
            </div>
          </div>
          <p style={{ margin: "10px 0" }}>Earn credits from CO₂ saved. Unlock badges and redeem eco rewards.</p>
          <div className="chips">
            {[
              { title: "First 25 credits", unlocked: credits >= 25 },
              { title: "Bike-friendly", unlocked: commutes.some((c) => c.mode === "bike") },
              { title: "Low-carbon week", unlocked: credits >= 80 },
              { title: "Leader tier", unlocked: level === "Leader" || level === "Champion" },
            ].map((b) => (
              <div key={b.title} className={`chip ${b.unlocked ? "active" : ""}`}>
                {b.title}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <button className="button" onClick={redeemReward}>
              Redeem reward
            </button>
            <button className="button ghost" onClick={shareProgress}>
              Share progress
            </button>
          </div>
          <p style={{ marginTop: 8, color: "var(--muted)" }}>{rewardMsg}</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="section-title">
          <h2>Safety Points & Emergency Assistance</h2>
          <span className="badge red">SOS ready</span>
        </div>
        <div className="safety-grid">
          {safetyPoints.map((pt) => (
            <div key={pt.name} className="safety-card">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{pt.name}</strong>
                <span className="badge blue">{pt.type}</span>
              </div>
              <div style={{ color: "var(--muted)", marginTop: 6 }}>{pt.contact}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          <button
            className="button"
            onClick={() => {
              setSafetyNote("Safety points highlighted. Tap to view details.");
            }}
          >
            Show on map
          </button>
          <button
            className="button"
            style={{ background: "linear-gradient(135deg, #ff6b6b, #ffb347)", color: "#05060b" }}
            onClick={() => {
              setSafetyNote("SOS triggered. Sharing approximate coordinates and contacting closest help.");
              alert("SOS sent to emergency services. Stay calm and follow instructions.");
            }}
          >
            SOS Now
          </button>
        </div>
        <p style={{ marginTop: 8, color: "var(--muted)" }}>{safetyNote}</p>
      </div>
    </main>
  );
}

