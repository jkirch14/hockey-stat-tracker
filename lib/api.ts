import { NextResponse } from "next/server";

export function handleApiError(err: any) {
  if (err?.code === "NO_ACCESS") {
    return NextResponse.json({ error: "NO_ACCESS" }, { status: 403 });
  }
  if (err?.message === "UNAUTHENTICATED") {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
  return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
}
