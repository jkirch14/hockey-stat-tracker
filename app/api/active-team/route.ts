export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const COOKIE = "activeTeamId";

export async function GET() {
  const c = await cookies();
  return NextResponse.json({ teamId: c.get(COOKIE)?.value ?? null });
}

export async function POST(req: Request) {
  const session = await auth();
  const uid = (session?.user as any)?.id as string | undefined;
  if (!uid) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const body = await req.formData();
  const teamId = String(body.get("teamId") ?? "");
  const redirectTo = String(body.get("redirectTo") ?? "/dashboard");

  if (!teamId) return NextResponse.json({ error: "teamId required" }, { status: 400 });

  // Ensure user is a member of that team
  const membership = await db.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: uid } },
    select: { role: true },
  });

  if (!membership) {
    return NextResponse.redirect(new URL(`/no-access?teamId=${encodeURIComponent(teamId)}`, req.url));
  }

  const res = NextResponse.redirect(new URL(redirectTo, req.url));
  res.cookies.set(COOKIE, teamId, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
  });

  return res;
}
