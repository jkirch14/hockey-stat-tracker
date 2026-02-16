export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireTeamRole } from "@/lib/rbac";
import { handleApiError } from "@/lib/api";

export async function GET(req: Request) {
    try {
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");
  const playerId = searchParams.get("playerId");

  if (!teamId || !playerId) {
    return NextResponse.json({ error: "teamId and playerId required" }, { status: 400 });
  }

  await requireTeamRole(teamId, "VIEWER");

  const player = await db.player.findFirst({
    where: { id: playerId, teamId },
    select: { id: true, name: true, number: true, shootSide: true, parentsName: true },
  });
  if (!player) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const [totalsAgg, posAgg, gameLog, pogCount, shutouts] = await Promise.all([
    db.lineupEntry.aggregate({
      where: { teamId, playerId },
      _sum: { goals: true, assists: true, penalties: true },
      _count: { gameId: true },
    }),
    db.lineupEntry.groupBy({
      by: ["position"],
      where: { teamId, playerId },
      _sum: { goals: true, assists: true, penalties: true },
      _count: { gameId: true },
    }),
    db.lineupEntry.findMany({
      where: { teamId, playerId },
      include: {
        game: { select: { id: true, date: true, opponent: true, league: true, result: true, goalsFor: true, goalsAgainst: true } },
      },
      orderBy: [{ game: { date: "desc" } }],
    }),
    db.game.count({ where: { teamId, playerOfGameId: playerId } }),
    db.lineupEntry.findMany({
      where: { teamId, playerId, position: "G", shutout: true },
      select: { gameId: true },
      distinct: ["gameId"],
    }),
  ]);

  const goals = totalsAgg._sum.goals ?? 0;
  const assists = totalsAgg._sum.assists ?? 0;
  const penalties = totalsAgg._sum.penalties ?? 0;
  const games = totalsAgg._count.gameId ?? 0;

  const perPosition = posAgg
    .map((r) => {
      const g = r._sum.goals ?? 0;
      const a = r._sum.assists ?? 0;
      const p = r._sum.penalties ?? 0;
      return { position: r.position, games: r._count.gameId, goals: g, assists: a, points: g + a, penalties: p };
    })
    .sort((a, b) => b.games - a.games);

  const log = gameLog.map((e) => ({
    gameId: e.gameId,
    date: e.game.date,
    opponent: e.game.opponent,
    league: e.game.league,
    result: e.game.result,
    score: `${e.game.goalsFor}-${e.game.goalsAgainst}`,
    position: e.position,
    line: e.line,
    goals: e.goals,
    assists: e.assists,
    points: (e.goals ?? 0) + (e.assists ?? 0),
    penalties: e.penalties,
    shutout: e.shutout,
  }));

  return NextResponse.json({
    teamId,
    player,
    totals: {
      games,
      goals,
      assists,
      points: goals + assists,
      penalties,
      shutouts: shutouts.length,
      playerOfGame: pogCount,
    },
    perPosition,
    gameLog: log,
  });
    } catch (err: any) {
      return handleApiError(err);
    }
}
