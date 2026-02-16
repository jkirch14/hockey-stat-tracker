"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Row = {
  id: string;
  name: string;
  number: number | null;
  shootSide: string | null;
  totals: {
    games: number;
    goals: number;
    assists: number;
    points: number;
    penalties: number;
    shutouts: number;
    playerOfGame: number;
  };
  positions: string[];
};

type SortKey = "points" | "goals" | "assists" | "games" | "penalties" | "shutouts" | "pog" | "name" | "number";

export default function PlayerStatsPage() {
  const [teamId, setTeamId] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("points");
  const [desc, setDesc] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setTeamId(localStorage.getItem("teamId") ?? "");
  }, []);

  useEffect(() => {
    if (!teamId) return;

    (async () => {
      setStatus("Loading player stats…");
      const res = await fetch(`/api/stats/players?teamId=${encodeURIComponent(teamId)}`);
      const json = await res.json();
      if (!res.ok) return setStatus(`Error: ${json.error ?? "UNKNOWN"}`);

      setRows(json.players ?? []);
      setStatus("");
    })();
  }, [teamId]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const base = term
      ? rows.filter((r) => {
          const num = r.number?.toString() ?? "";
          return r.name.toLowerCase().includes(term) || num.includes(term);
        })
      : rows;

    const cmp = (a: Row, b: Row) => {
      const dir = desc ? -1 : 1;

      switch (sortKey) {
        case "name":
          return a.name.localeCompare(b.name) * dir;
        case "number":
          return ((a.number ?? 9999) - (b.number ?? 9999)) * dir;
        case "games":
          return (a.totals.games - b.totals.games) * dir;
        case "goals":
          return (a.totals.goals - b.totals.goals) * dir;
        case "assists":
          return (a.totals.assists - b.totals.assists) * dir;
        case "points":
          return (a.totals.points - b.totals.points) * dir;
        case "penalties":
          return (a.totals.penalties - b.totals.penalties) * dir;
        case "shutouts":
          return (a.totals.shutouts - b.totals.shutouts) * dir;
        case "pog":
          return (a.totals.playerOfGame - b.totals.playerOfGame) * dir;
        default:
          return 0;
      }
    };

    return [...base].sort((a, b) => {
      const primary = cmp(a, b);
      if (primary !== 0) return primary;

      // tie-breakers (points > goals > name)
      if (a.totals.points !== b.totals.points) return (b.totals.points - a.totals.points) * (desc ? 1 : -1);
      if (a.totals.goals !== b.totals.goals) return (b.totals.goals - a.totals.goals) * (desc ? 1 : -1);
      return a.name.localeCompare(b.name);
    });
  }, [rows, q, sortKey, desc]);

  function setSort(k: SortKey) {
    if (k === sortKey) setDesc((d) => !d);
    else {
      setSortKey(k);
      setDesc(true);
    }
  }

  const sortLabel = `${sortKey}${desc ? " ↓" : " ↑"}`;

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 1100 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Player Stats</h1>
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
            Sort: <b>{sortLabel}</b>
          </div>
        </div>

        <nav style={{ display: "flex", gap: 12 }}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/players">Players</Link>
          <Link href="/games">Games</Link>
        </nav>
      </header>

      <section style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or number…"
          style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
        />

        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          style={{ padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
        >
          <option value="points">Points</option>
          <option value="goals">Goals</option>
          <option value="assists">Assists</option>
          <option value="games">Games Played</option>
          <option value="penalties">Penalties</option>
          <option value="shutouts">Shutouts</option>
          <option value="pog">Player of Game</option>
          <option value="name">Name</option>
          <option value="number">Number</option>
        </select>

        <button
          onClick={() => setDesc((d) => !d)}
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", cursor: "pointer", fontWeight: 800 }}
        >
          {desc ? "Desc" : "Asc"}
        </button>
      </section>

      {status ? <p style={{ marginTop: 12 }}>{status}</p> : null}

      <section style={{ marginTop: 14, border: "1px solid #ddd", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "70px 1.4fr 70px 70px 70px 70px 80px 80px 140px", padding: 12, background: "#f7f7f7", fontWeight: 900 }}>
          <button onClick={() => setSort("number")} style={{ background: "transparent", border: 0, textAlign: "left", fontWeight: 900, cursor: "pointer" }}>
            #
          </button>
          <button onClick={() => setSort("name")} style={{ background: "transparent", border: 0, textAlign: "left", fontWeight: 900, cursor: "pointer" }}>
            Player
          </button>
          <button onClick={() => setSort("games")} style={{ background: "transparent", border: 0, textAlign: "right", fontWeight: 900, cursor: "pointer" }}>
            GP
          </button>
          <button onClick={() => setSort("goals")} style={{ background: "transparent", border: 0, textAlign: "right", fontWeight: 900, cursor: "pointer" }}>
            G
          </button>
          <button onClick={() => setSort("assists")} style={{ background: "transparent", border: 0, textAlign: "right", fontWeight: 900, cursor: "pointer" }}>
            A
          </button>
          <button onClick={() => setSort("points")} style={{ background: "transparent", border: 0, textAlign: "right", fontWeight: 900, cursor: "pointer" }}>
            PTS
          </button>
          <button onClick={() => setSort("penalties")} style={{ background: "transparent", border: 0, textAlign: "right", fontWeight: 900, cursor: "pointer" }}>
            PIM
          </button>
          <button onClick={() => setSort("shutouts")} style={{ background: "transparent", border: 0, textAlign: "right", fontWeight: 900, cursor: "pointer" }}>
            SO
          </button>
          <div style={{ textAlign: "left" }}>Positions</div>
        </div>

        {filtered.map((r) => (
          <div key={r.id} style={{ display: "grid", gridTemplateColumns: "70px 1.4fr 70px 70px 70px 70px 80px 80px 140px", padding: 12, borderTop: "1px solid #eee", alignItems: "baseline" }}>
            <div style={{ opacity: 0.85 }}>{r.number ?? ""}</div>
            <div style={{ fontWeight: 900 }}>
            <Link href={`/players/${r.id}/stats`}>{r.name}</Link>
            </div>
            <div style={{ textAlign: "right" }}>{r.totals.games}</div>
            <div style={{ textAlign: "right" }}>{r.totals.goals}</div>
            <div style={{ textAlign: "right" }}>{r.totals.assists}</div>
            <div style={{ textAlign: "right", fontWeight: 900 }}>{r.totals.points}</div>
            <div style={{ textAlign: "right" }}>{r.totals.penalties}</div>
            <div style={{ textAlign: "right" }}>{r.totals.shutouts}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{(r.positions ?? []).join(", ")}</div>
          </div>
        ))}

        {filtered.length === 0 && <div style={{ padding: 12 }}>No players / stats yet.</div>}
      </section>

      <p style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
        Stats are computed from lineup entries. “GP” counts games where the player is included in a lineup.
      </p>
    </main>
  );
}
