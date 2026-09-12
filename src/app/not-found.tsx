import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default async function NotFound() {
  const dict = await getDictionary();
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 font-heading text-2xl font-semibold">
        {dict.notFound.title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {dict.notFound.body}
      </p>
      <Link href="/courses" className={cn(buttonVariants({ size: "lg" }), "mt-6")}>
        {dict.mobileDock.browseCourses}
      </Link>
    </div>
  );
}
