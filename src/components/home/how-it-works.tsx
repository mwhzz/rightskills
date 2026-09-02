import { BookOpen, ClipboardCheck, Send, Unlock } from "lucide-react";
import { Reveal } from "@/components/home/reveal";

const steps = [
  {
    icon: BookOpen,
    title: "Browse a course",
    body: "Pick a path from the catalogue. Preview a lesson if one is open.",
  },
  {
    icon: Send,
    title: "Place order, send money",
    body: "Checkout, then Send Money on bKash or Nagad with the exact amount.",
  },
  {
    icon: ClipboardCheck,
    title: "Paste your TrxID",
    body: "Copy it from the app and paste it on your orders page.",
  },
  {
    icon: Unlock,
    title: "Watch in My learning",
    body: "An admin matches the TrxID. Then the course unlocks — no auto-unlock.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 border-y bg-card/60">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <Reveal>
          <p className="text-sm font-medium tracking-[0.18em] text-primary uppercase">
            How it works
          </p>
          <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Four steps from browse to lesson.
          </h2>
        </Reveal>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 70}>
              <li className="h-full rounded-2xl border bg-background p-5">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {index + 1}
                </span>
                <step.icon className="mt-4 size-5 text-primary" />
                <h3 className="mt-3 font-heading text-lg font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {step.body}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
