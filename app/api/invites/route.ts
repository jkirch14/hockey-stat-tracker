export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireTeamRole } from "@/lib/rbac";
import crypto from "crypto";

const CreateInvite = z.object({
  teamId: z.string(),
  email: z.string().email(),
  role: z.enum(["VIEWER", "ADMIN"]).default("VIEWER"),
});

export async function POST(req: Request) {
  const body = await req.json();
  const input = CreateInvite.parse(body);

  await requireTeamRole(input.teamId, "ADMIN");

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  const invite = await db.teamInvite.create({
    data: {
      teamId: input.teamId,
      email: input.email.toLowerCase(),
      role: input.role,
      token,
      expiresAt,
    },
  });

  // For now we return the link; later you can email it.
  return NextResponse.json({
    inviteId: invite.id,
    inviteLink: `/accept-invite?token=${token}`,
    expiresAt,
  });
}
