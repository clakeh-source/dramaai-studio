import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clapperboard, Film, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/state/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DramaAI Studio — Create short-form AI drama series" },
      {
        name: "description",
        content:
          "Sign in to DramaAI Studio and turn a one-line premise into a full vertical drama series: bible, cast, episodes and scenes.",
      },
      { property: "og:title", content: "DramaAI Studio — Create short-form AI drama series" },
      {
        property: "og:description",
        content: "Turn a one-line premise into a full vertical drama series.",
      },
    ],
  }),
  component: Landing,
});

const HIGHLIGHTS = [
  {
    icon: Sparkles,
    title: "Series bible in one pass",
    body: "Logline, world, themes and a full episode arc from a single premise.",
  },
  {
    icon: Users,
    title: "Consistent cast",
    body: "Character sheets with appearance, wardrobe and continuity rules.",
  },
  {
    icon: Film,
    title: "Scene Studio",
    body: "Shot-by-shot editing with dialogue, camera notes and mood.",
  },
];

function Landing() {
  const { user, ready, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("creator@dramaai.studio");
  const [password, setPassword] = useState("dramaai");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: "/series" });
  }, [ready, user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await signIn(email, password);
      toast.success("Welcome to the studio.");
      navigate({ to: "/series" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign you in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cinema-panel min-h-screen">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
        <section>
          <div className="flex items-center gap-2 text-primary">
            <Clapperboard className="h-5 w-5" />
            <span className="text-sm uppercase tracking-[0.3em]">DramaAI Studio</span>
          </div>
          <h1 className="text-balance-tight mt-8 text-5xl leading-[1.05] sm:text-6xl">
            One premise in.
            <br />
            <span className="text-primary">A whole drama series out.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Write, cast and storyboard vertical short-form drama — series bible, characters,
            episodes and a scene-by-scene studio, all in one place.
          </p>
          <dl className="mt-12 grid gap-6 sm:grid-cols-3">
            {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-xl border border-border/70 bg-card/60 p-5">
                <Icon className="h-5 w-5 text-primary" />
                <dt className="mt-3 text-sm font-medium">{title}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{body}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="lg:pt-10">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-2xl">
            <h2 className="font-display text-2xl">Sign in</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Demo access — any valid email and a 6+ character password works.
            </p>
            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={busy}>
                {busy ? "Opening the studio…" : "Start creating"}
              </Button>
            </form>
            <p className="mt-4 text-xs text-muted-foreground">
              Accounts are stored on this device for V0.1. Real accounts arrive with the cloud
              backend.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
