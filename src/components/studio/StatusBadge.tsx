import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground border-border",
  "Needs Review": "bg-gold/15 text-gold-foreground border-gold/30",
  Outlined: "bg-muted text-muted-foreground border-border",
  Scripted: "bg-gold/15 text-gold-foreground border-gold/30",
  "Story Approved": "bg-gold/15 text-gold-foreground border-gold/30",
  "Characters Approved": "bg-gold/20 text-gold-foreground border-gold/40",
  "Script Approved": "bg-accent/15 text-accent border-accent/30",
  Approved: "bg-accent/15 text-accent border-accent/30",
  Locked: "bg-accent/25 text-accent border-accent/40",
  "Ready for Media": "bg-accent text-accent-foreground border-accent",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide",
        TONES[status] ?? "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      {status}
    </span>
  );
}
