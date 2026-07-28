import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";

type CredentialsAuthorize = NonNullable<
  Parameters<typeof Credentials>[0]
>["authorize"];

export function authProviders(authorize: CredentialsAuthorize) {
  return [
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize,
    }),
  ];
}

export default {
  providers: authProviders(() => null),
  pages: { signIn: "/sign-in" },
} satisfies NextAuthConfig;
