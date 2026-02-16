import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hockey Stat Tracker",
  description: "Track games, lineups, and stats",
};

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      style={{
        textDecoration: "none",
        fontWeight: 800,
        padding: "8px 10px",
        borderRadius: 10,
        border: "1px solid #e6e6e6",
        background: "white",
      }}
    >
      {label}
    </a>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#fafafa" }}>
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            background: "rgba(250,250,250,0.9)",
            backdropFilter: "blur(6px)",
            borderBottom: "1px solid #eee",
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "12px 16px",
              display: "flex",
              gap: 12,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <a href="/dashboard" style={{ textDecoration: "none", color: "black" }}>
                <div style={{ fontWeight: 950, letterSpacing: 0.2 }}>Hockey Stat Tracker</div>
                <div style={{ fontSize: 12, opacity: 0.65, fontWeight: 700 }}>Dashboard • Players • Games • Stats</div>
              </a>
            </div>

            <nav style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <NavLink href="/dashboard" label="Dashboard" />
              <NavLink href="/players" label="Players" />
              <NavLink href="/games" label="Games" />
              <NavLink href="/stats/players" label="Player Stats" />
              <NavLink href="/stats/team" label="Team Stats" />
              <NavLink href="/admin/sharing" label="Sharing" />
              <NavLink href="/api/auth/signout" label="Sign out" />
            </nav>
          </div>
        </header>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px" }}>{children}</div>

        <footer style={{ maxWidth: 1200, margin: "0 auto", padding: "18px 16px", fontSize: 12, opacity: 0.65 }}>
          © {new Date().getFullYear()} Hockey Stat Tracker
        </footer>
      </body>
    </html>
  );
}
