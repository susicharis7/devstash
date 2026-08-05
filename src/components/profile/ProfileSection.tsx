import { cn } from "@/lib/utils";

export function ProfileSection({
  title,
  description,
  children,
  tone = "default",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  tone?: "default" | "destructive";
}) {
  const destructive = tone === "destructive";

  return (
    <section
      className={cn(
        "rounded-xl border bg-card p-6",
        destructive && "border-destructive/30"
      )}
    >
      <h2
        className={cn("text-lg font-semibold", destructive && "text-destructive")}
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}
