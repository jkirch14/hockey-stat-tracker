"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Payload = {
  player: { id: string; name: string; number: number | null; shootSide: string | null; parentsName: string | null };
  totals: { games: number; goals: number; assists: number; points: number; penalties: number; shutouts: number; playerOfGame: number };
  perPosition: Array<{ position: string; games: number; goals: number; assists: number; points: number; penalties: number }>;
  gameLog: Array<{
    gameId: string;
    date: string;
    opponent: string;
    league: string | null;
    result: string;
    score: string;
    position: string;
    line: number | null;
    goals: number;
    assists: number;
    points: number;
    penalties: number;
    shutout: boolean;
  }>;
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

export default function PlayerDrilldownPage() {
  const params = useParams<{ id: string }>();
  const playerId = params.id;

  const [teamId, setTeamId] = useState("");
  const [data, setData] = useState<Payload | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => setTeamId(localStorage.getItem("teamId") ?? ""), []);

  useEffect(() => {
    if (!teamId) return;
    (async () => {
      setStatus("Loading player stats…");
      const res = await fetch(`/api/stats/player?teamId=${encodeURIComponent(teamId)}&playerId=${encodeURIComponent(playerId)}`);
      const json = await res.json();
      if (!res.ok) return setStatus(`Error: ${json.error ?? "UNKNOWN"}`);
      setData(json);
      setStatus("");
    })();
  }, [teamId, playerId]);

  if (!data) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
        <p>{status || "Loading…"}</p>
      </main>
    );
  }

  const p = data.player;

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 1200 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>
            {p.number ? `#${p.number} ` : ""}{p.name}
          </h1>
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
            Shoots: <b>{p.shootSide ?? "—"}</b>
            {p.parentsName ? <> • Parents: <b>{p.parentsName}</b></> : null}
          </div>
        </div>

        <nav style={{ display: "flex", gap: 12 }}>
          <Link href="/stats/players">Player Stats</Link>
          <Link href={`/players/${playerId}`}>Edit Player</Link>
          <Link href="/games">Games</Link>
        </nav>
      </header>

      <section style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
        <Card title="GP" value={String(data.totals.games)} />
        <Card title="Goals" value={String(data.totals.goals)} />
        <Card title="Assists" value={String(data.totals.assists)} />
        <Card title="Points" value={String(data.totals.points)} />
        <Card title="PIM" value={String(data.totals.penalties)} />
        <Card title="SO / POG" value={`${data.totals.shutouts} / ${data.totals.playerOfGame}`} />
      </section>

      <section style={{ marginTop: 18, display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 12 }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>By position</h2>

          <div style={{ marginTop: 10, borderTop: "1px solid #eee" }}>
            {data.perPosition.map((r) => (
              <div key={r.position} style={{ display: "grid", gridTemplateColumns: "60px 60px 60px 70px 1fr", gap: 8, padding: "10px 0", borderBottom: "1px solid #f1f1f1" }}>
                <div style={{ fontWeight: 900 }}>{r.position}</div>
                <div style={{ textAlign: "right" }}>{r.games}</div>
                <div style={{ textAlign: "right" }}>{r.goals}</div>
                <div style={{ textAlign: "right", fontWeight: 900 }}>{r.points}</div>
                <div style={{ textAlign: "right", opacity: 0.8 }}>PIM {r.penalties}</div>
              </div>
            ))}
            {data.perPosition.length === 0 ? <div style={{ paddingTop: 10 }}>No lineup entries yet.</div> : null}
          </div>

          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>Columns: GP / G / PTS</div>
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 14, padding: 14 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Game log</h2>

          <div style={{ marginTop: 10, borderTop: "1px solid #eee" }}>
            <div style={{ display: "grid", gridTemplateColumns: "170px 1fr 90px 70px 70px 70px 70px 80px", padding: "10px 0", fontWeight: 900, opacity: 0.85 }}>
              <div>Date</div>
              <div>Opponent</div>
              <div>Pos</div>
              <div>Line</div>
              <div style={{ textAlign: "right" }}>G</div>
              <div style={{ textAlign: "right" }}>A</div>
              <div style={{ textAlign: "right" }}>PTS</div>
              <div style={{ textAlign: "right" }}>PIM</div>
            </div>

            {data.gameLog.map((g) => (
              <div key={g.gameId} style={{ display: "grid", gridTemplateColumns: "170px 1fr 90px 70px 70px 70px 70px 80px", padding: "10px 0", borderBottom: "1px solid #f1f1f1" }}>
                <div style={{ opacity: 0.85 }}>{new Date(g.date).toLocaleString()}</div>
                <div style={{ fontWeight: 900 }}>
                  {g.opponent} <span style={{ opacity: 0.65, fontWeight: 700 }}>({g.result} {g.score})</span>
                </div>
                <div>{g.position}</div>
                <div>{g.line ?? ""}</div>
                <div style={{ textAlign: "right" }}>{g.goals}</div>
                <div style={{ textAlign: "right" }}>{g.assists}</div>
                <div style={{ textAlign: "right", fontWeight: 900 }}>{g.points}</div>
                <div style={{ textAlign: "right" }}>{g.penalties}</div>
              </div>
            ))}

            {data.gameLog.length === 0 ? <div style={{ paddingTop: 10 }}>No games yet.</div> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
