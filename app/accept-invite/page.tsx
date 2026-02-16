import { Suspense } from "react";
import AcceptInviteClient from "./AcceptInviteClient";

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>Loading…</main>}>
      <AcceptInviteClient />
    </Suspense>
  );
}
