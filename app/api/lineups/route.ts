export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireTeamRole } from "@/lib/rbac";

const Entry = z.object({
  playerId: z.string(),
  position: z.enum(["C", "LW", "RW", "LD", "RD", "G", "OTHER"]),
  line: z.number().int().min(0).nullable().optional(),
  goals: z.number().int().min(0).default(0),
  assists: z.number().int().min(0).default(0),
  penalties: z.number().int().min(0).default(0),
  shutout: z.boolean().default(false),
});

const SaveLineup = z.object({
  teamId: z.string(),
  gameId: z.string(),
  entries: z.array(Entry),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");
  const gameId = searchParams.get("gameId");

  if (!teamId || !gameId) {
    return NextResponse.json({ error: "teamId and gameId required" }, { status: 400 });
  }

  await requireTeamRole(teamId, "VIEWER");

  const [game, players, entries] = await Promise.all([
    db.game.findFirst({ where: { id: gameId, teamId } }),
    db.player.findMany({ where: { teamId }, orderBy: [{ number: "asc" }, { name: "asc" }] }),
    db.lineupEntry.findMany({ where: { teamId, gameId } }),
  ]);

  if (!game) return NextResponse.json({ error: "GAME_NOT_FOUND" }, { status: 404 });

  return NextResponse.json({ game, players, entries });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const input = SaveLineup.parse(body);

  await requireTeamRole(input.teamId, "ADMIN");

  // Replace lineup atomically
  await db.$transaction([
    db.lineupEntry.deleteMany({ where: { teamId: input.teamId, gameId: input.gameId } }),
    db.lineupEntry.createMany({
      data: input.entries.map((e) => ({
        teamId: input.teamId,
        gameId: input.gameId,
        playerId: e.playerId,
        position: e.position,
        line: e.line ?? null,
        goals: e.goals ?? 0,
        assists: e.assists ?? 0,
        penalties: e.penalties ?? 0,
        shutout: e.shutout ?? false,
      })),
    }),
  ]);

  const saved = await db.lineupEntry.findMany({
    where: { teamId: input.teamId, gameId: input.gameId },
    include: { player: true },
    orderBy: [{ player: { name: "asc" } }],
  });

  return NextResponse.json({ ok: true, entries: saved });
}
