import { toast } from "sonner";

const FALLBACK_MESSAGE = "Too many attempts. Please try again later.";

export function notifyIfRateLimited(response: Response, error?: string) {
  if (response.status !== 429) return false;

  toast.error(error ?? FALLBACK_MESSAGE);
  return true;
}
