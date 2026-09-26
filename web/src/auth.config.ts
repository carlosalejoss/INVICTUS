import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe half of the Auth.js config (no bcrypt/Prisma imports) -- used directly by
 * middleware.ts, which runs on the Edge runtime. The Node-only Credentials provider is added on
 * top of this in auth.ts, which is only ever used from Node.js runtime code (API route, server
 * actions/components).
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.username = (user as unknown as { username: string }).username;
        token.role = (user as unknown as { role: string }).role;
        token.captainOf = (user as unknown as { captainOf: string[] }).captainOf;
        token.memberOf = (user as unknown as { memberOf: string[] }).memberOf;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as "JUGADOR" | "CAPITAN" | "DIRECTIVA";
        session.user.captainOf = (token.captainOf as string[]) ?? [];
        session.user.memberOf = (token.memberOf as string[]) ?? [];
      }
      return session;
    },
  },
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: "JUGADOR" | "CAPITAN" | "DIRECTIVA";
      captainOf: string[];
      memberOf: string[];
      name?: string | null;
    };
  }
}
