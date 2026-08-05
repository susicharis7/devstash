import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/db/current-user";

export interface ProfileUser {
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: string;
  hasPassword: boolean;
}

export async function getProfileUser(): Promise<ProfileUser | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      image: true,
      createdAt: true,
      password: true,
    },
  });
  if (!user) return null;

  return {
    name: user.name,
    email: user.email,
    image: user.image,
    createdAt: user.createdAt.toISOString(),
    hasPassword: user.password !== null,
  };
}
