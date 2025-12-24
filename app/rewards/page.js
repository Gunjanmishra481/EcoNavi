"use client";

import { useEffect, useMemo, useState } from "react";

export default function RewardsPage() {
  const [commutes, setCommutes] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("en_commutes") || "[]");
    setCommutes(saved);
  }, []);

  const credits = useMemo(() => {
    const saved = commutes.reduce((s, c) => s + c.savings, 0);
    return Math.round(saved * 10);
  }, [commutes]);

  const level = credits > 200 ? "Champion" : credits > 120 ? "Leader" : credits > 60 ? "Advocate" : "Rookie";

  function redeem() {
    if (credits < 50) {
      setMessage("Earn 50+ credits to redeem rewards.");
      return;
    }
    setMessage("Reward unlocked: Free transit pass x1. Keep going!");
  }

  function share() {
    const text = `I earned ${credits} carbon credits on EmissioNavi!`;
    navigator.clipboard?.writeText(text);
    setMessage("Progress copied. Share it anywhere!");
  }

  return (
    <main className="stack">
      <section className="card">
        <div className="section-title">
          <h2>Carbon Credits & Rewards</h2>
          <span className="badge orange">{credits} pts</span>
        </div>
        <div className="grid grid-3">
          <div className="stat">
            <div>Credits</div>
            <strong>{credits}</strong>
          </div>
          <div className="stat">
            <div>Level</div>
            <strong>{level}</strong>
          </div>
          <div className="stat">
            <div>Commutes logged</div>
            <strong>{commutes.length}</strong>
          </div>
        </div>
        <p className="muted">Credits accrue automatically from your logged commutes. Keep traveling green to climb tiers.</p>
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
        <div className="row gap">
          <button className="button" onClick={redeem}>
            Redeem reward
          </button>
          <button className="button ghost" onClick={share}>
            Share progress
          </button>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>
          {message}
        </p>
      </section>
    </main>
  );
}

