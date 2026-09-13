import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SERIES_STATUSES, type SeriesStatus } from "@/types/models";

/** Small step indicator for the production workflow. */
export function WorkflowSteps({ status, className }: { status: SeriesStatus; className?: string }) {
  const current = SERIES_STATUSES.indexOf(status);
  return (
    <ol className={cn("flex flex-wrap items-center gap-x-3 gap-y-2", className)}>
      {SERIES_STATUSES.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border text-[11px]",
                done && "border-accent bg-accent/20 text-accent",
                active && "border-primary bg-primary text-primary-foreground",
                !done && !active && "border-border text-muted-foreground",
              )}
            >
              {done ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            <span
              className={cn(
                "text-xs",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {step}
            </span>
            {i < SERIES_STATUSES.length - 1 && (
              <span className="hidden h-px w-6 bg-border sm:block" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
