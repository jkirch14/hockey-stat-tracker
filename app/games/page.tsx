"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Player = { id: string; name: string; number: number | null };
type Game = {
  id: string;
  date: string;
  location: string | null;
  opponent: string;
  league: string | null;
  result: "WIN" | "LOSS" | "TIE";
  goalsFor: number;
  goalsAgainst: number;
  jerseyColor: string | null;
  notes: string | null;
  playerOfGameId: string | null;
  playerOfGame?: Player | null;
};

function toLocalInputValue(d: Date) {
  // YYYY-MM-DDTHH:mm for <input type="datetime-local">
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function GamesPage() {
  const [teamId, setTeamId] = useState("");
  const [status, setStatus] = useState("");
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  // form
  const [date, setDate] = useState(toLocalInputValue(new Date()));
  const [location, setLocation] = useState("");
  const [opponent, setOpponent] = useState("");
  const [league, setLeague] = useState("");
  const [result, setResult] = useState<"WIN" | "LOSS" | "TIE">("WIN");
  const [goalsFor, setGoalsFor] = useState("0");
  const [goalsAgainst, setGoalsAgainst] = useState("0");
  const [playerOfGameId, setPlayerOfGameId] = useState<string>("");
  const [jerseyColor, setJerseyColor] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setTeamId(localStorage.getItem("teamId") ?? "");
  }, []);

  async function loadPlayers(tid: string) {
    const res = await fetch(`/api/players?teamId=${encodeURIComponent(tid)}`);
    const json = await res.json();
    if (res.ok) setPlayers(json);
  }

  async function loadGames() {
    if (!teamId) return setStatus("Missing teamId. Visit /dashboard first.");
    setStatus("Loading games...");
    const res = await fetch(`/api/games?teamId=${encodeURIComponent(teamId)}`);
    const json = await res.json();
    if (!res.ok) return setStatus(`Error: ${json.error ?? "UNKNOWN"}`);
    setGames(json);
    setStatus("");
  }

  useEffect(() => {
    if (!teamId) return;
    loadPlayers(teamId);
    loadGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  async function addGame() {
    setStatus("");
    if (!teamId) return setStatus("Missing teamId.");
    if (!opponent.trim()) return setStatus("Opponent is required.");

    setStatus("Adding game...");

    const res = await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamId,
        date: new Date(date).toISOString(),
        location: location.trim() || undefined,
        opponent: opponent.trim(),
        league: league.trim() || undefined,
        result,
        goalsFor: Number(goalsFor || "0"),
        goalsAgainst: Number(goalsAgainst || "0"),
        playerOfGameId: playerOfGameId || undefined,
        jerseyColor: jerseyColor.trim() || undefined,
        notes: notes.trim() || undefined,
      }),
    });

    const json = await res.json();
    if (!res.ok) return setStatus(`Error: ${json.error ?? "UNKNOWN"}`);

    setOpponent("");
    setLocation("");
    setLeague("");
    setGoalsFor("0");
    setGoalsAgainst("0");
    setPlayerOfGameId("");
    setJerseyColor("");
    setNotes("");

    await loadGames();
    setStatus("✅ Game added.");
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 1000 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Games</h1>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/players">Players</Link>
          <Link href="/admin/sharing">Sharing</Link>
        </nav>
      </header>

      <section style={{ marginTop: 16, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Add game</h2>

        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 1fr", gap: 12, marginTop: 10 }}>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Date</label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Opponent</label>
            <input value={opponent} onChange={(e) => setOpponent(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }} />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>League</label>
            <input value={league} onChange={(e) => setLeague(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 180px", gap: 12, marginTop: 12 }}>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }} />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Result</label>
            <select value={result} onChange={(e) => setResult(e.target.value as any)} style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}>
              <option value="WIN">Win</option>
              <option value="LOSS">Loss</option>
              <option value="TIE">Tie</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Jersey color</label>
            <input value={jerseyColor} onChange={(e) => setJerseyColor(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "160px 160px 1fr", gap: 12, marginTop: 12 }}>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Goals For</label>
            <input value={goalsFor} onChange={(e) => setGoalsFor(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }} />
          </div>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Goals Against</label>
            <input value={goalsAgainst} onChange={(e) => setGoalsAgainst(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }} />
          </div>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Player of the Game</label>
            <select value={playerOfGameId} onChange={(e) => setPlayerOfGameId(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}>
              <option value="">(none)</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.number ? `${p.number} - ` : ""}{p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }} />
        </div>

        <button onClick={addGame} style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", cursor: "pointer", fontWeight: 700 }}>
          Add Game
        </button>

        {status && <p style={{ marginTop: 10 }}>{status}</p>}
      </section>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Game log</h2>

        <div style={{ marginTop: 10, border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 140px 140px 140px 120px", fontWeight: 700, padding: 12, background: "#f7f7f7" }}>
            <div>Date</div>
            <div>Opponent</div>
            <div>League</div>
            <div>Result</div>
            <div>Score</div>
            <div></div>
          </div>

          {games.map((g) => (
            <div key={g.id} style={{ display: "grid", gridTemplateColumns: "180px 1fr 140px 140px 140px 120px", padding: 12, borderTop: "1px solid #eee" }}>
              <div>{new Date(g.date).toLocaleString()}</div>
              <div>{g.opponent}</div>
              <div>{g.league ?? ""}</div>
              <div>{g.result}</div>
              <div>{g.goalsFor}-{g.goalsAgainst}</div>
              <div>
                <Link href={`/games/${g.id}`} style={{ fontWeight: 700 }}>
                  Edit
                </Link>
              </div>
            </div>
          ))}

          {games.length === 0 && <div style={{ padding: 12 }}>No games yet.</div>}
        </div>
      </section>
    </main>
  );
}
