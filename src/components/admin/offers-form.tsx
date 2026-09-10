"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { saveHomeOffersAction } from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  offerCardWidthClass,
  offerFrameClass,
  offerImageSrc,
  recommendedOfferSize,
  OFFER_MAX_ITEMS,
  OFFER_SHAPES,
  type HomeOffer,
  type HomeOfferRow,
  type OfferShape,
} from "@/lib/home-offers";
import { IMAGE_MAX_BYTES } from "@/lib/upload-limits";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";

function blankOffer(): HomeOffer {
  const seed = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  return { id: `offer-${seed}`, image: "", href: "" };
}

export function OffersForm({
  row,
  saved,
  error,
}: {
  row: HomeOfferRow;
  saved?: boolean;
  error?: string;
}) {
  const [title, setTitle] = useState(row.title);
  const [shape, setShape] = useState<OfferShape>(row.shape);
  const [items, setItems] = useState<HomeOffer[]>(
    row.items.length ? row.items : [blankOffer()]
  );
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const recommended = recommendedOfferSize(shape);

  function update(index: number, patch: Partial<HomeOffer>) {
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  function move(index: number, dir: -1 | 1) {
    setItems((current) => {
      const next = [...current];
      const target = index + dir;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <form action={saveHomeOffersAction} className="space-y-8">
      <input
        type="hidden"
        name="offers"
        value={JSON.stringify({ title, shape, items })}
      />
      {saved ? (
        <p className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          Saved. The homepage offer row updates on the next visit.
        </p>
      ) : null}
      {error === "json" ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Could not save those offers. Check each link starts with / or https://.
        </p>
      ) : null}
      {error === "photo" ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Photo must be JPG, PNG, WEBP, or GIF, and 5MB or smaller.
        </p>
      ) : null}

      <section className="grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-2">
        <div>
          <Label className="text-sm">Row heading</Label>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Eid offer — up to 50% off"
            className="mt-1.5 h-10"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Leave empty to show the cards with no heading.
          </p>
        </div>
        <div>
          <Label className="text-sm">Card shape</Label>
          <select
            value={shape}
            onChange={(event) => setShape(event.target.value as OfferShape)}
            className="mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            {OFFER_SHAPES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label} · {option.width} × {option.height} px
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            Every card in the row uses this shape. Images are cropped to fill it.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Offer cards
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add up to {OFFER_MAX_ITEMS} images. They scroll sideways on the
            homepage in the order below. Remove every card to hide the row.
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <li key={item.id} className="rounded-2xl border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Card {index + 1}</p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => move(index, -1)}
                    aria-label="Move earlier"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => move(index, 1)}
                    aria-label="Move later"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                  <button
                    type="button"
                    className="ml-1 text-sm text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      setItems((current) => current.filter((_, i) => i !== index))
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div
                className={cn(
                  "relative mt-3 overflow-hidden rounded-xl bg-background",
                  offerCardWidthClass[shape],
                  offerFrameClass[shape]
                )}
              >
                {previews[item.id] || item.image ? (
                  <img
                    src={previews[item.id] || offerImageSrc(item.image)}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center px-3 text-center text-xs text-muted-foreground">
                    Upload {recommended.label}
                  </div>
                )}
              </div>
              <div className="mt-3 space-y-3">
                <div>
                  <Label className="text-sm">Image</Label>
                  <input
                    type="file"
                    name={`file-offer-${item.id}`}
                    accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
                    className="mt-1.5 w-full text-sm file:mr-2 file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      if (file.size > IMAGE_MAX_BYTES) {
                        event.target.value = "";
                        return;
                      }
                      setPreviews((current) => ({
                        ...current,
                        [item.id]: URL.createObjectURL(file),
                      }));
                    }}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {recommended.label} · JPG, PNG, WEBP, or GIF up to{" "}
                    {formatBytes(IMAGE_MAX_BYTES)}. Leave empty to keep the
                    current image.
                  </p>
                </div>
                <div>
                  <Label className="text-sm">Link (optional)</Label>
                  <Input
                    value={item.href}
                    onChange={(event) => update(index, { href: event.target.value })}
                    placeholder="/courses or https://..."
                    className="mt-1.5 h-10"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className={cn(buttonVariants({ variant: "outline" }))}
          onClick={() =>
            setItems((current) =>
              [...current, blankOffer()].slice(0, OFFER_MAX_ITEMS)
            )
          }
        >
          Add offer card
        </button>
      </section>

      <button type="submit" className={cn(buttonVariants({ size: "lg" }), "h-11")}>
        Save offers
      </button>
    </form>
  );
}
