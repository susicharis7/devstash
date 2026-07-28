import { CAPABILITIES } from "@/components/landing/landing-content";

export function CapabilityGrid() {
  return (
    <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
      {CAPABILITIES.map((capability) => (
        <div key={capability.title}>
          <h3 className="font-medium">{capability.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {capability.body}
          </p>
        </div>
      ))}
    </div>
  );
}
