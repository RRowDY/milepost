import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [GitHub],
  pages: {
    signIn: "/",
  },
  callbacks: {
    session({ session, token, user }) {
      if (session.user) {
        const id = user?.id ?? token?.sub;
        if (id) {
          session.user.id = id;
        }
      }
      return session;
    },
  },
});
