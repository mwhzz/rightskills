"use client";

import { useActionState, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { saveCourseAction, type SaveCourseState } from "@/app/actions";
import { CourseCover } from "@/components/course-cover";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  categories,
  categoryLabel,
  courseLanguages,
  coverPatterns,
  levelLabel,
  levels,
  parseLevel,
  type CategoryId,
} from "@/lib/courses";
import { coverImageSrc } from "@/lib/cover-image";
import { formatBdt, formatBytes } from "@/lib/format";
import { instructorPhotoSrc } from "@/lib/instructor-photos";
import { slugify } from "@/lib/slug";
import { IMAGE_MAX_BYTES } from "@/lib/upload-limits";
import { cn } from "@/lib/utils";
import type { Course } from "@prisma/client";

const HEX = /^#[0-9A-Fa-f]{6}$/;

const coverPresets = [
  { name: "Harvest", from: "#EA6A1A", to: "#9A3412", pattern: "grid" as const },
  { name: "Ink", from: "#1C1917", to: "#C2410C", pattern: "dots" as const },
  { name: "Brass", from: "#B45309", to: "#292524", pattern: "waves" as const },
  { name: "Garden", from: "#3F6212", to: "#1A2E05", pattern: "grid" as const },
  { name: "River", from: "#1E3A5F", to: "#0F172A", pattern: "waves" as const },
];

const fieldClass =
  "h-11 rounded-lg border border-input bg-background px-3 text-base md:text-sm";
const selectClass = cn(fieldClass, "w-full appearance-none");

function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 sm:p-6">
      <h2 className="font-heading text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function LineList({
  items,
  onChange,
  placeholder,
  addLabel,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  addLabel: string;
}) {
  return (
    <>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2">
            <Input
              value={item}
              onValueChange={(value) => {
                const next = [...items];
                next[index] = value;
                onChange(next);
              }}
              placeholder={placeholder}
              className={fieldClass}
            />
            {items.length > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-11 shrink-0"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                aria-label="Remove line"
              >
                <Trash2 />
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
      <Button
        type="button"
        variant="outline"
        onClick={() => onChange([...items, ""])}
      >
        <Plus data-icon="inline-start" />
        {addLabel}
      </Button>
    </>
  );
}

export function CourseEditorForm({
  course,
}: {
  course?: Course | null;
}) {
  const existingOutcomes = Array.isArray(course?.outcomes)
    ? (course.outcomes as string[])
    : [];
  const existingIncludes = Array.isArray(course?.includes)
    ? (course.includes as string[])
    : [];
  const [title, setTitle] = useState(course?.title ?? "");
  const [slug, setSlug] = useState(course?.slug ?? "");
  const [slugLocked, setSlugLocked] = useState(Boolean(course?.slug));
  const [subtitle, setSubtitle] = useState(course?.subtitle ?? "");
  const [priceBdt, setPriceBdt] = useState(String(course?.priceBdt ?? 1990));
  const [originalPriceBdt, setOriginalPriceBdt] = useState(
    course?.originalPriceBdt ? String(course.originalPriceBdt) : ""
  );
  const [category, setCategory] = useState(course?.category ?? "development");
  const [level, setLevel] = useState(parseLevel(course?.level));
  const [coverFrom, setCoverFrom] = useState(course?.coverFrom ?? "#EA6A1A");
  const [coverTo, setCoverTo] = useState(course?.coverTo ?? "#9A3412");
  const [coverPattern, setCoverPattern] = useState(
    course?.coverPattern ?? "grid"
  );
  const [outcomes, setOutcomes] = useState(
    existingOutcomes.length > 0 ? existingOutcomes : [""]
  );
  const [includes, setIncludes] = useState(
    existingIncludes.length > 0 ? existingIncludes : [""]
  );
  const [photoLabel, setPhotoLabel] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [coverLabel, setCoverLabel] = useState("");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [state, formAction, pending] = useActionState<SaveCourseState, FormData>(
    saveCourseAction,
    null
  );

  const liveSlug = slugLocked ? slug : slugify(title);
  const price = Number(priceBdt);
  const original = originalPriceBdt ? Number(originalPriceBdt) : null;
  const discount =
    original && Number.isFinite(original) && Number.isFinite(price) && original > price
      ? Math.round((1 - price / original) * 100)
      : null;
  const existingPhoto = course
    ? instructorPhotoSrc(course.instructorPhoto)
    : undefined;
  const shownPhoto = removePhoto ? null : photoPreview || existingPhoto;

  const existingCover = coverImageSrc(course?.coverImage);
  const shownCover = removeCover ? "" : coverPreview || existingCover;

  const preview = useMemo(
    () => ({
      title: title || "Course title",
      cover: {
        from: HEX.test(coverFrom) ? coverFrom : "#EA6A1A",
        to: HEX.test(coverTo) ? coverTo : "#9A3412",
        pattern: (coverPatterns.includes(coverPattern as (typeof coverPatterns)[number])
          ? coverPattern
          : "grid") as (typeof coverPatterns)[number],
        image: shownCover || undefined,
      },
    }),
    [title, coverFrom, coverTo, coverPattern, shownCover]
  );

  return (
    <form action={formAction} className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      {course ? <input type="hidden" name="id" value={course.id} /> : null}
      <input type="hidden" name="slug" value={liveSlug} />
      <input type="hidden" name="outcomes" value={outcomes.join("\n")} />
      <input type="hidden" name="includes" value={includes.join("\n")} />
      <input type="hidden" name="coverFrom" value={coverFrom} />
      <input type="hidden" name="coverTo" value={coverTo} />
      <input type="hidden" name="coverPattern" value={coverPattern} />

      <div className="space-y-6">
        {state?.error ? (
          <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}
        {course && !course.published ? (
          <p className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            এই কোর্স এখন খসড়া। নিচে <span className="font-medium">স্ট্যাটাস</span>{" "}
            থেকে “সাইটে দেখাও” বেছে নিয়ে Save করুন।
          </p>
        ) : null}

        <Section
          title="স্ট্যাটাস"
          description="সাইটে দেখাবে কি না — এই অপশন থেকে বাছুন, তারপর নিচে Save চাপুন।"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="কোর্সের স্ট্যাটাস" htmlFor="published">
              <select
                id="published"
                name="published"
                defaultValue="on"
                className={selectClass}
              >
                <option value="on">সাইটে দেখাও (Publish)</option>
                <option value="">খসড়া — শুধু Admin-এ থাকবে</option>
              </select>
            </Field>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-background p-4">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={course?.featured ?? false}
                className="mt-1 size-4"
              />
              <span>
                <span className="block text-sm font-medium">Featured</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  হোমপেজের Featured রোতেও দেখাবে।
                </span>
              </span>
            </label>
          </div>
        </Section>

        <Section
          title="Listing"
          description="This is what students see on the course page and in search."
        >
          <Field label="Course banner" htmlFor="coverImage" hint="JPG, PNG, WEBP, or GIF · up to 5MB. 1280 × 800 px fills the card. If you skip this, the colour cover is used.">
            <input
              id="coverImage"
              type="file"
              name="coverImage"
              accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
              className="text-sm file:mr-2 file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) {
                  setCoverLabel("");
                  setCoverPreview(null);
                  return;
                }
                if (file.size > IMAGE_MAX_BYTES) {
                  setCoverLabel("Banner must be 5MB or smaller.");
                  event.target.value = "";
                  setCoverPreview(null);
                  return;
                }
                setRemoveCover(false);
                setCoverLabel(`${file.name} · ${formatBytes(file.size)}`);
                setCoverPreview(URL.createObjectURL(file));
              }}
            />
          </Field>
          {coverLabel ? (
            <p className="text-xs text-muted-foreground">{coverLabel}</p>
          ) : null}
          {course?.coverImage && !coverPreview ? (
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                name="removeCoverImage"
                checked={removeCover}
                onChange={(event) => setRemoveCover(event.target.checked)}
                className="size-4 rounded border"
              />
              Remove banner image
            </label>
          ) : null}
          <Field label="Title" htmlFor="title">
            <Input
              id="title"
              name="title"
              required
              minLength={3}
              value={title}
              onValueChange={setTitle}
              placeholder="Full-Stack Web Development with Next.js"
              className={fieldClass}
            />
          </Field>
          <Field
            label="URL slug"
            htmlFor="slug"
            hint={
              course
                ? "The URL stays the same after a course is created."
                : `Public URL: /courses/${liveSlug || "…"}`
            }
          >
            <Input
              id="slug"
              value={liveSlug}
              readOnly={Boolean(course)}
              onValueChange={(value) => {
                setSlugLocked(true);
                setSlug(slugify(value));
              }}
              className={fieldClass}
            />
          </Field>
          <Field
            label="Subtitle"
            htmlFor="subtitle"
            hint="One line under the title. Required to publish."
          >
            <Input
              id="subtitle"
              name="subtitle"
              value={subtitle}
              onValueChange={setSubtitle}
              placeholder="Ship real client websites — from Dhaka startups to freelance gigs."
              className={fieldClass}
            />
          </Field>
          <Field
            label="Description"
            htmlFor="description"
            hint="What the course is, who it is for, and what they will make."
          >
            <Textarea
              id="description"
              name="description"
              rows={6}
              defaultValue={course?.description ?? ""}
              placeholder="Build production websites with Next.js, TypeScript, and Tailwind…"
              className="min-h-32 text-base md:text-sm"
            />
          </Field>
          <Field
            label="Bangla title"
            htmlFor="banglaTitle"
            hint="Optional. Leave blank if the listing is English-only."
          >
            <Input
              id="banglaTitle"
              name="banglaTitle"
              defaultValue={course?.banglaTitle ?? ""}
              className={fieldClass}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Category" htmlFor="category">
              <select
                id="category"
                name="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={selectClass}
              >
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Level"
              htmlFor="level"
              hint="Optional. Pick Entry, Intermediate, or Advanced — or leave as None."
            >
              <select
                id="level"
                name="level"
                value={level}
                onChange={(event) => setLevel(parseLevel(event.target.value))}
                className={selectClass}
              >
                <option value="">None</option>
                {levels.map((item) => (
                  <option key={item} value={item}>
                    {levelLabel(item)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Taught in" htmlFor="language">
              <select
                id="language"
                name="language"
                defaultValue={course?.language ?? "English"}
                className={selectClass}
              >
                {courseLanguages.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        <Section
          title="Price"
          description="Students pay in BDT. An original price shows the discount."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Sale price (BDT)" htmlFor="priceBdt">
              <Input
                id="priceBdt"
                name="priceBdt"
                type="number"
                min={1}
                required
                value={priceBdt}
                onValueChange={setPriceBdt}
                className={fieldClass}
              />
            </Field>
            <Field
              label="Original price (BDT)"
              htmlFor="originalPriceBdt"
              hint="Optional. Must be higher than the sale price."
            >
              <Input
                id="originalPriceBdt"
                name="originalPriceBdt"
                type="number"
                min={1}
                value={originalPriceBdt}
                onValueChange={setOriginalPriceBdt}
                className={fieldClass}
              />
            </Field>
          </div>
          <p className="text-sm text-muted-foreground">
            Students see{" "}
            <span className="font-medium text-foreground">
              {Number.isFinite(price) ? formatBdt(price) : "—"}
            </span>
            {discount ? ` · ${discount}% off` : null}
          </p>
          <Field
            label="Note under the price"
            htmlFor="purchaseNote"
            hint="Shown on the course page between the price and Add to cart. Leave blank to use the default payment text."
          >
            <Textarea
              id="purchaseNote"
              name="purchaseNote"
              rows={3}
              maxLength={600}
              defaultValue={course?.purchaseNote ?? ""}
              placeholder="One-time payment. Add to cart without an account — you log in when you place the order. The course unlocks after we confirm your TrxID."
              className="min-h-24 rounded-lg border border-input bg-background px-3 py-2 text-base md:text-sm"
            />
          </Field>
        </Section>

        <Section
          title="What you will learn"
          description="These cards show on the course page. One line per outcome. At least one is required to publish."
        >
          <LineList
            items={outcomes}
            onChange={setOutcomes}
            placeholder="Build a sales tracker with SUMIFS and data validation"
            addLabel="Add outcome"
          />
        </Section>

        <Section
          title="This course includes"
          description="Shown under What you will learn. Leave blank to keep the default list (hours, lectures, language, lifetime access)."
        >
          <LineList
            items={includes}
            onChange={setIncludes}
            placeholder="Lifetime access on your account"
            addLabel="Add item"
          />
        </Section>

        <Section
          title="Instructor"
          description="Name, title, bio, and photo on the course page. Students see this under the curriculum."
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="shrink-0">
              {shownPhoto ? (
                <img
                  src={shownPhoto}
                  alt=""
                  className="size-28 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex size-28 items-center justify-center rounded-2xl bg-primary font-heading text-3xl font-semibold text-primary-foreground">
                  {(course?.instructorInitials || "RS").slice(0, 2)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <Field
                label="Photo"
                htmlFor="instructorPhoto"
                hint="JPG, PNG, WEBP, or GIF · up to 5MB. If you skip this, we use a photo that already matches the name — or initials."
              >
                <input
                  id="instructorPhoto"
                  type="file"
                  name="instructorPhoto"
                  accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
                  className="text-sm file:mr-2 file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      setPhotoLabel("");
                      setPhotoPreview(null);
                      return;
                    }
                    if (file.size > IMAGE_MAX_BYTES) {
                      setPhotoLabel("Photo must be 5MB or smaller.");
                      event.target.value = "";
                      setPhotoPreview(null);
                      return;
                    }
                    setRemovePhoto(false);
                    setPhotoLabel(`${file.name} · ${formatBytes(file.size)}`);
                    setPhotoPreview(URL.createObjectURL(file));
                  }}
                />
              </Field>
              {photoLabel ? (
                <p className="text-xs text-muted-foreground">{photoLabel}</p>
              ) : null}
              {course?.instructorPhoto && !photoPreview ? (
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    name="removeInstructorPhoto"
                    checked={removePhoto}
                    onChange={(event) => setRemovePhoto(event.target.checked)}
                    className="size-4 rounded border"
                  />
                  Remove uploaded photo
                </label>
              ) : null}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" htmlFor="instructorName">
              <Input
                id="instructorName"
                name="instructorName"
                defaultValue={course?.instructorName ?? ""}
                placeholder="Mahmudul Islam"
                className={fieldClass}
              />
            </Field>
            <Field label="Title" htmlFor="instructorTitle">
              <Input
                id="instructorTitle"
                name="instructorTitle"
                defaultValue={course?.instructorTitle ?? ""}
                placeholder="MIS lead, RMG buying office"
                className={fieldClass}
              />
            </Field>
          </div>
          <Field label="Bio" htmlFor="instructorBio">
            <Textarea
              id="instructorBio"
              name="instructorBio"
              rows={4}
              defaultValue={course?.instructorBio ?? ""}
              placeholder="What they have shipped, and who they teach."
              className="min-h-24 text-base md:text-sm"
            />
          </Field>
        </Section>

        <Section
          title="Colour cover"
          description="Used only if you do not upload a banner image."
        >
          <div className="flex flex-wrap gap-2">
            {coverPresets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  setCoverFrom(preset.from);
                  setCoverTo(preset.to);
                  setCoverPattern(preset.pattern);
                }}
                className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm hover:border-primary/40"
              >
                <span
                  className="size-4 rounded-full border border-black/10"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${preset.from}, ${preset.to})`,
                  }}
                />
                {preset.name}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="From" htmlFor="coverFromVisible">
              <div className="flex gap-2">
                <input
                  id="coverFromVisible"
                  type="color"
                  value={HEX.test(coverFrom) ? coverFrom : "#EA6A1A"}
                  onChange={(event) => setCoverFrom(event.target.value.toUpperCase())}
                  className="size-11 shrink-0 cursor-pointer rounded-lg border bg-background"
                />
                <Input
                  value={coverFrom}
                  onValueChange={setCoverFrom}
                  className={fieldClass}
                />
              </div>
            </Field>
            <Field label="To" htmlFor="coverToVisible">
              <div className="flex gap-2">
                <input
                  id="coverToVisible"
                  type="color"
                  value={HEX.test(coverTo) ? coverTo : "#9A3412"}
                  onChange={(event) => setCoverTo(event.target.value.toUpperCase())}
                  className="size-11 shrink-0 cursor-pointer rounded-lg border bg-background"
                />
                <Input
                  value={coverTo}
                  onValueChange={setCoverTo}
                  className={fieldClass}
                />
              </div>
            </Field>
            <Field label="Pattern" htmlFor="coverPatternVisible">
              <select
                id="coverPatternVisible"
                value={coverPattern}
                onChange={(event) => setCoverPattern(event.target.value)}
                className={selectClass}
              >
                {coverPatterns.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        <div className="flex flex-wrap items-center gap-3 pb-4">
          <button
            type="submit"
            disabled={pending}
            className={cn(buttonVariants({ size: "lg" }), "h-12 px-6 text-base")}
          >
            {pending ? "Saving…" : course ? "Save changes" : "Create course"}
          </button>
          <p className="text-sm text-muted-foreground">
            {course
              ? "Modules and lesson videos are below."
              : "After this you can add modules and upload videos."}
          </p>
        </div>
      </div>

      <aside className="xl:sticky xl:top-6 xl:self-start">
        <div className="overflow-hidden rounded-2xl border bg-card">
          <CourseCover course={preview} className="aspect-16/10" />
          <div className="p-4">
            <p className="text-xs tracking-[0.14em] text-primary uppercase">
              {categoryLabel(category as CategoryId)}
              {level ? ` · ${levelLabel(level)}` : ""}
            </p>
            <p className="mt-2 font-heading text-lg leading-snug font-semibold">
              {title || "Course title"}
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {subtitle || "Subtitle appears here"}
            </p>
            <p className="mt-3 text-base font-semibold">
              {Number.isFinite(price) ? formatBdt(price) : "—"}
              {original && Number.isFinite(original) ? (
                <span className="ml-2 text-sm font-normal text-muted-foreground line-through">
                  {formatBdt(original)}
                </span>
              ) : null}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Live preview of the storefront card.
        </p>
      </aside>
    </form>
  );
}
