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
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        <Reveal>
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase sm:text-sm">
            How it works
          </p>
          <h2 className="mt-2 font-heading text-xl font-semibold tracking-tight sm:text-3xl">
            Four steps from browse to lesson.
          </h2>
        </Reveal>
        <ol className="mt-6 space-y-0 lg:mt-8 lg:grid lg:grid-cols-4 lg:gap-4 lg:space-y-0">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 70}>
              <li className="relative flex gap-3 py-3 pl-4 max-lg:border-l-2 max-lg:border-primary/25 max-lg:last:border-l-transparent lg:h-full lg:flex-col lg:rounded-2xl lg:border lg:bg-background lg:p-5 lg:pl-5">
                <span className="absolute -left-[0.7rem] top-3.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-background text-sm font-semibold text-primary lg:static lg:size-9">
                  {index + 1}
                </span>
                <div className="min-w-0 pl-4 lg:pl-0">
                  <step.icon className="mb-1 hidden size-5 text-primary lg:mt-4 lg:block" />
                  <h3 className="font-heading text-base font-semibold tracking-tight lg:mt-3 lg:text-lg">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
