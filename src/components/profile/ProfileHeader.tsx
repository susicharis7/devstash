import { CalendarDays } from "lucide-react";

import { GitHubIcon } from "@/components/icons/GitHubIcon";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/user/UserAvatar";
import type { ProfileUser } from "@/lib/db/profile";

const joinedFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function ProfileHeader({ user }: { user: ProfileUser }) {
  return (
    <section className="flex flex-col gap-5 rounded-xl border bg-card p-6 sm:flex-row sm:items-center">
      <UserAvatar user={user} className="size-16 shrink-0 text-xl" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold break-words">
            {user.name ?? "Account"}
          </h2>
          <Badge variant="secondary" className="gap-1.5">
            {user.hasPassword ? null : <GitHubIcon className="size-3" />}
            {user.hasPassword ? "Email account" : "GitHub account"}
          </Badge>
        </div>
        <p className="mt-1 text-sm break-words text-muted-foreground">
          {user.email}
        </p>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5 shrink-0" />
          Joined {joinedFormatter.format(new Date(user.createdAt))}
        </p>
      </div>
    </section>
  );
}
