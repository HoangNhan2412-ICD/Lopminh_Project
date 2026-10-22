"use client";

import { CircleDashed } from "lucide-react";
import { BeBangAvatar } from "@/components/BeBangAvatar";
import { Card } from "@/components/ui";
import { honorificLower } from "@/lib/persona/honorific";
import { useApp } from "@/lib/store/app-store";

/** Trang cho mục đang được xây: nói rõ mục này sẽ làm gì, không để trang trống. */
export function UpcomingModule({ title, intro, features }: { title: string; intro: string; features: string[] }) {
  const { profile } = useApp();
  const h = honorificLower(profile);
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{title}</h1>
      <Card className="flex gap-4 p-5">
        <BeBangAvatar size={60} mood="nghi" />
        <div>
          <p className="text-lg font-semibold">Bé Bảng đang chuẩn bị mục này cho {h}.</p>
          <p className="mt-1 text-ink-muted">{intro}</p>
        </div>
      </Card>
      <Card className="p-5">
        <p className="font-semibold">Khi xong, mục này sẽ giúp {h}:</p>
        <ul className="mt-3 space-y-2.5">
          {features.map((f) => (
            <li key={f} className="flex gap-3">
              <CircleDashed className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
