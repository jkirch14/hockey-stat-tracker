export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireTeamRole } from "@/lib/rbac";

const CreatePlayer = z.object({
  teamId: z.string(),
  name: z.string().min(1),
  number: z.number().int().optional(),
  shootSide: z.enum(["LEFT", "RIGHT"]).optional(),
  parentsName: z.string().optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");
  if (!teamId) return NextResponse.json({ error: "teamId required" }, { status: 400 });

  await requireTeamRole(teamId, "VIEWER");

  const players = await db.player.findMany({
    where: { teamId },
    orderBy: [{ number: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(players);
}

export async function POST(req: Request) {
  const body = await req.json();
  const input = CreatePlayer.parse(body);

  await requireTeamRole(input.teamId, "ADMIN");

  const player = await db.player.create({ data: input });
  return NextResponse.json(player);
}
