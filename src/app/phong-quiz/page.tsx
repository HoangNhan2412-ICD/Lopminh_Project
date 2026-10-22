import { Suspense } from "react";
import { QuizRoom } from "@/components/quiz/QuizRoom";

export default function Page() {
  return (
    <Suspense>
      <QuizRoom />
    </Suspense>
  );
}
