"use client";

import { CalendarClock, Check, ClipboardCopy, Inbox, LoaderCircle, Mail, MessageSquareText, PenLine, Plug, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button, Card, CardHeader, Chip, type Tone } from "@/components/ui";
import { demoMails } from "@/lib/demo/mail";
import { useLocal } from "@/lib/local-store";
import { LABEL_TEXT, MAIL_LABELS, type MailItem, type MailLabel, type RawMail } from "@/lib/mail/classify";
import { honorificLower } from "@/lib/persona/honorific";
import { useApp } from "@/lib/store/app-store";
import { capFirst, cn, nfc, stripDiacritics } from "@/lib/text";

const inputCls =
  "w-full rounded-xl border border-border bg-surface px-3 py-2 text-base text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none";
const EMPTY: MailItem[] = [];

const TONE: Record<MailLabel, Tone> = {
  khan: "urgent",
  "chu-nhiem": "homeroom",
  "bo-mon": "subject",
  "phu-huynh": "accent",
  "hanh-chinh": "neutral",
  "khong-lien-quan": "neutral",
};
const EDGE: Record<MailLabel, string> = {
  khan: "border-l-urgent",
  "chu-nhiem": "border-l-homeroom",
  "bo-mon": "border-l-subject",
  "phu-huynh": "border-l-accent",
  "hanh-chinh": "border-l-border",
  "khong-lien-quan": "border-l-border",
};

function fmtDate(iso: string) {
  const [, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}`;
}

export function MailboxView() {
  const { profile, classes, today } = useApp();
  const h = honorificLower(profile);
  const [items, setItems] = useLocal<MailItem[]>(`lm:mail:${profile.id}`, EMPTY);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<MailLabel | "tat-ca" | "can-lam">("can-lam");
  const [query, setQuery] = useState("");
  const [paste, setPaste] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ id: string; text: string } | null>(null);
  const [intent, setIntent] = useState("");
  const [drafting, setDrafting] = useState(false);

  const classList = useMemo(() => classes.map((c) => ({ id: c.id, name: c.name, role: c.role })), [classes]);

  async function classify(mails: RawMail[]) {
    if (!mails.length) return;
    setBusy(true);
    try {
      const res = await fetch("/api/mail/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mails, classes: classList, today }),
      });
      const data = (await res.json()) as { results?: (Omit<MailItem, keyof RawMail | "done">)[]; error?: string };
      if (!res.ok || !data.results) throw new Error(data.error ?? "Chưa lọc được thư.");
      const added: MailItem[] = mails.map((m, i) => ({ ...m, ...data.results![i], done: false }));
      setItems((all) => [...added, ...all.filter((x) => !added.some((a) => a.id === x.id))]);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // Lần đầu mở ở chế độ demo: lọc hộp thư mẫu của đúng hồ sơ này
  const seedKey = `lm:mail-seeded:${profile.id}`;
  useEffect(() => {
    if (!today) return;
    let seeded = false;
    try {
      seeded = localStorage.getItem(seedKey) === "1";
      localStorage.setItem(seedKey, "1");
    } catch {
      /* bỏ qua */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- nạp hộp thư mẫu một lần, sau khi biết ngày hôm nay
    if (!seeded) void classify(demoMails(profile.id, today));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy một lần cho mỗi hồ sơ
  }, [profile.id, today]);

  function addPasted() {
    const text = nfc(paste.trim());
    if (!text) return;
    const chunks = text.split(/\n\s*\n/).filter((c) => c.trim());
    const mails: RawMail[] = chunks.map((c, i) => {
      const lines = c.trim().split("\n");
      return {
        id: `dan-${Date.now()}-${i}`,
        from: "Tin dán vào",
        subject: lines[0].slice(0, 120),
        body: lines.slice(1).join("\n") || lines[0],
        receivedAt: new Date().toISOString(),
        source: "zalo",
      };
    });
    setPaste("");
    void classify(mails);
  }

  async function makeDraft(m: MailItem) {
    setDrafting(true);
    try {
      const res = await fetch("/api/mail/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, mail: { from: m.from, subject: m.subject, body: m.body }, intent: nfc(intent) }),
      });
      const data = (await res.json()) as { draft?: string; error?: string };
      if (!res.ok || !data.draft) throw new Error(data.error ?? "Chưa viết được nháp.");
      setDraft({ id: m.id, text: data.draft });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDrafting(false);
    }
  }

  const q = stripDiacritics(query.trim());
  const visible = items
    .filter((m) => {
      if (filter === "can-lam") return !m.done && m.label !== "khong-lien-quan" && m.label !== "hanh-chinh";
      if (filter === "tat-ca") return true;
      return m.label === filter;
    })
    .filter((m) => !q || stripDiacritics(`${m.from} ${m.subject} ${m.body} ${m.summary}`).includes(q))
    .sort((a, b) => {
      const pa = a.label === "khan" ? 0 : a.deadline ? 1 : 2;
      const pb = b.label === "khan" ? 0 : b.deadline ? 1 : 2;
      return pa - pb || b.receivedAt.localeCompare(a.receivedAt);
    });

  const spam = items.filter((m) => m.label === "khong-lien-quan").length;
  const withDeadline = items.filter((m) => m.deadline && !m.done && m.label !== "khong-lien-quan");
  const parents = items.filter((m) => m.label === "phu-huynh" && !m.done).length;
  const className = (id: string | null) => classes.find((c) => c.id === id)?.name;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Hộp Thư Công Việc</h1>

      {/* Bản tin nhanh */}
      <Card className="flex flex-wrap items-start gap-4 p-5">
        <Inbox className="mt-1 size-7 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          {items.length === 0 ? (
            <p className="text-lg">{busy ? "Bé Bảng đang đọc thư…" : `Chưa có thư nào. ${capFirst(h)} dán tin nhắn bên dưới để Bé Bảng lọc.`}</p>
          ) : (
            <>
              <p className="text-lg font-semibold">
                Bé Bảng đã gạt {spam} thư không liên quan. Còn {withDeadline.length} việc có hạn và {parents} tin của phụ huynh.
              </p>
              {withDeadline.slice(0, 3).map((m) => (
                <p key={m.id} className="mt-1 flex items-center gap-2 text-ink-muted">
                  <CalendarClock className="size-4 shrink-0" aria-hidden /> Hạn {fmtDate(m.deadline!)}: {m.todo ?? m.summary}
                </p>
              ))}
            </>
          )}
        </div>
        {busy && <LoaderCircle className="size-6 animate-spin text-primary" aria-label="Đang lọc" />}
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {(["can-lam", "tat-ca", ...MAIL_LABELS] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={cn(
                  "min-h-11 rounded-full border px-4 text-sm font-medium",
                  filter === f ? "border-primary bg-primary text-primary-fg" : "border-border bg-surface hover:bg-surface-muted",
                )}
              >
                {f === "can-lam" ? "Cần làm" : f === "tat-ca" ? "Tất cả" : LABEL_TEXT[f]}
              </button>
            ))}
          </div>
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ink-muted" aria-hidden />
            <input className={cn(inputCls, "pl-10")} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm thư, gõ không dấu cũng được: hop to, an 9a…" aria-label="Tìm thư" />
          </label>

          <ul className="space-y-3">
            {visible.length === 0 && (
              <li>
                <Card className="p-5 text-ink-muted">Không có thư nào ở mục này.</Card>
              </li>
            )}
            {visible.map((m) => {
              const open = openId === m.id;
              return (
                <li key={m.id}>
                  <Card className={cn("border-l-4", EDGE[m.label], m.done && "opacity-60")}>
                    <button className="block w-full p-4 text-left" onClick={() => setOpenId(open ? null : m.id)} aria-expanded={open}>
                      <div className="flex flex-wrap items-center gap-2">
                        <Chip tone={TONE[m.label]}>{LABEL_TEXT[m.label]}{className(m.classId) ? `, lớp ${className(m.classId)}` : ""}</Chip>
                        {m.source === "zalo" ? <MessageSquareText className="size-4 text-ink-muted" aria-label="Tin Zalo" /> : <Mail className="size-4 text-ink-muted" aria-label="Email" />}
                        <span className="text-sm text-ink-muted">{m.from}</span>
                        {m.deadline && <Chip tone="urgent">Hạn {fmtDate(m.deadline)}</Chip>}
                        {m.done && <Chip tone="success">Đã xong</Chip>}
                      </div>
                      <p className="mt-2 font-semibold">{m.subject}</p>
                      <p className="mt-0.5 text-ink-muted">{m.todo ?? m.summary}</p>
                    </button>
                    {open && (
                      <div className="space-y-3 border-t border-border p-4">
                        <p className="whitespace-pre-line leading-relaxed">{m.body}</p>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" onClick={() => setItems((all) => all.map((x) => (x.id === m.id ? { ...x, done: !x.done } : x)))}>
                            <Check className="size-4" aria-hidden /> {m.done ? "Chưa xong" : "Đánh dấu đã xong"}
                          </Button>
                          <select
                            className="min-h-11 rounded-xl border border-border bg-surface px-3 text-sm"
                            value={m.label}
                            onChange={(e) => setItems((all) => all.map((x) => (x.id === m.id ? { ...x, label: e.target.value as MailLabel } : x)))}
                            aria-label="Đổi nhãn"
                          >
                            {MAIL_LABELS.map((l) => (
                              <option key={l} value={l}>
                                {LABEL_TEXT[l]}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="rounded-xl bg-surface-muted p-3">
                          <label className="block text-sm font-medium" htmlFor={`y-${m.id}`}>
                            Nhờ Bé Bảng viết nháp trả lời
                          </label>
                          <div className="mt-2 flex gap-2">
                            <input id={`y-${m.id}`} className={inputCls} value={intent} onChange={(e) => setIntent(e.target.value)} placeholder="Ý chính, ví dụ: đồng ý, hẹn thứ Năm 16h" />
                            <Button size="sm" onClick={() => makeDraft(m)} disabled={drafting} className="shrink-0">
                              {drafting ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <PenLine className="size-4" aria-hidden />} Viết nháp
                            </Button>
                          </div>
                          {draft?.id === m.id && (
                            <div className="mt-3 rounded-lg bg-surface p-3">
                              <p className="whitespace-pre-line">{draft.text}</p>
                              <div className="mt-2 flex gap-2">
                                <Button variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(draft.text).then(() => toast.success("Đã chép nháp"))}>
                                  <ClipboardCopy className="size-4" aria-hidden /> Chép
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setDraft(null)}>
                                  <X className="size-4" aria-hidden /> Bỏ
                                </Button>
                              </div>
                              <p className="mt-2 text-sm text-ink-muted">Bé Bảng không tự gửi thư. {capFirst(h)} đọc lại rồi dán vào hộp thư để gửi.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader icon={<MessageSquareText className="size-6" />} title="Dán tin nhắn Zalo hoặc email" subtitle="Nhiều tin thì cách nhau một dòng trống. Dòng đầu mỗi tin là tiêu đề." />
            <div className="space-y-3 p-5">
              <textarea rows={6} className={inputCls} value={paste} onChange={(e) => setPaste(e.target.value)} placeholder={"Thông báo họp tổ\nCác thầy cô họp tổ lúc 14h thứ Sáu tại phòng 204.\n\nPhụ huynh em Chi\nXin phép cho cháu nghỉ buổi chiều."} />
              <Button className="w-full" onClick={addPasted} disabled={busy || !paste.trim()}>
                Lọc các tin này
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader icon={<Plug className="size-6" />} title="Kết nối Gmail" subtitle="Tự đọc thư công việc mỗi sáng, chỉ đọc, không xóa không gửi" />
            <div className="space-y-2 p-5 text-ink-muted">
              <p>Mục này cần nhóm phát triển bật đăng nhập Google có quyền đọc Gmail (xem hướng dẫn trong tài liệu dự án). Khi chưa bật, {h} dán tin vào ô bên trên vẫn lọc được như thường.</p>
              <Button variant="secondary" className="w-full" disabled>
                <Mail className="size-5" aria-hidden /> Kết nối Gmail (sắp có)
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
