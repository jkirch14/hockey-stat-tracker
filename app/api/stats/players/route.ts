export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireTeamRole } from "@/lib/rbac";
import { handleApiError } from "@/lib/api";

export async function GET(req: Request) {
    try {
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");
  if (!teamId) return NextResponse.json({ error: "teamId required" }, { status: 400 });

  await requireTeamRole(teamId, "VIEWER");

  // Base roster
  const players = await db.player.findMany({
    where: { teamId },
    select: { id: true, name: true, number: true, shootSide: true },
    orderBy: [{ number: "asc" }, { name: "asc" }],
  });

  // Aggregate totals by playerId
  const totalsByPlayer = await db.lineupEntry.groupBy({
    by: ["playerId"],
    where: { teamId },
    _sum: { goals: true, assists: true, penalties: true },
    _count: { gameId: true },
  });

  // Shutouts by goalie (count distinct games where shutout=true)
  const shutoutGames = await db.lineupEntry.findMany({
    where: { teamId, position: "G", shutout: true },
    select: { playerId: true, gameId: true },
    distinct: ["playerId", "gameId"],
  });

  const shutoutsByPlayer: Record<string, number> = {};
  for (const s of shutoutGames) shutoutsByPlayer[s.playerId] = (shutoutsByPlayer[s.playerId] ?? 0) + 1;

  // Player of the game counts
  const pogCounts = await db.game.groupBy({
    by: ["playerOfGameId"],
    where: { teamId, playerOfGameId: { not: null } },
    _count: { _all: true },
  });
  const pogByPlayer: Record<string, number> = {};
  for (const row of pogCounts) {
    if (row.playerOfGameId) pogByPlayer[row.playerOfGameId] = row._count._all;
  }

  // Positions played + per-position stats
  const posAgg = await db.lineupEntry.groupBy({
    by: ["playerId", "position"],
    where: { teamId },
    _sum: { goals: true, assists: true, penalties: true },
    _count: { gameId: true },
  });

  const positionsByPlayer: Record<string, Set<string>> = {};
  const perPosByPlayer: Record<
    string,
    Array<{ position: string; games: number; goals: number; assists: number; points: number; penalties: number }>
  > = {};

  for (const row of posAgg) {
    positionsByPlayer[row.playerId] ??= new Set();
    positionsByPlayer[row.playerId].add(row.position);

    perPosByPlayer[row.playerId] ??= [];
    const goals = row._sum.goals ?? 0;
    const assists = row._sum.assists ?? 0;
    const penalties = row._sum.penalties ?? 0;

    perPosByPlayer[row.playerId].push({
      position: row.position,
      games: row._count.gameId,
      goals,
      assists,
      points: goals + assists,
      penalties,
    });
  }

  // Map totals lookup
  const totalsMap: Record<string, any> = {};
  for (const t of totalsByPlayer) {
    totalsMap[t.playerId] = {
      games: t._count.gameId,
      goals: t._sum.goals ?? 0,
      assists: t._sum.assists ?? 0,
      penalties: t._sum.penalties ?? 0,
    };
  }

  const rows = players.map((p) => {
    const t = totalsMap[p.id] ?? { games: 0, goals: 0, assists: 0, penalties: 0 };
    const points = t.goals + t.assists;

    const positions = Array.from(positionsByPlayer[p.id] ?? []);
    const perPosition = (perPosByPlayer[p.id] ?? []).sort((a, b) => b.games - a.games);

    return {
      id: p.id,
      name: p.name,
      number: p.number,
      shootSide: p.shootSide,
      totals: {
        games: t.games,
        goals: t.goals,
        assists: t.assists,
        points,
        penalties: t.penalties,
        shutouts: shutoutsByPlayer[p.id] ?? 0,
        playerOfGame: pogByPlayer[p.id] ?? 0,
      },
      positions,
      perPosition,
    };
  });

  // default sort: points desc, then goals desc
  rows.sort((a, b) => b.totals.points - a.totals.points || b.totals.goals - a.totals.goals);

  return NextResponse.json({ teamId, players: rows });
  } catch (err: any) {
    return handleApiError(err);
  }
}
