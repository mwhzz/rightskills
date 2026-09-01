import { redirect } from "next/navigation";
import { LearningLibrary } from "@/components/learning-library";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My learning",
};

export default async function LearnPage() {
  await requireUser();
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        My learning
      </h1>
      <p className="mt-2 mb-8 max-w-2xl text-muted-foreground">
        Courses unlocked on this account after payment is confirmed.
      </p>
      <LearningLibrary />
    </div>
  );
}
