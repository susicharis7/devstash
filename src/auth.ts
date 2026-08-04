import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";

import authConfig, { authProviders } from "@/auth.config";
import { EmailNotVerifiedError } from "@/lib/auth/errors";
import { prisma } from "@/lib/prisma";
import { signInSchema } from "@/lib/validations/auth";

const DECOY_PASSWORD_HASH =
  "$2b$12$87sl81Wh.f7VC7MRnPEAVeJdLhs2MMk3gZyE70C8aAFHo7pgnTtv2";

async function authorizeCredentials(credentials: unknown) {
  const parsed = signInSchema.safeParse(credentials);
  if (!parsed.success) return null;

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      password: true,
      emailVerified: true,
    },
  });

  const passwordMatches = await bcrypt.compare(
    parsed.data.password,
    user?.password ?? DECOY_PASSWORD_HASH
  );

  if (!user?.password || !passwordMatches) return null;

  if (!user.emailVerified) throw new EmailNotVerifiedError();

  return { id: user.id, name: user.name, email: user.email, image: user.image };
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: authProviders(authorizeCredentials),
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
