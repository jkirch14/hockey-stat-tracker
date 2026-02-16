"use client";

import { useEffect, useState } from "react";

type BootstrapResult =
  | { teamId: string; created: boolean; role: string; teamName: string }
  | { error: string };

export default function DashboardPage() {
  const [data, setData] = useState<BootstrapResult | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/bootstrap", { method: "POST" });
      const json = (await res.json()) as BootstrapResult;
      setData(json);
      if (!("error" in json)) localStorage.setItem("teamId", json.teamId);
    })();
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Dashboard</h1>

      {!data && <p>Setting up your team…</p>}

      {data && "error" in data && (
        <p style={{ color: "crimson" }}>
          Error: {data.error}
        </p>
      )}

      {data && !("error" in data) && (
        <div style={{ marginTop: 16 }}>
          <p>
            Team: <b>{data.teamName}</b>
          </p>
          <p>
            Team ID: <code>{data.teamId}</code>
          </p>
          <p>
            Role: <b>{data.role}</b>
          </p>
          <p>{data.created ? "✅ Created your first team." : "✅ Found your existing team."}</p>

          <p style={{ marginTop: 16 }}>
            Next: we’ll add Players, Games, Lineups, and the stats dashboard.
          </p>
        </div>
      )}
    </main>
  );
}
