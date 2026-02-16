import Link from "next/link";

export default function NoAccessPage({
  searchParams,
}: {
  searchParams?: { teamId?: string };
}) {
  const teamId = searchParams?.teamId;

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif", maxWidth: 760 }}>
      <h1 style={{ fontSize: 28, fontWeight: 950, margin: 0 }}>No access</h1>

      <p style={{ marginTop: 10, opacity: 0.85 }}>
        You’re signed in, but you don’t have access to this team.
      </p>

      {teamId ? (
        <p style={{ opacity: 0.75 }}>
          Team ID: <code>{teamId}</code>
        </p>
      ) : null}

      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/dashboard" style={{ fontWeight: 900 }}>
          Go to Dashboard
        </Link>
        <Link href="/admin/sharing" style={{ fontWeight: 900 }}>
          Request an invite link
        </Link>
        <a href="/api/auth/signout" style={{ fontWeight: 900 }}>
          Sign out
        </a>
      </div>

      <div style={{ marginTop: 18, padding: 14, borderRadius: 14, border: "1px solid #eee", background: "#fafafa" }}>
        <div style={{ fontWeight: 900 }}>How to get access</div>
        <ul style={{ marginTop: 8, opacity: 0.8 }}>
          <li>Ask the team owner/admin to send you an invite.</li>
          <li>Open the invite link and accept it (you must be signed in).</li>
        </ul>
      </div>
    </main>
  );
}
