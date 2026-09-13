import Link from "next/link";
import {
  createStudentAction,
  updateStudentAction,
} from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-base md:text-sm";

const errors: Record<string, string> = {
  name: "Enter the student’s full name.",
  phone: "Enter a valid 11-digit BD mobile (01XXXXXXXXX).",
  whatsapp: "Enter a valid WhatsApp number (01XXXXXXXXX).",
  email: "Enter a valid email, or leave it blank.",
  pin: "Set a 4-digit PIN they will use to log in.",
  taken: "That phone number already has an account.",
  confirm: "Tick the box to confirm delete.",
};

type StudentValues = {
  id?: string;
  name?: string;
  phone?: string;
  whatsapp?: string;
  email?: string | null;
  profession?: string;
  district?: string;
  address?: string;
  gender?: string;
  notes?: string;
};

export function StudentProfileForm({
  student,
  courses,
  error,
}: {
  student?: StudentValues;
  courses: { id: string; title: string }[];
  error?: string;
}) {
  const editing = Boolean(student?.id);
  const action = editing ? updateStudentAction : createStudentAction;

  return (
    <form action={action} className="space-y-6">
      {student?.id ? <input type="hidden" name="id" value={student.id} /> : null}
      {error ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errors[error] ?? "Could not save. Check the fields and try again."}
        </p>
      ) : null}

      <section className="rounded-2xl border bg-card p-5 sm:p-6">
        <h2 className="font-heading text-lg font-semibold">Account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          WhatsApp orders: create the student here, set a PIN, then tell them
          the phone + PIN so they can log in after unlock.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="name">
            <input
              id="name"
              name="name"
              required
              defaultValue={student?.name ?? ""}
              className={fieldClass}
            />
          </Field>
          <Field label="Login phone" htmlFor="phone">
            <input
              id="phone"
              name="phone"
              required
              inputMode="numeric"
              placeholder="01XXXXXXXXX"
              defaultValue={student?.phone ?? ""}
              className={fieldClass}
            />
          </Field>
          <Field
            label="4-digit PIN"
            htmlFor="pin"
            hint={editing ? "Leave blank to keep the current PIN." : "They log in with this."}
          >
            <input
              id="pin"
              name="pin"
              type="password"
              inputMode="numeric"
              minLength={editing ? undefined : 4}
              maxLength={4}
              pattern={editing ? undefined : "[0-9]{4}"}
              required={!editing}
              className={cn(fieldClass, "tracking-[0.4em]")}
            />
          </Field>
          <Field label="WhatsApp" htmlFor="whatsapp" hint="If different from login phone.">
            <input
              id="whatsapp"
              name="whatsapp"
              inputMode="numeric"
              placeholder="01XXXXXXXXX"
              defaultValue={student?.whatsapp ?? ""}
              className={fieldClass}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5 sm:p-6">
        <h2 className="font-heading text-lg font-semibold">Profile</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Email" htmlFor="email">
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={student?.email ?? ""}
              className={fieldClass}
            />
          </Field>
          <Field label="Profession" htmlFor="profession">
            <input
              id="profession"
              name="profession"
              defaultValue={student?.profession ?? ""}
              className={fieldClass}
            />
          </Field>
          <Field label="District / city" htmlFor="district">
            <input
              id="district"
              name="district"
              defaultValue={student?.district ?? ""}
              className={fieldClass}
            />
          </Field>
          <Field label="Gender" htmlFor="gender">
            <select
              id="gender"
              name="gender"
              defaultValue={student?.gender ?? ""}
              className={fieldClass}
            >
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Address" htmlFor="address">
              <textarea
                id="address"
                name="address"
                rows={3}
                defaultValue={student?.address ?? ""}
                className="min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-base md:text-sm"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field
              label="Admin notes"
              htmlFor="notes"
              hint="Private. Use this for WhatsApp order details."
            >
              <textarea
                id="notes"
                name="notes"
                rows={4}
                defaultValue={student?.notes ?? ""}
                className="min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-base md:text-sm"
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5 sm:p-6">
        <h2 className="font-heading text-lg font-semibold">Unlock a course</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          After you match their payment, pick the course to enroll them.
        </p>
        <div className="mt-4 max-w-md">
          <select name="courseId" defaultValue="" className={fieldClass}>
            <option value="">Don’t enroll yet</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <button type="submit" className={cn(buttonVariants({ size: "lg" }), "h-11")}>
          {editing ? "Save student" : "Create student"}
        </button>
        <Link
          href="/admin/students"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11")}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

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
    <label className="block space-y-1.5" htmlFor={htmlFor}>
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}
