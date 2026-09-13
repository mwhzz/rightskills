import { updateOwnProfileAction } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDictionary } from "@/lib/i18n";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profile",
};

const fieldClass =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-base md:text-sm";

export default async function AccountProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const session = await requireUser("/account/profile");
  const [{ saved, error }, dict, user] = await Promise.all([
    searchParams,
    getDictionary(),
    prisma.user.findUnique({ where: { id: session.id } }),
  ]);
  if (!user) return null;

  return (
    <div>
      <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        {dict.profilePage.title}
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
        {dict.profilePage.subtitle}
      </p>

      {saved ? (
        <p className="mt-4 rounded-2xl border bg-primary/5 px-4 py-3 text-sm">
          {dict.profilePage.saved}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {dict.profilePage.error}
        </p>
      ) : null}

      <form action={updateOwnProfileAction} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium">{dict.profilePage.loginPhone}</span>
          <input
            value={user.phone}
            readOnly
            className={cn(fieldClass, "bg-muted/50 text-muted-foreground")}
          />
          <span className="block text-xs text-muted-foreground">
            {dict.profilePage.loginPhoneHint}
          </span>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">{dict.profilePage.name}</span>
          <input
            name="name"
            required
            defaultValue={user.name}
            className={fieldClass}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">{dict.profilePage.email}</span>
          <input
            name="email"
            type="email"
            defaultValue={user.email ?? ""}
            className={fieldClass}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">{dict.profilePage.whatsapp}</span>
          <input
            name="whatsapp"
            inputMode="numeric"
            placeholder="01XXXXXXXXX"
            defaultValue={user.whatsapp}
            className={fieldClass}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">{dict.profilePage.profession}</span>
          <input
            name="profession"
            defaultValue={user.profession}
            className={fieldClass}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">{dict.profilePage.district}</span>
          <input
            name="district"
            defaultValue={user.district}
            className={fieldClass}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">{dict.profilePage.gender}</span>
          <select name="gender" defaultValue={user.gender} className={fieldClass}>
            <option value="">{dict.profilePage.genderNone}</option>
            <option value="male">{dict.profilePage.genderMale}</option>
            <option value="female">{dict.profilePage.genderFemale}</option>
            <option value="other">{dict.profilePage.genderOther}</option>
          </select>
        </label>
        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium">{dict.profilePage.address}</span>
          <textarea
            name="address"
            rows={3}
            defaultValue={user.address}
            className="min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-base md:text-sm"
          />
        </label>
        <div className="sm:col-span-2">
          <button type="submit" className={cn(buttonVariants(), "h-11")}>
            {dict.profilePage.save}
          </button>
        </div>
      </form>
    </div>
  );
}
