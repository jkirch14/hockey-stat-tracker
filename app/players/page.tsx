"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Player = {
  id: string;
  name: string;
  number: number | null;
  shootSide: "LEFT" | "RIGHT" | null;
  parentsName: string | null;
};

export default function PlayersPage() {
  const [teamId, setTeamId] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [status, setStatus] = useState("");

  // form
  const [name, setName] = useState("");
  const [number, setNumber] = useState<string>("");
  const [shootSide, setShootSide] = useState<"" | "LEFT" | "RIGHT">("");
  const [parentsName, setParentsName] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("teamId") ?? "";
    setTeamId(stored);
  }, []);

  async function load() {
    if (!teamId) {
      setStatus("Missing teamId. Visit /dashboard first.");
      return;
    }
    setStatus("Loading players...");
    const res = await fetch(`/api/players?teamId=${encodeURIComponent(teamId)}`);
    const json = await res.json();
    if (!res.ok) {
      setStatus(`Error: ${json.error ?? "UNKNOWN"}`);
      return;
    }
    setPlayers(json);
    setStatus("");
  }

  useEffect(() => {
    if (teamId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  async function addPlayer() {
    setStatus("");

    if (!teamId) return setStatus("Missing teamId. Visit /dashboard first.");
    if (!name.trim()) return setStatus("Name is required.");

    const payload: any = {
      teamId,
      name: name.trim(),
      parentsName: parentsName.trim() || undefined,
      shootSide: shootSide || undefined,
    };

    if (number.trim()) payload.number = Number(number);

    setStatus("Adding player...");
    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      setStatus(`Error: ${json.error ?? "UNKNOWN"}`);
      return;
    }

    setName("");
    setNumber("");
    setShootSide("");
    setParentsName("");
    await load();
    setStatus("✅ Player added.");
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 900 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Players</h1>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/admin/sharing">Sharing</Link>
        </nav>
      </header>

      <section style={{ marginTop: 16, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Add player</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 160px", gap: 12, marginTop: 10 }}>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
              placeholder="Player name"
            />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Number</label>
            <input
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
              placeholder="e.g. 12"
            />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Shoot side</label>
            <select
              value={shootSide}
              onChange={(e) => setShootSide(e.target.value as any)}
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
            >
              <option value="">(not set)</option>
              <option value="LEFT">Left</option>
              <option value="RIGHT">Right</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Parents names</label>
          <input
            value={parentsName}
            onChange={(e) => setParentsName(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
            placeholder="Optional"
          />
        </div>

        <button
          onClick={addPlayer}
          style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", cursor: "pointer", fontWeight: 700 }}
        >
          Add Player
        </button>

        {status && <p style={{ marginTop: 10 }}>{status}</p>}
      </section>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Roster</h2>

        <div style={{ marginTop: 10, border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 140px 1fr 120px", gap: 0, fontWeight: 700, padding: 12, background: "#f7f7f7" }}>
            <div>#</div>
            <div>Name</div>
            <div>Shoots</div>
            <div>Parents</div>
            <div></div>
          </div>

          {players.map((p) => (
            <div key={p.id} style={{ display: "grid", gridTemplateColumns: "100px 1fr 140px 1fr 120px", padding: 12, borderTop: "1px solid #eee" }}>
              <div>{p.number ?? ""}</div>
              <div>{p.name}</div>
              <div>{p.shootSide ?? ""}</div>
              <div style={{ opacity: 0.9 }}>{p.parentsName ?? ""}</div>
              <div>
                <Link href={`/players/${p.id}`} style={{ fontWeight: 700 }}>
                  Edit
                </Link>
              </div>
            </div>
          ))}

          {players.length === 0 && <div style={{ padding: 12 }}>No players yet.</div>}
        </div>
      </section>
    </main>
  );
}
