"use client";

import { Brain, Mic, RotateCcw, Send, Square, Volume2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BeBangAvatar } from "@/components/BeBangAvatar";
import { LoadPicker } from "@/components/sanctuary/LoadPicker";
import { Button, Card } from "@/components/ui";
import { useSpeechToText } from "@/lib/hooks";
import { useLocal } from "@/lib/local-store";
import { addressOf, fixAddress, honorificLower } from "@/lib/persona/honorific";
import { periodsToday } from "@/lib/schedule";
import { speakVi } from "@/lib/speech";
import { useApp } from "@/lib/store/app-store";
import { capFirst, cn, nfc } from "@/lib/text";
import { vnDateLabel, vnNow } from "@/lib/time";

interface Msg {
  id: string;
  role: "user" | "model";
  text: string;
}

const HISTORY_SENT = 8;
const HISTORY_KEPT = 60;

function storageKey(profileId: string) {
  return `lm:chat:${profileId}`;
}

export function ChatView() {
  const { profile, load, notes, classes, timetable } = useApp();
  const h = honorificLower(profile);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [demo, setDemo] = useState(false);
  const [memory, setMemory] = useLocal<string>(`lm:chatmem:${profile.id}`, "");
  const listRef = useRef<HTMLDivElement>(null);

  // Lịch sử trò chuyện tách riêng theo từng hồ sơ.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(profile.id));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- nạp lịch sử của đúng hồ sơ từ localStorage
      setMessages(raw ? (JSON.parse(raw) as Msg[]) : []);
    } catch {
      setMessages([]);
    }
  }, [profile.id]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const persist = useCallback(
    (list: Msg[]) => {
      try {
        localStorage.setItem(storageKey(profile.id), JSON.stringify(list.slice(-HISTORY_KEPT)));
      } catch {
        /* bỏ qua */
      }
    },
    [profile.id],
  );

  const appendSpoken = useCallback((t: string) => setInput((p) => (p ? `${p} ${t}` : t)), []);
  const speech = useSpeechToText(appendSpoken);

  function todayContext() {
    const now = vnNow();
    const periods = periodsToday(timetable, now);
    const homeroom = classes.find((c) => c.role === "chu-nhiem");
    const absent = notes.filter((n) => n.absentToday && n.classId === homeroom?.id).length;
    return `${vnDateLabel(now)}, ${now.hh} giờ ${now.mm}. Hôm nay có ${periods.length} tiết.${
      homeroom ? ` Lớp chủ nhiệm ${homeroom.name} có ${absent} em vắng.` : ""
    }`;
  }

  async function send(textArg?: string) {
    const text = nfc((textArg ?? input).trim());
    if (!text || streaming) return;
    if (speech.listening) speech.stop();
    const userMsg: Msg = { id: `u-${Date.now()}`, role: "user", text };
    const botMsg: Msg = { id: `m-${Date.now()}`, role: "model", text: "" };
    const history = messages.slice(-HISTORY_SENT).map(({ role, text }) => ({ role, text }));
    const next = [...messages, userMsg, botMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, load, todayContext: todayContext(), history, message: text, memory }),
      });
      if (!res.ok || !res.body) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(err?.error ?? "Bé Bảng chưa trả lời được.");
      }
      setDemo(res.headers.get("X-LM-Mode") === "demo");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const shown = acc;
        setMessages((list) => list.map((m) => (m.id === botMsg.id ? { ...m, text: shown } : m)));
      }
      const final = [...messages, userMsg, { ...botMsg, text: fixAddress(acc, profile) }];
      setMessages(final);
      persist(final);
      // Cứ 4 lượt thì cập nhật sổ ghi nhớ ở chế độ nền (model nhanh, không chặn trò chuyện)
      const userTurns = final.filter((m) => m.role === "user").length;
      if (userTurns % 4 === 0) {
        void fetch("/api/chat/memory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memory, recent: final.slice(-10).map(({ role, text }) => ({ role, text })) }),
        })
          .then((r) => r.json())
          .then((d: { memory?: string }) => d.memory !== undefined && d.memory !== memory && setMemory(d.memory))
          .catch(() => {});
      }
    } catch (e) {
      toast.error((e as Error).message);
      setMessages((list) => list.filter((m) => m.id !== botMsg.id));
    } finally {
      setStreaming(false);
    }
  }

  const starters = [
    "Hôm nay mệt quá, tiết nào cũng ồn",
    "Phụ huynh nhắn trách lúc 10 giờ tối",
    "Lo không đạt chỉ tiêu thi đua năm nay",
  ];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
      <Card className="flex h-[calc(100dvh-13rem)] min-h-[28rem] flex-col lg:h-[calc(100dvh-9rem)]">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <BeBangAvatar size={44} mood={streaming ? "nghe" : "vui"} />
            <div>
              <h1 className="text-lg font-semibold">Góc Cởi Bỏ Chiếc Áo</h1>
              <p className="text-sm text-ink-muted">Ở đây {h} không cần là giáo viên. Cứ kể, Bé Bảng nghe.</p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMessages([]);
                persist([]);
              }}
              aria-label="Bắt đầu cuộc trò chuyện mới"
            >
              <RotateCcw className="size-4" aria-hidden /> <span className="hidden sm:inline">Trò chuyện mới</span>
            </Button>
          )}
        </div>

        <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5" aria-live="polite">
          {messages.length === 0 && (
            <div className="mx-auto max-w-md py-6 text-center">
              <BeBangAvatar size={72} />
              <p className="mt-3 text-lg font-medium">{addressOf(profile)} muốn kể chuyện gì hôm nay?</p>
              <p className="mt-1 text-ink-muted">Chuyện lớp, chuyện nhà, hay chỉ cần than một câu cũng được.</p>
              <div className="mt-4 flex flex-col gap-2">
                {starters.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="min-h-11 rounded-xl border border-border px-4 py-2 text-left hover:bg-surface-muted"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) => {
            const mine = m.role === "user";
            const text = mine ? m.text : fixAddress(m.text, profile);
            return (
              <div key={m.id} className={cn("flex gap-3", mine && "justify-end")}>
                {!mine && <BeBangAvatar size={36} />}
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-base leading-relaxed",
                    mine ? "rounded-br-md bg-primary text-primary-fg" : "rounded-bl-md bg-surface-muted",
                  )}
                >
                  {text || <span className="inline-flex gap-1 text-ink-muted" aria-label="Bé Bảng đang gõ">• • •</span>}
                  {!mine && text && !streaming && (
                    <button
                      onClick={() => speakVi(text)}
                      className="mt-1 flex min-h-11 items-center gap-1.5 text-sm text-primary"
                      aria-label="Đọc to câu trả lời"
                    >
                      <Volume2 className="size-4" aria-hidden /> Đọc to
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {demo && (
          <p className="border-t border-border bg-accent-soft px-5 py-2 text-sm">
            Đang chạy chế độ demo: chưa có GEMINI_API_KEY nên Bé Bảng trả lời theo mẫu.
          </p>
        )}

        <form
          className="flex items-end gap-2 border-t border-border p-3"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          {speech.supported && (
            <button
              type="button"
              onClick={speech.listening ? speech.stop : speech.start}
              className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-xl border",
                speech.listening ? "animate-pulse border-urgent bg-urgent text-primary-fg" : "border-border text-primary hover:bg-surface-muted",
              )}
              aria-label={speech.listening ? "Dừng nghe" : "Nói thay vì gõ"}
            >
              {speech.listening ? <Square className="size-5" /> : <Mic className="size-6" />}
            </button>
          )}
          <label htmlFor="chat-input" className="sr-only">Lời nhắn</label>
          <textarea
            id="chat-input"
            value={speech.interim ? `${input} ${speech.interim}` : input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder={`${capFirst(h)} cứ kể, Enter để gửi…`}
            className="max-h-40 min-h-12 flex-1 resize-none rounded-xl border border-border bg-surface px-4 py-3 text-base focus:border-primary focus:outline-none"
          />
          <Button type="submit" disabled={streaming || !input.trim()} className="size-12 shrink-0 px-0" aria-label="Gửi">
            <Send className="size-5" />
          </Button>
        </form>
      </Card>

      <div className="space-y-5">
        <Card className="p-5">
          <LoadPicker compact />
        </Card>
        <Card className="p-5">
          <p className="flex items-center gap-2 font-semibold">
            <Brain className="size-5 text-primary" aria-hidden /> Bé Bảng đang nhớ
          </p>
          {memory.trim() ? (
            <>
              <ul className="mt-2 space-y-1">
                {memory
                  .split("\n")
                  .map((l) => l.replace(/^-\s*/, "").trim())
                  .filter(Boolean)
                  .map((line, i, all) => (
                    <li key={`${i}-${line}`} className="flex items-start gap-2 text-ink-muted">
                      <span className="flex-1">{line}</span>
                      <button
                        className="flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-urgent-soft hover:text-urgent"
                        aria-label={`Quên ý: ${line}`}
                        onClick={() => setMemory(all.filter((_, j) => j !== i).map((x) => `- ${x}`).join("\n"))}
                      >
                        <X className="size-4" />
                      </button>
                    </li>
                  ))}
              </ul>
              <Button variant="ghost" size="sm" className="-ml-3 mt-1 text-urgent hover:bg-urgent-soft" onClick={() => setMemory("")}>
                Quên hết
              </Button>
            </>
          ) : (
            <p className="mt-1 text-ink-muted">Trò chuyện vài lượt, Bé Bảng sẽ ghi lại vài điều để lần sau hỏi thăm cho đúng. {capFirst(h)} xem và xóa được ở đây.</p>
          )}
        </Card>
        <Card className="p-5 text-ink-muted">
          <p className="font-semibold text-ink">Chuyện ở đây là của riêng {h}</p>
          <p className="mt-1">
            Không ai trong trường đọc được; lời nhắn chỉ được gửi tới Gemini để Bé Bảng trả lời. Nếu {h} thấy quá sức kéo dài, hãy nói với người thân hoặc gặp chuyên gia tâm lý — Bé Bảng có thể giúp tìm nơi hỗ trợ.
          </p>
        </Card>
      </div>
    </div>
  );
}
