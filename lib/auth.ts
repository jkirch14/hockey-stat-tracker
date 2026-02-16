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
  error: "/no-access", // shows when signIn() returns false
  },
 callbacks: {
  async signIn({ user }) {
    const email = user.email?.toLowerCase().trim();
    if (!email) return false;

    // Optional allowlist
    const raw = process.env.AUTH_EMAIL_ALLOWLIST ?? "";
    const allowlist = new Set(
      raw
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    );
    if (allowlist.has(email)) return true;

    // Invite-only: allow only if they are a member of at least one team
    const member = await db.teamMember.findFirst({
      where: { user: { email } },
      select: { id: true },
    });

    return !!member;
  },
},
});
