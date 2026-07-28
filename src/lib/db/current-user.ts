import { cache } from "react";

import { prisma } from "@/lib/prisma";
import { DEMO_USER_EMAIL } from "@/lib/db/demo-user";

export const getCurrentUserId = cache(async () => {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
    select: { id: true },
  });

  if (!user) {
    throw new Error(
      `User ${DEMO_USER_EMAIL} not found. Run \`npm run db:seed\` to populate the database.`
    );
  }

  return user.id;
});
