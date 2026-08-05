"use client";

import { useState } from "react";
import { TriangleAlert } from "lucide-react";

import { deleteAccountAction } from "@/actions/account";
import { AuthError } from "@/components/auth/AuthError";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function DeleteAccountDialog({
  itemCount,
  collectionCount,
}: {
  itemCount: number;
  collectionCount: number;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleDelete(event: React.MouseEvent) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const result = await deleteAccountAction();
      if (!result.success) {
        setError(result.error ?? "Could not delete the account");
        setIsPending(false);
      }
    } catch {
      setError("Could not reach the server. Try again.");
      setIsPending(false);
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) setError(null);
  }

  return (
    <AlertDialog onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <TriangleAlert />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes your account along with {itemCount}{" "}
            {itemCount === 1 ? "item" : "items"} and {collectionCount}{" "}
            {collectionCount === 1 ? "collection" : "collections"}. This cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? <AuthError message={error} /> : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting…" : "Delete account"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
