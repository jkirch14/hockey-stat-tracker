"use client";

import { useEffect, useMemo, useState } from "react";

type CreateInviteResponse =
  | { inviteId: string; inviteLink: string; expiresAt: string }
  | { error: string };

export default function SharingPage() {
  const [teamId, setTeamId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<"VIEWER" | "ADMIN">("VIEWER");
  const [status, setStatus] = useState<string>("");
  const [inviteUrl, setInviteUrl] = useState<string>("");

  const origin = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("teamId") ?? "";
    setTeamId(stored);
  }, []);

  async function createInvite() {
    setStatus("");
    setInviteUrl("");

    if (!teamId) {
      setStatus("Missing teamId. Visit /dashboard first to initialize your team.");
      return;
    }
    if (!email.trim()) {
      setStatus("Please enter an email address.");
      return;
    }

    setStatus("Creating invite...");

    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, email: email.trim(), role }),
    });

    const json = (await res.json()) as CreateInviteResponse;

    if (!res.ok || "error" in json) {
      setStatus(`Error: ${"error" in json ? json.error : "UNKNOWN"}`);
      return;
    }

    const full = `${origin}${json.inviteLink}`;
    setInviteUrl(full);
    setStatus(`✅ Invite created (expires: ${new Date(json.expiresAt).toLocaleString()})`);
  }

  async function copyInvite() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setStatus("✅ Copied invite link to clipboard.");
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 720 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Admin • Sharing</h1>

      <p style={{ marginTop: 8 }}>
        Invite-only access: create a link and send it to the person you want to add.
      </p>

      <div style={{ marginTop: 18, padding: 16, border: "1px solid #ddd", borderRadius: 12 }}>
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Team ID</label>
          <input
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            placeholder="Visit /dashboard to auto-fill"
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
          />
          <p style={{ marginTop: 6, fontSize: 12, color: "#555" }}>
            Tip: it auto-fills after you load <code>/dashboard</code>.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 12 }}>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Invitee Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@gmail.com"
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
            >
              <option value="VIEWER">Viewer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        <button
          onClick={createInvite}
          style={{
            marginTop: 14,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ccc",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Create Invite Link
        </button>

        {inviteUrl && (
          <div style={{ marginTop: 14 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Invite Link</label>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                readOnly
                value={inviteUrl}
                style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
              />
              <button
                onClick={copyInvite}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #ccc",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {status && <p style={{ marginTop: 12 }}>{status}</p>}
      </div>

      <p style={{ marginTop: 16, fontSize: 13, color: "#555" }}>
        Invitee flow: they open the link, sign in with Google using that email, then click “Accept Invite”.
      </p>
    </main>
  );
}
