"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type Player = { id: string; name: string; number: number | null };
type Game = { id: string; date: string; opponent: string; league: string | null };
type Entry = {
  playerId: string;
  position: "C" | "LW" | "RW" | "LD" | "RD" | "G" | "OTHER";
  lineText: string; // <-- add this
  goals: number;
  assists: number;
  penalties: number;
  shutout: boolean;
};

const POSITIONS: Entry["position"][] = ["C", "LW", "RW", "LD", "RD", "G", "OTHER"];

export default function LineupEditorPage() {
  const params = useParams<{ id: string }>();
  const gameId = params.id;

  const [teamId, setTeamId] = useState("");
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [status, setStatus] = useState("");

  // UI state: map playerId -> entry (if included)
  const [map, setMap] = useState<Record<string, Entry>>({});

  const includedCount = useMemo(() => Object.keys(map).length, [map]);

  useEffect(() => {
    setTeamId(localStorage.getItem("teamId") ?? "");
  }, []);

  async function load() {
    if (!teamId) return setStatus("Missing teamId. Visit /dashboard first.");
    setStatus("Loading lineup...");

    const res = await fetch(`/api/lineups?teamId=${encodeURIComponent(teamId)}&gameId=${encodeURIComponent(gameId)}`);
    const json = await res.json();

    if (!res.ok) {
      setStatus(`Error: ${json.error ?? "UNKNOWN"}`);
      return;
    }

    setGame(json.game);
    setPlayers(json.players);

    const next: Record<string, Entry> = {};
    for (const e of json.entries as any[]) {
    next[e.playerId] = {
        playerId: e.playerId,
        position: e.position,
        lineText: e.line === null || e.line === undefined ? "" : String(e.line),
        goals: e.goals ?? 0,
        assists: e.assists ?? 0,
        penalties: e.penalties ?? 0,
        shutout: !!e.shutout,
    };
    }
    setMap(next);
    setStatus("");
  }

  useEffect(() => {
    if (teamId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  function togglePlayer(playerId: string) {
    setMap((prev) => {
      const copy = { ...prev };
      if (copy[playerId]) {
        delete copy[playerId];
      } else {
            copy[playerId] = {
            playerId,
            position: "OTHER",
            lineText: "",
            goals: 0,
            assists: 0,
            penalties: 0,
            shutout: false,
            };
      }
      return copy;
    });
  }

  function update(playerId: string, patch: Partial<Entry>) {
    setMap((prev) => ({
      ...prev,
      [playerId]: { ...prev[playerId], ...patch },
    }));
  }

  async function save() {
    if (!teamId) return setStatus("Missing teamId.");
    setStatus("Saving lineup...");

    const entries = Object.values(map).map((e) => {
    const trimmed = (e.lineText ?? "").trim();

    let line: number | null = null;
    if (trimmed !== "") {
        const parsed = parseInt(trimmed, 10);
        line = Number.isFinite(parsed) ? parsed : null;
    }

    return {
        playerId: e.playerId,
        position: e.position,
        line,
        goals: e.goals ?? 0,
        assists: e.assists ?? 0,
        penalties: e.penalties ?? 0,
        shutout: e.position === "G" ? !!e.shutout : false,
    };
    });



    const res = await fetch("/api/lineups", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, gameId, entries }),
    });

    const json = await res.json();
    if (!res.ok) return setStatus(`Error: ${json.error ?? "UNKNOWN"}`);

    setStatus(`✅ Saved lineup (${entries.length} players).`);
    await load(); // <-- add this

  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 1100 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Lineup Editor</h1>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link href="/games">Games</Link>
          <Link href={`/games/${gameId}`}>Game</Link>
          <Link href="/players">Players</Link>
        </nav>
      </header>

      {game && (
        <p style={{ marginTop: 8, opacity: 0.9 }}>
          <b>{new Date(game.date).toLocaleString()}</b> vs <b>{game.opponent}</b>
          {game.league ? <> • {game.league}</> : null}
          {" "}• Included: <b>{includedCount}</b>
        </p>
      )}

      <section style={{ marginTop: 14 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={save}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", cursor: "pointer", fontWeight: 800 }}
          >
            Save Lineup
          </button>
          {status && <span>{status}</span>}
        </div>

        <div style={{ marginTop: 12, border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "60px 100px 1fr 140px 100px 90px 90px 90px 90px",
              padding: 12,
              fontWeight: 800,
              background: "#f7f7f7",
            }}
          >
            <div>In</div>
            <div>#</div>
            <div>Name</div>
            <div>Position</div>
            <div>Line</div>
            <div>G</div>
            <div>A</div>
            <div>PIM</div>
            <div>SO</div>
          </div>

          {players.map((p) => {
            const e = map[p.id];
            const included = !!e;

            return (
              <div
                key={p.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 100px 1fr 140px 100px 90px 90px 90px 90px",
                  padding: 12,
                  borderTop: "1px solid #eee",
                  alignItems: "center",
                }}
              >
                <div>
                  <input type="checkbox" checked={included} onChange={() => togglePlayer(p.id)} />
                </div>
                <div>{p.number ?? ""}</div>
                <div>{p.name}</div>

                <div>
                  <select
                    disabled={!included}
                    value={e?.position ?? "OTHER"}
                    onChange={(ev) => update(p.id, { position: ev.target.value as any })}
                    style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
                  >
                    {POSITIONS.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                    <input
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    disabled={!included}
                    value={e?.lineText ?? ""}
                    onChange={(ev) => update(p.id, { lineText: ev.target.value })}
                    style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
                    />
                </div>

                <div>
                  <input
                    disabled={!included}
                    value={e?.goals ?? 0}
                    onChange={(ev) => update(p.id, { goals: Number(ev.target.value || "0") })}
                    style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
                  />
                </div>

                <div>
                  <input
                    disabled={!included}
                    value={e?.assists ?? 0}
                    onChange={(ev) => update(p.id, { assists: Number(ev.target.value || "0") })}
                    style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
                  />
                </div>

                <div>
                  <input
                    disabled={!included}
                    value={e?.penalties ?? 0}
                    onChange={(ev) => update(p.id, { penalties: Number(ev.target.value || "0") })}
                    style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
                  />
                </div>

                <div>
                  <input
                    type="checkbox"
                    disabled={!included || e?.position !== "G"}
                    checked={included && e?.position === "G" ? !!e?.shutout : false}
                    onChange={(ev) => update(p.id, { shutout: ev.target.checked })}
                  />
                </div>
              </div>
            );
          })}

          {players.length === 0 && <div style={{ padding: 12 }}>No players yet. Add players first.</div>}
        </div>
      </section>
    </main>
  );
}
