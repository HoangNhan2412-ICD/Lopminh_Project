import { Suspense } from "react";
import { StudentDetail } from "@/components/students/StudentDetail";
export default function Page(){return <Suspense fallback={<p>Đang mở hồ sơ học sinh…</p>}><StudentDetail /></Suspense>}
