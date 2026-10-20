"use client";

/**
 * Đọc to bằng giọng tiếng Việt của trình duyệt (dự phòng khi chưa dùng Gemini TTS).
 * Ưu tiên giọng vi-VN bản xứ để không bị đọc "lơ lớ" giọng Anh.
 */
function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const vi = voices.filter((v) => v.lang.toLowerCase().startsWith("vi"));
  return (
    vi.find((v) => /google/i.test(v.name)) ??
    vi.find((v) => /hoaimy|namminh|an\b|linh/i.test(v.name)) ??
    vi[0] ??
    null
  );
}

export function speakVi(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  const run = () => {
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text.normalize("NFC"));
    u.lang = "vi-VN";
    u.rate = 0.95;
    const v = pickVoice();
    if (v) u.voice = v;
    synth.speak(u);
  };
  if (synth.getVoices().length === 0) {
    synth.addEventListener("voiceschanged", run, { once: true });
  } else {
    run();
  }
}
