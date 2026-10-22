import { Suspense } from "react";
import { GateForm } from "@/components/shell/GateForm";

export default function Page() {
  return (
    <Suspense>
      <GateForm />
    </Suspense>
  );
}
