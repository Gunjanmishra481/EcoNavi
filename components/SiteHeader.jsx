"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Overview" },
  { href: "/navigate", label: "Navigate" },
  { href: "/commutes", label: "Commutes" },
  { href: "/rewards", label: "Rewards" },
  { href: "/safety", label: "Safety" },
];

export default function SiteHeader() {
  const pathname = usePathname();
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
      </nav>
    </header>
  );
}

