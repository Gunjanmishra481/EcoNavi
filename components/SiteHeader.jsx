"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const nav = [
  { href: "/", label: "Overview" },
  { href: "/navigate", label: "Navigate" },
  { href: "/commutes", label: "Commutes" },
  { href: "/rewards", label: "Rewards" },
  { href: "/safety", label: "Safety" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [auth, setAuth] = useState({ email: "", password: "" });
  const [session, setSession] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const store = JSON.parse(localStorage.getItem("en_users") || "{}");
    const current = localStorage.getItem("en_session");
    if (current && store[current]) setSession(store[current]);
  }, []);

  const handleAuth = (action) => {
    const { email, password } = auth;
    if (!email || password.length < 6) {
      setMsg("Enter email and 6+ char password.");
      return;
    }
    const store = JSON.parse(localStorage.getItem("en_users") || "{}");
    if (action === "register") {
      if (store[email]) {
        setMsg("Account exists. Login instead.");
        return;
      }
      store[email] = { email, passwordHash: btoa(password) };
      localStorage.setItem("en_users", JSON.stringify(store));
      setMsg("Registered. You can login.");
      return;
    }
    const account = store[email];
    if (!account || account.passwordHash !== btoa(password)) {
      setMsg("Invalid credentials.");
      return;
    }
    localStorage.setItem("en_session", email);
    setSession(account);
    setMsg("");
    setOpen(false);
  };

  const logout = () => {
    localStorage.removeItem("en_session");
    setSession(null);
    setOpen(false);
  };

  return (
    <header className="shell-header">
      <div className="brand">
        <div className="brand-mark">EN</div>
        <div>
          <div className="brand-title">EmissioNavi</div>
          <div className="brand-sub">Sustainable mobility & safety companion</div>
        </div>
      </div>
      <nav className="nav">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={active ? "nav-link active" : "nav-link"}>
              {item.label}
            </Link>
          );
        })}
        <div className="profile-wrap">
          <button className="profile-btn" onClick={() => setOpen((v) => !v)} aria-label="Profile menu">
            {session ? session.email[0]?.toUpperCase() : "☺"}
          </button>
          {open && (
            <div className="profile-card">
              {session ? (
                <>
                  <div className="muted small">Signed in as</div>
                  <div className="profile-email">{session.email}</div>
                  <button className="button ghost" onClick={logout}>
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <div className="field">
                    <label>Email</label>
                    <input className="input" value={auth.email} onChange={(e) => setAuth((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label>Password</label>
                    <input className="input" type="password" value={auth.password} onChange={(e) => setAuth((p) => ({ ...p, password: e.target.value }))} />
                  </div>
                  <div className="row gap">
                    <button className="button" onClick={() => handleAuth("login")}>
                      Sign in
                    </button>
                    <button className="button ghost" onClick={() => handleAuth("register")}>
                      Sign up
                    </button>
                  </div>
                  <div className="muted small">{msg}</div>
                </>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

