import { LearningLibrary } from "@/components/learning-library";
import { StudentShell } from "@/components/student-shell";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My learning",
};

export default async function LearnPage() {
  const user = await requireUser("/learn");
  return (
    <StudentShell user={user}>
      <LearningLibrary embedded />
    </StudentShell>
  );
}
