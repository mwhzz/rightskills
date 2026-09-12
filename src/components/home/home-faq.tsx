import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/home/reveal";
import { getDictionary } from "@/lib/i18n";

export async function HomeFaq() {
  const dict = await getDictionary();
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
        <Reveal>
          <p className="text-sm font-medium tracking-[0.18em] text-primary uppercase">
            {dict.faq.kicker}
          </p>
          <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {dict.faq.title}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
            {dict.faq.notePrefix}
            <Link href="/account/orders" className="font-medium text-primary hover:underline">
              {dict.faq.noteLink}
            </Link>
            {dict.faq.noteSuffix}
          </p>
        </Reveal>
        <Reveal delay={80}>
          <Accordion className="rounded-2xl border bg-card px-5">
            {dict.faq.items.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="py-4 text-base">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>{item.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
