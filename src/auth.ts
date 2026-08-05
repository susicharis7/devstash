import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";

import authConfig, { authProviders } from "@/auth.config";
import { EmailNotVerifiedError, RateLimitedError } from "@/lib/auth/errors";
import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, clearRateLimit, getClientIp } from "@/lib/rate-limit";
import { signInSchema } from "@/lib/validations/auth";

const DECOY_PASSWORD_HASH =
  "$2b$12$87sl81Wh.f7VC7MRnPEAVeJdLhs2MMk3gZyE70C8aAFHo7pgnTtv2";

async function authorizeCredentials(credentials: unknown, request: Request) {
  const parsed = signInSchema.safeParse(credentials);
  if (!parsed.success) return null;

  const rateLimitKey = `${getClientIp(request)}:${parsed.data.email}`;
  const limit = await checkRateLimit("signIn", rateLimitKey);
  if (!limit.success) throw new RateLimitedError(limit.retryAfterSeconds);

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

  const passwordMatches = await verifyPassword(
    parsed.data.password,
    user?.password ?? DECOY_PASSWORD_HASH
  );

  if (!user?.password || !passwordMatches) return null;

  if (!user.emailVerified) throw new EmailNotVerifiedError();

  await clearRateLimit("signIn", rateLimitKey);

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
