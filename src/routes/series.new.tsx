import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/studio/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { GENERATION_STEPS } from "@/services/generation";
import { useStudio } from "@/state/studio";
import { VISUAL_STYLES, type AspectFormat, type CreateSeriesInput, type VisualStyle } from "@/types/models";

export const Route = createFileRoute("/series/new")({
  head: () => ({
    meta: [
      { title: "Create a series — DramaAI Studio" },
      {
        name: "description",
        content: "Describe your premise and generate a series bible, cast and first episode.",
      },
      { property: "og:title", content: "Create a series — DramaAI Studio" },
      { property: "og:description", content: "Describe your premise, generate the whole series." },
    ],
  }),
  component: CreateSeries,
});

const GENRES = ["Romantic Thriller", "Revenge Drama", "Billionaire Romance", "Family Saga", "Supernatural", "Crime"];
const AUDIENCES = ["Teens 13–17", "Adults 18–34", "Adults 25–49", "All audiences"];
const LANGUAGES = ["English (UK)", "English (US)", "Spanish", "Portuguese", "French", "Hindi"];
const STEP_LABELS = ["Premise", "Format", "Generate"];

function CreateSeries() {
  const { createSeries, applyGeneration } = useStudio();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const started = useRef(false);

  const [form, setForm] = useState<CreateSeriesInput>({
    title: "",
    premise: "",
    genre: GENRES[0],
    audience: AUDIENCES[1],
    language: LANGUAGES[0],
    episodeCount: 10,
    episodeDuration: 90,
    visualStyle: "Cinematic Realistic",
    format: "9:16",
  });

  const set = <K extends keyof CreateSeriesInput>(k: K, v: CreateSeriesInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (step !== 2 || started.current) return;
    started.current = true;
    const series = createSeries(form);
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setPhase(Math.min(i, GENERATION_STEPS.length - 1));
      setProgress(Math.round((i / GENERATION_STEPS.length) * 100));
      if (i >= GENERATION_STEPS.length) {
        window.clearInterval(timer);
        applyGeneration(series.id, form);
        toast.success("Your series bible is ready.");
        navigate({ to: "/series/$seriesId", params: { seriesId: series.id } });
      }
    }, 700);
    return () => window.clearInterval(timer);
  }, [step, form, createSeries, applyGeneration, navigate]);

  const canContinue =
    step === 0 ? form.title.trim().length > 1 && form.premise.trim().length > 20 : true;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl">Create a series</h1>
        <ol className="mt-6 flex items-center gap-3 text-sm">
          {STEP_LABELS.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <span
                className={
                  i <= step
                    ? "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground"
                    : "flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs text-muted-foreground"
                }
              >
                {i + 1}
              </span>
              <span className={i <= step ? "" : "text-muted-foreground"}>{label}</span>
              {i < STEP_LABELS.length - 1 && <span className="h-px w-8 bg-border" />}
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-2xl border border-border bg-card p-8">
          {step === 0 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Series title</Label>
                <Input
                  id="title"
                  value={form.title}
                  placeholder="The Billionaire's Secret"
                  onChange={(e) => set("title", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="premise">Premise</Label>
                <Textarea
                  id="premise"
                  rows={6}
                  value={form.premise}
                  placeholder="A broke archivist signs a one-year contract marriage to save her family — and discovers the wife she's replacing may not be dead."
                  onChange={(e) => set("premise", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  At least a couple of sentences gives the strongest results.
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-3">
                <Field label="Genre">
                  <Picker value={form.genre} options={GENRES} onChange={(v) => set("genre", v)} />
                </Field>
                <Field label="Audience">
                  <Picker value={form.audience} options={AUDIENCES} onChange={(v) => set("audience", v)} />
                </Field>
                <Field label="Language">
                  <Picker value={form.language} options={LANGUAGES} onChange={(v) => set("language", v)} />
                </Field>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Visual style">
                  <Picker
                    value={form.visualStyle}
                    options={VISUAL_STYLES}
                    onChange={(v) => set("visualStyle", v as VisualStyle)}
                  />
                </Field>
                <Field label="Aspect format">
                  <Picker
                    value={form.format}
                    options={["9:16", "16:9"]}
                    onChange={(v) => set("format", v as AspectFormat)}
                  />
                </Field>
              </div>
              <div className="space-y-3">
                <Label>Episodes — {form.episodeCount}</Label>
                <Slider
                  min={3}
                  max={30}
                  step={1}
                  value={[form.episodeCount]}
                  onValueChange={([v]) => set("episodeCount", v)}
                />
              </div>
              <div className="space-y-3">
                <Label>Episode length — {form.episodeDuration}s</Label>
                <Slider
                  min={30}
                  max={180}
                  step={15}
                  value={[form.episodeDuration]}
                  onValueChange={([v]) => set("episodeDuration", v)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="py-8 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <h2 className="mt-6 font-display text-2xl">{GENERATION_STEPS[phase]}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Building "{form.title}" — {form.episodeCount} episodes in {form.format}.
              </p>
              <Progress className="mx-auto mt-8 max-w-md" value={progress} />
            </div>
          )}
        </div>

        {step < 2 && (
          <div className="mt-6 flex justify-between">
            <Button
              variant="ghost"
              onClick={() => (step === 0 ? navigate({ to: "/series" }) : setStep(step - 1))}
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <Button disabled={!canContinue} onClick={() => setStep(step + 1)}>
              {step === 1 ? (
                <>
                  <Sparkles className="mr-1 h-4 w-4" /> Generate series
                </>
              ) : (
                <>
                  Continue <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Picker({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
