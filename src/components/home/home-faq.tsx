import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/home/reveal";

const faqs = [
  {
    id: "trxid",
    q: "What is a TrxID?",
    a: "It is the transaction ID bKash or Nagad shows after Send Money. Paste that exact ID on your orders page so an admin can match your payment.",
  },
  {
    id: "unlock",
    q: "When does my course unlock?",
    a: "After an admin confirms the TrxID against your order. We do not auto-unlock. You will find the course in My learning once status is paid.",
  },
  {
    id: "watch",
    q: "Where do I watch the videos?",
    a: "Open My learning, then the course. Lessons play there after unlock — not on the public course page.",
  },
  {
    id: "certificate",
    q: "Do you issue certificates?",
    a: "No. Right Skills gives you the course videos and files after payment is confirmed. We do not issue certificates.",
  },
] as const;

export function HomeFaq() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
        <Reveal>
          <p className="text-sm font-medium tracking-[0.18em] text-primary uppercase">
            FAQ
          </p>
          <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Payment and access
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
            Still stuck? Check{" "}
            <Link href="/account/orders" className="font-medium text-primary hover:underline">
              Orders
            </Link>{" "}
            for your TrxID, or browse the catalogue first.
          </p>
        </Reveal>
        <Reveal delay={80}>
          <Accordion className="rounded-2xl border bg-card px-5">
            {faqs.map((item) => (
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
