import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { TeamRole } from "@prisma/client";

const rank: Record<TeamRole, number> = { VIEWER: 1, ADMIN: 2, OWNER: 3 };

export async function requireUserId() {
  const session = await auth();
  const uid = (session?.user as any)?.id as string | undefined;
  if (!uid) throw new Error("UNAUTHENTICATED");
  return uid;
}

export async function requireTeamRole(teamId: string, required: TeamRole) {
  const uid = await requireUserId();

  const membership = await db.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId: uid } },
  });

  if (!membership) throw new Error("FORBIDDEN");
  if (rank[membership.role] < rank[required]) throw new Error("FORBIDDEN");

  return { uid, role: membership.role };
}
