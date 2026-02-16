import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
    error: "/no-access",
  },

  callbacks: {
  async signIn({ user }) {
    const email = user.email?.toLowerCase().trim();
    if (!email) return false;

    // Optional allowlist
    const raw = process.env.AUTH_EMAIL_ALLOWLIST ?? "";
    const allowlist = new Set(
      raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
    );
    if (allowlist.has(email)) return true;

    // If already a team member, allow
    const uid = (user as any).id as string | undefined;
    if (uid) {
      const member = await db.teamMember.findFirst({
        where: { userId: uid },
        select: { id: true },
      });
      if (member) return true;
    }

    // Otherwise allow ONLY if there is a pending invite for this email
    const invite = await db.teamInvite.findFirst({
      where: { email },
      select: { id: true },
    });

    return !!invite;
  },
},

});
