"use client";

import { useState } from "react";
import { saveHomeBannersAction } from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { HomeBanner } from "@/lib/home-banners";
import { cn } from "@/lib/utils";

function blankBanner(): HomeBanner {
  return {
    id: `banner-${Date.now()}`,
    badge: "Offer",
    title: "",
    subtitle: "",
    cta: "View offer",
    href: "/courses",
    from: "#ea580c",
    to: "#7c2d12",
    image: "",
  };
}

export function BannersForm({
  banners,
  saved,
  error,
}: {
  banners: HomeBanner[];
  saved?: boolean;
  error?: string;
}) {
  const [items, setItems] = useState<HomeBanner[]>(
    banners.length ? banners : [blankBanner()]
  );

  function update(index: number, patch: Partial<HomeBanner>) {
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  return (
    <form action={saveHomeBannersAction} className="space-y-5">
      <input type="hidden" name="banners" value={JSON.stringify(items)} />
      {saved ? (
        <p className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          Saved. The homepage slider updates on the next visit.
        </p>
      ) : null}
      {error === "empty" ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Add at least one banner with a title and a link.
        </p>
      ) : null}
      {error === "json" ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Could not save those banners. Check the links start with / or https://
        </p>
      ) : null}

      <ul className="space-y-4">
        {items.map((item, index) => (
          <li key={item.id} className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Banner {index + 1}</p>
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-destructive"
                onClick={() =>
                  setItems((current) => current.filter((_, i) => i !== index))
                }
              >
                Remove
              </button>
            </div>
            <div
              className="mt-4 h-28 overflow-hidden rounded-xl bg-muted"
              style={
                item.image
                  ? undefined
                  : {
                      backgroundImage: `linear-gradient(115deg, ${item.from}, ${item.to})`,
                    }
              }
            >
              {item.image ? (
                <img src={item.image} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Badge">
                <Input
                  value={item.badge}
                  onChange={(e) => update(index, { badge: e.target.value })}
                  className="h-10"
                />
              </Field>
              <Field label="Button">
                <Input
                  value={item.cta}
                  onChange={(e) => update(index, { cta: e.target.value })}
                  className="h-10"
                />
              </Field>
              <Field label="Title" className="sm:col-span-2">
                <Input
                  value={item.title}
                  onChange={(e) => update(index, { title: e.target.value })}
                  className="h-10"
                />
              </Field>
              <Field label="Subtitle" className="sm:col-span-2">
                <Input
                  value={item.subtitle}
                  onChange={(e) => update(index, { subtitle: e.target.value })}
                  className="h-10"
                />
              </Field>
              <Field label="Link" className="sm:col-span-2">
                <Input
                  value={item.href}
                  onChange={(e) => update(index, { href: e.target.value })}
                  placeholder="/courses or https://..."
                  className="h-10"
                />
              </Field>
              <Field label="Image URL" className="sm:col-span-2">
                <Input
                  value={item.image}
                  onChange={(e) => update(index, { image: e.target.value })}
                  placeholder="/brands/saffron.jpg or https://..."
                  className="h-10"
                />
              </Field>
              <Field label="From">
                <Input
                  type="color"
                  value={item.from}
                  onChange={(e) => update(index, { from: e.target.value })}
                  className="h-10"
                />
              </Field>
              <Field label="To">
                <Input
                  type="color"
                  value={item.to}
                  onChange={(e) => update(index, { to: e.target.value })}
                  className="h-10"
                />
              </Field>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11")}
          onClick={() => setItems((current) => [...current, blankBanner()].slice(0, 8))}
        >
          Add banner
        </button>
        <button type="submit" className={cn(buttonVariants({ size: "lg" }), "h-11")}>
          Save banners
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="text-sm">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
