import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 font-heading text-2xl font-semibold">
        This page is not on the syllabus
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The course or page you opened does not exist. Head back to the
        catalogue.
      </p>
      <Link href="/courses" className={cn(buttonVariants({ size: "lg" }), "mt-6")}>
        Browse courses
      </Link>
    </div>
  );
}
