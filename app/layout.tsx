import type { Metadata } from "next";
import { auth } from "@/lib/auth";
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#fafafa",
        }}
      >
        {/* 🔐 Only show nav if logged in */}
        {isLoggedIn && (
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
              <a href="/dashboard" style={{ textDecoration: "none", color: "black" }}>
                <div style={{ fontWeight: 950 }}>Hockey Stat Tracker</div>
              </a>

              <nav style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
        )}

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
