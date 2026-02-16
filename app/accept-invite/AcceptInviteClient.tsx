"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function AcceptInviteClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const token = sp.get("token") ?? "";
  const [msg, setMsg] = useState<string>("");

  async function accept() {
    setMsg("Accepting invite...");
    const res = await fetch("/api/invites/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const json = await res.json();

    if (!res.ok) {
      setMsg(`Error: ${json.error ?? "UNKNOWN"}`);
      return;
    }

    setMsg("✅ Invite accepted! Redirecting to dashboard...");
    setTimeout(() => router.push("/dashboard"), 800);
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Accept Invite</h1>

      {!token && <p style={{ color: "crimson" }}>Missing token.</p>}

      {token && (
        <>
          <p>Click below to accept the invite.</p>
          <button
            onClick={accept}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ccc",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Accept Invite
          </button>
        </>
      )}

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </main>
  );
}
