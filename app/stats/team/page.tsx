"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type TeamStats = {
  totals: {
    games: number;
    wins: number;
    losses: number;
    ties: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDiff: number;
    penalties: number;
    shutouts: number;
  };
  leagues: Array<{ league: string; wins: number; losses: number; ties: number; games: number }>;
};

function Card({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 14, padding: 14, background: "white" }}>
      <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800 }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: 900, marginTop: 6 }}>{value}</div>
      {sub ? <div style={{ marginTop: 4, fontSize: 12, opacity: 0.75 }}>{sub}</div> : null}
    </div>
  );
}

export default function TeamStatsPage() {
  const [teamId, setTeamId] = useState("");
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => setTeamId(localStorage.getItem("teamId") ?? ""), []);

  useEffect(() => {
    if (!teamId) return;
    (async () => {
      setStatus("Loading team stats…");
      const res = await fetch(`/api/stats/team?teamId=${encodeURIComponent(teamId)}`);
      const json = await res.json();
      if (!res.ok) return setStatus(`Error: ${json.error ?? "UNKNOWN"}`);
      setStats(json);
      setStatus("");
    })();
  }, [teamId]);

  const record = stats ? `${stats.totals.wins}-${stats.totals.losses}-${stats.totals.ties}` : "—";

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 1100 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Team Stats</h1>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/stats/players">Player Stats</Link>
          <Link href="/games">Games</Link>
        </nav>
      </header>

      {status ? <p style={{ marginTop: 12 }}>{status}</p> : null}

      <section style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <Card title="Record" value={record} sub={stats ? `${stats.totals.games} games` : ""} />
        <Card title="Goals For" value={stats ? String(stats.totals.goalsFor) : "—"} />
        <Card title="Goals Against" value={stats ? String(stats.totals.goalsAgainst) : "—"} />
        <Card title="Goal Diff" value={stats ? String(stats.totals.goalDiff) : "—"} />
        <Card title="Penalties" value={stats ? String(stats.totals.penalties) : "—"} />
        <Card title="Shutouts" value={stats ? String(stats.totals.shutouts) : "—"} />
        <Card title="GF / GA" value={stats ? `${stats.totals.goalsFor} / ${stats.totals.goalsAgainst}` : "—"} />
        <Card title="Games Played" value={stats ? String(stats.totals.games) : "—"} />
      </section>

      <section style={{ marginTop: 18, border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>League breakdown</h2>

        <div style={{ marginTop: 10, borderTop: "1px solid #eee" }}>
          {(stats?.leagues ?? []).map((l) => (
            <div
              key={l.league}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 160px 100px",
                padding: "10px 0",
                borderBottom: "1px solid #f1f1f1",
                alignItems: "baseline",
              }}
            >
              <div style={{ fontWeight: 900 }}>{l.league}</div>
              <div style={{ opacity: 0.85 }}>{l.wins}-{l.losses}-{l.ties}</div>
              <div style={{ opacity: 0.65, textAlign: "right" }}>{l.games} games</div>
            </div>
          ))}
          {(stats?.leagues ?? []).length === 0 ? <div style={{ paddingTop: 10 }}>No games yet.</div> : null}
        </div>
      </section>
    </main>
  );
}
