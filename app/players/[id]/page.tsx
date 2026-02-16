"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Player = {
  id: string;
  name: string;
  number: number | null;
  shootSide: "LEFT" | "RIGHT" | null;
  parentsName: string | null;
};

export default function PlayerEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [teamId, setTeamId] = useState("");
  const [player, setPlayer] = useState<Player | null>(null);
  const [status, setStatus] = useState("");

  const [name, setName] = useState("");
  const [number, setNumber] = useState<string>("");
  const [shootSide, setShootSide] = useState<"" | "LEFT" | "RIGHT">("");
  const [parentsName, setParentsName] = useState("");

  useEffect(() => {
    setTeamId(localStorage.getItem("teamId") ?? "");
  }, []);

  async function load() {
    if (!teamId) return setStatus("Missing teamId. Visit /dashboard first.");
    setStatus("Loading...");
    const res = await fetch(`/api/players/${params.id}?teamId=${encodeURIComponent(teamId)}`);
    const json = await res.json();
    if (!res.ok) return setStatus(`Error: ${json.error ?? "UNKNOWN"}`);

    setPlayer(json);
    setName(json.name ?? "");
    setNumber(json.number?.toString() ?? "");
    setShootSide(json.shootSide ?? "");
    setParentsName(json.parentsName ?? "");
    setStatus("");
  }

  useEffect(() => {
    if (teamId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  async function save() {
    if (!teamId) return setStatus("Missing teamId.");
    if (!name.trim()) return setStatus("Name is required.");

    setStatus("Saving...");

    const res = await fetch(`/api/players/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamId,
        name: name.trim(),
        number: number.trim() ? Number(number) : null,
        shootSide: shootSide || null,
        parentsName: parentsName.trim() ? parentsName.trim() : null,
      }),
    });

    const json = await res.json();
    if (!res.ok) return setStatus(`Error: ${json.error ?? "UNKNOWN"}`);

    setStatus("✅ Saved.");
    setPlayer(json);
  }

  async function remove() {
    if (!teamId) return setStatus("Missing teamId.");
    if (!confirm("Delete this player?")) return;

    setStatus("Deleting...");
    const res = await fetch(`/api/players/${params.id}?teamId=${encodeURIComponent(teamId)}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!res.ok) return setStatus(`Error: ${json.error ?? "UNKNOWN"}`);

    router.push("/players");
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 720 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Edit Player</h1>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link href="/players">Players</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
      </header>

      {!player && <p style={{ marginTop: 12 }}>{status || "Loading..."}</p>}

      {player && (
        <section style={{ marginTop: 16, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }} />
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Number</label>
              <input value={number} onChange={(e) => setNumber(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 12, marginTop: 12 }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Shoot side</label>
              <select value={shootSide} onChange={(e) => setShootSide(e.target.value as any)} style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}>
                <option value="">(not set)</option>
                <option value="LEFT">Left</option>
                <option value="RIGHT">Right</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Parents names</label>
              <input value={parentsName} onChange={(e) => setParentsName(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={save} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", cursor: "pointer", fontWeight: 700 }}>
              Save
            </button>
            <button onClick={remove} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", cursor: "pointer" }}>
              Delete
            </button>
          </div>

          {status && <p style={{ marginTop: 10 }}>{status}</p>}
        </section>
      )}
    </main>
  );
}
