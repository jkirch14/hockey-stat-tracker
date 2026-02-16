"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type BootstrapResult =
  | { teamId: string; created: boolean; role: string; teamName: string }
  | { error: string };

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

type PlayerRow = {
  id: string;
  name: string;
  number: number | null;
  totals: { games: number; goals: number; assists: number; points: number; penalties: number; shutouts: number; playerOfGame: number };
};

function Card({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 14, padding: 14, background: "white" }}>
      <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 700, letterSpacing: 0.2 }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: 900, marginTop: 6 }}>{value}</div>
      {sub ? <div style={{ marginTop: 4, fontSize: 12, opacity: 0.75 }}>{sub}</div> : null}
    </div>
  );
}

export default function DashboardPage() {
  const [boot, setBoot] = useState<BootstrapResult | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [playerRows, setPlayerRows] = useState<PlayerRow[]>([]);
  const [msg, setMsg] = useState<string>("");

  const teamId = useMemo(() => {
    if (!boot || "error" in boot) return "";
    return boot.teamId;
  }, [boot]);

  useEffect(() => {
    (async () => {
      setMsg("Setting up your team…");
      const res = await fetch("/api/bootstrap", { method: "POST" });
      const json = (await res.json()) as BootstrapResult;
      setBoot(json);

      if (!("error" in json)) {
        localStorage.setItem("teamId", json.teamId);
        setMsg("");
      } else {
        setMsg(`Error: ${json.error}`);
      }
    })();
  }, []);

  useEffect(() => {
    if (!teamId) return;

    (async () => {
      setMsg("Loading stats…");
      const [tRes, pRes] = await Promise.all([
        fetch(`/api/stats/team?teamId=${encodeURIComponent(teamId)}`),
        fetch(`/api/stats/players?teamId=${encodeURIComponent(teamId)}`),
      ]);

      const tJson = await tRes.json();
      const pJson = await pRes.json();

      if (!tRes.ok) return setMsg(`Error loading team stats: ${tJson.error ?? "UNKNOWN"}`);
      if (!pRes.ok) return setMsg(`Error loading player stats: ${pJson.error ?? "UNKNOWN"}`);

      setTeamStats(tJson);
      setPlayerRows((pJson.players ?? []).slice(0, 10)); // Top 10
      setMsg("");
    })();
  }, [teamId]);

  const record = teamStats ? `${teamStats.totals.wins}-${teamStats.totals.losses}-${teamStats.totals.ties}` : "—";
  const gfga = teamStats ? `${teamStats.totals.goalsFor} / ${teamStats.totals.goalsAgainst}` : "—";
  const gd = teamStats ? `${teamStats.totals.goalDiff}` : "—";

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 1100 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 900, margin: 0 }}>
            Dashboard{boot && !("error" in boot) ? ` • ${boot.teamName}` : ""}
          </h1>
          {boot && !("error" in boot) ? (
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
              Role: <b>{boot.role}</b> • Team ID: <code>{boot.teamId}</code>
            </div>
          ) : null}
        </div>

        <nav style={{ display: "flex", gap: 12 }}>
          <Link href="/players">Players</Link>
          <Link href="/games">Games</Link>
          <Link href="/admin/sharing">Sharing</Link>
        </nav>
      </header>

      {msg ? <p style={{ marginTop: 12 }}>{msg}</p> : null}

      <section style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <Card title="Record" value={record} sub={teamStats ? `${teamStats.totals.games} games` : ""} />
        <Card title="Goals For / Against" value={gfga} sub={teamStats ? `GD: ${gd}` : ""} />
        <Card title="Penalties" value={teamStats ? String(teamStats.totals.penalties) : "—"} />
        <Card title="Shutouts" value={teamStats ? String(teamStats.totals.shutouts) : "—"} />
      </section>

      <section style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 12 }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>League breakdown</h2>

          <div style={{ marginTop: 10, borderTop: "1px solid #eee" }}>
            {(teamStats?.leagues ?? []).map((l) => (
              <div
                key={l.league}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 140px 100px",
                  padding: "10px 0",
                  borderBottom: "1px solid #f1f1f1",
                  alignItems: "baseline",
                }}
              >
                <div style={{ fontWeight: 800 }}>{l.league}</div>
                <div style={{ opacity: 0.85 }}>
                  {l.wins}-{l.losses}-{l.ties}
                </div>
                <div style={{ opacity: 0.65, textAlign: "right" }}>{l.games} games</div>
              </div>
            ))}
            {(teamStats?.leagues ?? []).length === 0 ? <div style={{ paddingTop: 10 }}>No games yet.</div> : null}
          </div>
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Top scorers</h2>

          <div style={{ marginTop: 10, borderTop: "1px solid #eee" }}>
            {playerRows.map((p) => (
              <div
                key={p.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 70px 70px 70px",
                  padding: "10px 0",
                  borderBottom: "1px solid #f1f1f1",
                  alignItems: "baseline",
                }}
              >
                <div style={{ opacity: 0.8 }}>{p.number ?? ""}</div>
                <div style={{ fontWeight: 800 }}>{p.name}</div>
                <div style={{ textAlign: "right" }}>{p.totals.goals}</div>
                <div style={{ textAlign: "right" }}>{p.totals.assists}</div>
                <div style={{ textAlign: "right", fontWeight: 900 }}>{p.totals.points}</div>
              </div>
            ))}
            {playerRows.length === 0 ? <div style={{ paddingTop: 10 }}>No lineup stats yet.</div> : null}
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
            Columns: G / A / PTS (from lineup entries)
          </div>
        </div>
      </section>
    </main>
  );
}
