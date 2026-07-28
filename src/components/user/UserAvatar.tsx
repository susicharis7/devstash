import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface AvatarUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export function getInitials({ name, email }: AvatarUser) {
  const source = name?.trim() || email?.trim();
  if (!source) return "?";

  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return (initials || source[0]).toUpperCase();
}

export function UserAvatar({
  user,
  className,
}: {
  user: AvatarUser;
  className?: string;
}) {
  const label = user.name ?? user.email ?? "User";

  return (
    <Avatar className={cn("size-8", className)}>
      {user.image ? <AvatarImage src={user.image} alt={label} /> : null}
      <AvatarFallback>{getInitials(user)}</AvatarFallback>
    </Avatar>
  );
}
