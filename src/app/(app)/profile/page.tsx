import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { FolderOpen, LayoutGrid } from "lucide-react";

import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { TypeBreakdown } from "@/components/profile/TypeBreakdown";
import { StatCard } from "@/components/dashboard/StatCard";
import { getDashboardStats } from "@/lib/db/collections";
import { getSidebarItemTypes } from "@/lib/db/items";
import { getProfileUser } from "@/lib/db/profile";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  await connection();

  const [user, stats, itemTypes] = await Promise.all([
    getProfileUser(),
    getDashboardStats(),
    getSidebarItemTypes(),
  ]);

  if (!user) redirect("/sign-in");

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Your account details and usage
        </p>
      </header>

      <ProfileHeader user={user} />

      <ProfileSection title="Usage" description="What you have stored so far.">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard icon={LayoutGrid} label="Items" value={stats.items} />
            <StatCard
              icon={FolderOpen}
              label="Collections"
              value={stats.collections}
            />
          </div>
          <TypeBreakdown types={itemTypes} />
        </div>
      </ProfileSection>

      {user.hasPassword ? (
        <ProfileSection
          title="Change password"
          description="Enter your current password, then choose a new one."
        >
          <ChangePasswordForm email={user.email ?? ""} />
        </ProfileSection>
      ) : null}

      <ProfileSection
        title="Delete account"
        description="Permanently delete your account and everything in it."
        tone="destructive"
      >
        <DeleteAccountDialog
          itemCount={stats.items}
          collectionCount={stats.collections}
        />
      </ProfileSection>
    </div>
  );
}
