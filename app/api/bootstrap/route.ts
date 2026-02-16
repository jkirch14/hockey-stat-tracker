import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST() {
  const session = await auth();
  const uid = (session?.user as any)?.id as string | undefined;
  if (!uid) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  // If user already has a team membership, return it
  const existingMembership = await db.teamMember.findFirst({
    where: { userId: uid },
    include: { team: true },
  });

  if (existingMembership) {
    return NextResponse.json({
      teamId: existingMembership.teamId,
      created: false,
      role: existingMembership.role,
      teamName: existingMembership.team.name,
    });
  }

  // Create first team and make user OWNER
  const team = await db.team.create({
    data: {
      name: "My Hockey Team",
      ownerId: uid,
      members: {
        create: {
          userId: uid,
          role: "OWNER",
        },
      },
    },
  });

  
  return NextResponse.json({ teamId: team.id, created: true, role: "OWNER", teamName: team.name });
}

export const runtime = "nodejs";
