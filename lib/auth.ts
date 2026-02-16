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
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      await db.user.upsert({
        where: { email: user.email },
        update: { name: user.name ?? undefined, image: user.image ?? undefined },
        create: { email: user.email, name: user.name ?? undefined, image: user.image ?? undefined },
      });

      return true;
    },
    async jwt({ token }) {
      if (!token.email) return token;

      const dbUser = await db.user.findUnique({
        where: { email: token.email as string },
      });

      if (dbUser) (token as any).uid = dbUser.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && (token as any).uid) {
        (session.user as any).id = (token as any).uid;
      }
      return session;
    },
  },
});
