export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/rbac";

const Accept = z.object({ token: z.string().min(10) });

export async function POST(req: Request) {
  const uid = await requireUserId();
  const body = await req.json();
  const { token } = Accept.parse(body);

  const invite = await db.teamInvite.findUnique({ where: { token } });
  if (!invite) return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 400 });
  if (invite.acceptedAt) return NextResponse.json({ error: "ALREADY_USED" }, { status: 400 });
  if (invite.expiresAt < new Date()) return NextResponse.json({ error: "EXPIRED" }, { status: 400 });

  const user = await db.user.findUnique({ where: { id: uid } });
  if (!user?.email) return NextResponse.json({ error: "NO_EMAIL" }, { status: 400 });

  if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return NextResponse.json({ error: "EMAIL_MISMATCH" }, { status: 403 });
  }

  await db.$transaction([
    db.teamMember.upsert({
      where: { teamId_userId: { teamId: invite.teamId, userId: uid } },
      update: { role: invite.role },
      create: { teamId: invite.teamId, userId: uid, role: invite.role },
    }),
    db.teamInvite.update({
      where: { token },
      data: { acceptedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true, teamId: invite.teamId, role: invite.role });
}
