import type { Metadata } from "next";
import { LearningLibrary } from "@/components/learning-library";

export const metadata: Metadata = {
  title: "My learning",
};

export default function LearnPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        My learning
      </h1>
      <p className="mt-2 mb-8 max-w-2xl text-muted-foreground">
        Courses you bought on this browser. Progress is saved in a cookie — no
        account required for this demo.
      </p>
      <LearningLibrary />
    </div>
  );
}
