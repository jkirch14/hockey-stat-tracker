"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
};

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function GameEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [teamId, setTeamId] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [game, setGame] = useState<Game | null>(null);
  const [status, setStatus] = useState("");

  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [opponent, setOpponent] = useState("");
  const [league, setLeague] = useState("");
  const [result, setResult] = useState<"WIN" | "LOSS" | "TIE">("WIN");
  const [goalsFor, setGoalsFor] = useState("0");
  const [goalsAgainst, setGoalsAgainst] = useState("0");
  const [playerOfGameId, setPlayerOfGameId] = useState("");
  const [jerseyColor, setJerseyColor] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => setTeamId(localStorage.getItem("teamId") ?? ""), []);

  async function loadPlayers(tid: string) {
    const res = await fetch(`/api/players?teamId=${encodeURIComponent(tid)}`);
    const json = await res.json();
    if (res.ok) setPlayers(json);
  }

  async function load() {
    if (!teamId) return setStatus("Missing teamId. Visit /dashboard first.");
    setStatus("Loading game...");

    const res = await fetch(`/api/games/${params.id}?teamId=${encodeURIComponent(teamId)}`);
    const json = await res.json();
    if (!res.ok) return setStatus(`Error: ${json.error ?? "UNKNOWN"}`);

    setGame(json);
    setDate(toLocalInputValue(json.date));
    setLocation(json.location ?? "");
    setOpponent(json.opponent ?? "");
    setLeague(json.league ?? "");
    setResult(json.result);
    setGoalsFor(String(json.goalsFor ?? 0));
    setGoalsAgainst(String(json.goalsAgainst ?? 0));
    setPlayerOfGameId(json.playerOfGameId ?? "");
    setJerseyColor(json.jerseyColor ?? "");
    setNotes(json.notes ?? "");

    setStatus("");
  }

  useEffect(() => {
    if (!teamId) return;
    loadPlayers(teamId);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  async function save() {
    if (!teamId) return setStatus("Missing teamId.");
    if (!opponent.trim()) return setStatus("Opponent is required.");

    setStatus("Saving...");

    const res = await fetch(`/api/games/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamId,
        date: new Date(date).toISOString(),
        location: location.trim() ? location.trim() : null,
        opponent: opponent.trim(),
        league: league.trim() ? league.trim() : null,
        result,
        goalsFor: Number(goalsFor || "0"),
        goalsAgainst: Number(goalsAgainst || "0"),
        playerOfGameId: playerOfGameId || null,
        jerseyColor: jerseyColor.trim() ? jerseyColor.trim() : null,
        notes: notes.trim() ? notes.trim() : null,
      }),
    });

    const json = await res.json();
    if (!res.ok) return setStatus(`Error: ${json.error ?? "UNKNOWN"}`);

    setStatus("✅ Saved.");
    setGame(json);
  }

  async function remove() {
    if (!teamId) return setStatus("Missing teamId.");
    if (!confirm("Delete this game (and its lineup entries)?")) return;

    setStatus("Deleting...");
    const res = await fetch(`/api/games/${params.id}?teamId=${encodeURIComponent(teamId)}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) return setStatus(`Error: ${json.error ?? "UNKNOWN"}`);

    router.push("/games");
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 900 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Edit Game</h1>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link href="/games">Games</Link>
          <Link href="/players">Players</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
      </header>

      {!game && <p style={{ marginTop: 12 }}>{status || "Loading..."}</p>}

      {game && (
        <section style={{ marginTop: 16, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Date</label>
              <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }} />
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

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={save} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", cursor: "pointer", fontWeight: 700 }}>
              Save
            </button>
            <button onClick={remove} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", cursor: "pointer" }}>
              Delete
            </button>

            <Link href={`/games/${params.id}/lineup`} style={{ marginLeft: "auto", fontWeight: 700 }}>
              Edit Lineup →
            </Link>
          </div>

          {status && <p style={{ marginTop: 10 }}>{status}</p>}
        </section>
      )}
    </main>
  );
}
