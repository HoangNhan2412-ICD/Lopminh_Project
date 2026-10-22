import Image from "next/image";

export function GuideImage({ name, alt }: { name: string; alt: string }) {
  return <a href={`/guides/${name}.webp`} target="_blank" rel="noreferrer" className="mt-3 block min-h-11 rounded-xl border border-border bg-surface p-2 focus-visible:outline-2 focus-visible:outline-primary" aria-label={`Phóng to: ${alt}`}>
    <Image src={`/guides/${name}.webp`} alt={alt} width={1200} height={800} unoptimized className="h-auto w-full rounded-lg" />
    <span className="mt-2 block text-sm text-ink-muted">Bấm ảnh để xem lớn hơn</span>
  </a>;
}
