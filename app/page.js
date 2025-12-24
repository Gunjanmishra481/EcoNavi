import Link from "next/link";

const flows = [
  {
    title: "Navigate smarter",
    desc: "Optimize routes with live maps, fares, and CO₂ savings.",
    href: "/navigate",
    badge: "Routes",
  },
  {
    title: "Track commutes",
    desc: "Log weekly trips, watch emissions drop, and hit goals.",
    href: "/commutes",
    badge: "Tracker",
  },
  {
    title: "Earn rewards",
    desc: "Convert CO₂ savings into credits, levels, and perks.",
    href: "/rewards",
    badge: "Rewards",
  },
  {
    title: "Stay safe",
    desc: "See nearby safety points and trigger SOS when needed.",
    href: "/safety",
    badge: "Safety",
  },
];

export default function Home() {
  return (
    <main className="stack">
      <section className="hero card">
        <div className="hero-copy">
          <p className="eyebrow">Green. Safe. Rewarding.</p>
          <h1>EmissioNavi</h1>
          <p className="lead">
            Plan low-carbon trips, compare fares, track emissions, earn carbon credits, and keep safety close — all in a calming green & white interface.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/navigate">
              Start navigating
            </Link>
            <Link className="button ghost" href="/commutes">
              View my commutes
            </Link>
          </div>
        </div>
        <div className="hero-panel">
          <div className="stat-tile">
            <div className="stat-label">Weekly CO₂ saved</div>
            <div className="stat-value">+4.2 kg</div>
          </div>
          <div className="stat-tile">
            <div className="stat-label">Carbon credits</div>
            <div className="stat-value">120 pts</div>
          </div>
          <div className="stat-progress">
            <div className="stat-label">Goal progress</div>
            <div className="progress">
              <div className="progress-inner" style={{ width: "68%" }} />
            </div>
            <div className="muted">68% of weekly goal achieved</div>
          </div>
        </div>
      </section>

      <section className="grid grid-2">
        <div className="card">
          <div className="section-title">
            <h2>Flow through the app</h2>
            <span className="badge green">Guided</span>
          </div>
          <ol className="flow-list">
            <li>
              <strong>Navigate</strong> — pick your destination, see real-time map, optimized path, and fares.
            </li>
            <li>
              <strong>Track</strong> — log commutes, monitor emissions, and watch savings vs. driving.
            </li>
            <li>
              <strong>Earn</strong> — convert savings to credits, climb levels, and redeem rewards.
            </li>
            <li>
              <strong>Stay safe</strong> — keep nearby safety points and SOS at your fingertips.
            </li>
          </ol>
        </div>
        <div className="card">
          <div className="section-title">
            <h2>Feature hubs</h2>
            <span className="badge blue">All-in-one</span>
          </div>
          <div className="grid grid-2">
            {flows.map((f) => (
              <Link key={f.href} href={f.href} className="feature-tile">
                <div className="badge subtle">{f.badge}</div>
                <h3>{f.title}</h3>
                <p className="muted">{f.desc}</p>
                <span className="chevron">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

