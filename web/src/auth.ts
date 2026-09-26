import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username;
        const password = credentials?.password;
        if (typeof username !== "string" || typeof password !== "string") return null;

        const user = await prisma.user.findUnique({
          where: { username: username.trim().toLowerCase() },
          include: { memberships: { select: { teamId: true, isCaptain: true } } },
        });
        if (!user || !user.active) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: `${user.nombre} ${user.apellidos}`.trim(),
          username: user.username,
          role: user.role,
          captainOf: user.memberships.filter((m) => m.isCaptain).map((m) => m.teamId),
          memberOf: user.memberships.map((m) => m.teamId),
        };
      },
    }),
  ],
});
