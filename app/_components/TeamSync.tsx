"use client";

import { useEffect } from "react";

export default function TeamSync({ teamId }: { teamId: string | null }) {
  useEffect(() => {
    if (teamId) localStorage.setItem("teamId", teamId);
  }, [teamId]);

  return null;
}
