import { cache } from "react";

import { auth } from "@/auth";

export const getCurrentUserId = cache(async (): Promise<string | null> => {
  const session = await auth();
  return session?.user?.id ?? null;
});
