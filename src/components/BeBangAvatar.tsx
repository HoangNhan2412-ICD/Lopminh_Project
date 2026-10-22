/** Linh vật Bé Bảng: một tấm bảng nhỏ có khung gỗ, mặt cười và viên phấn. Vẽ bằng SVG, không dùng ảnh ngoài. */
export function BeBangAvatar({ size = 56, mood = "vui" }: { size?: number; mood?: "vui" | "nghe" | "nghi" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Bé Bảng" className="shrink-0">
      <rect x="4" y="8" width="56" height="44" rx="10" fill="var(--accent)" />
      <rect x="8" y="12" width="48" height="36" rx="7" fill="var(--board)" />
      {/* mắt */}
      {mood === "nghi" ? (
        <>
          <path d="M21 27h7M36 27h7" stroke="var(--chalk)" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="24.5" cy="27" r="3.4" fill="var(--chalk)" />
          <circle cx="39.5" cy="27" r="3.4" fill="var(--chalk)" />
        </>
      )}
      {/* má hồng */}
      <circle cx="18.5" cy="34" r="2.6" fill="var(--mascot-blush)" opacity="0.8" />
      <circle cx="45.5" cy="34" r="2.6" fill="var(--mascot-blush)" opacity="0.8" />
      {/* miệng */}
      {mood === "nghe" ? (
        <ellipse cx="32" cy="36.5" rx="3.2" ry="3.6" fill="var(--chalk)" />
      ) : (
        <path d="M26 34.5c2.2 3.2 9.8 3.2 12 0" stroke="var(--chalk)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      )}
      {/* chân bảng + viên phấn */}
      <rect x="18" y="52" width="4" height="8" rx="2" fill="var(--accent)" />
      <rect x="42" y="52" width="4" height="8" rx="2" fill="var(--accent)" />
      <rect x="44" y="45" width="10" height="3.4" rx="1.7" fill="var(--chalk)" transform="rotate(-18 49 46.7)" />
    </svg>
  );
}
