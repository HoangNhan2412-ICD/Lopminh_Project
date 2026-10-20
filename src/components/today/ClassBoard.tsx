"use client";

import { BookOpen, Star, Trash2, UserX } from "lucide-react";
import Link from "next/link";
import { buttonCls, Card, CardHeader, Chip, type Tone } from "@/components/ui";
import { NOTE_KINDS } from "@/lib/notes/parse";
import { honorificLower } from "@/lib/persona/honorific";
import { useApp } from "@/lib/store/app-store";
import { capFirst } from "@/lib/text";
import type { ClassInfo, NoteKind, Student, StudentNote } from "@/lib/types";

const KIND_TONE: Record<NoteKind, Tone> = {
  "chuyen-can": "homeroom",
  "suc-khoe": "urgent",
  "tam-ly": "subject",
  "hoc-tap": "accent",
  "khen-thuong": "success",
  khac: "neutral",
};

function NoteLine({ note, onRemove }: { note: StudentNote; onRemove: () => void }) {
  return (
    <li className="flex items-start justify-between gap-2 py-1.5">
      <span className="flex flex-wrap items-center gap-2">
        <Chip tone={KIND_TONE[note.kind]}>{NOTE_KINDS[note.kind]}</Chip>
        <span>{note.text}</span>
        {note.until && <span className="text-sm text-ink-muted">đến {note.until.split("-").reverse().slice(0, 2).join("/")}</span>}
      </span>
      <button
        onClick={onRemove}
        className="flex size-11 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-muted hover:text-urgent"
        aria-label="Xóa ghi chú"
      >
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}

function StudentRow({ student, notes, onRemove }: { student: Student; notes: StudentNote[]; onRemove: (id: string) => void }) {
  const absent = notes.some((n) => n.absentToday);
  return (
    <li className="border-b border-border px-5 py-3 last:border-b-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">{student.fullName}</span>
        {absent && (
          <Chip tone="urgent">
            <UserX className="size-4" aria-hidden /> Vắng
          </Chip>
        )}
        {student.traits.map((t) => (
          <Chip key={t}>{t}</Chip>
        ))}
      </div>
      {notes.length > 0 && (
        <ul className="mt-1">
          {notes.map((n) => (
            <NoteLine key={n.id} note={n} onRemove={() => onRemove(n.id)} />
          ))}
        </ul>
      )}
    </li>
  );
}

/** Bảng lớp: lớp chủ nhiệm xem đủ mọi mặt, lớp bộ môn chỉ giữ ba thứ cần cho tiết dạy. */
export function ClassBoard({ cls }: { cls: ClassInfo }) {
  const { profile, students, notes, removeNote } = useApp();
  const h = honorificLower(profile);
  const roster = students.filter((s) => s.classId === cls.id);
  const classNotes = notes.filter((n) => n.classId === cls.id);
  const notesOf = (sid: string) => classNotes.filter((n) => n.studentId === sid);
  const unmatched = classNotes.filter((n) => !n.studentId);
  const absentCount = roster.filter((s) => notesOf(s.id).some((n) => n.absentToday)).length;
  const homeroom = cls.role === "chu-nhiem";

  const header = (
    <CardHeader
      icon={homeroom ? <Star className="size-6 fill-homeroom text-homeroom" /> : <BookOpen className="size-6 text-subject" />}
      title={`Lớp ${cls.name} · ${homeroom ? "Chủ nhiệm" : `Bộ môn ${cls.subject}`}`}
      subtitle={`Sĩ số ${roster.length} · có mặt ${roster.length - absentCount} · vắng ${absentCount}`}
    />
  );

  if (homeroom) {
    const withNotes = roster.filter((s) => notesOf(s.id).length > 0);
    const others = roster.filter((s) => notesOf(s.id).length === 0);
    return (
      <Card data-tour="class">
        {header}
        <div className="mt-3 border-t border-border">
          {withNotes.length > 0 && (
            <>
              <p className="bg-surface-muted px-5 py-2 text-sm font-semibold text-ink-muted">Cần {h} để ý hôm nay</p>
              <ul>
                {withNotes.map((s) => (
                  <StudentRow key={s.id} student={s} notes={notesOf(s.id)} onRemove={removeNote} />
                ))}
              </ul>
            </>
          )}
          {unmatched.length > 0 && (
            <div className="border-t border-border px-5 py-3">
              <p className="text-sm font-semibold text-homeroom">Ghi chú chưa gắn với học sinh nào</p>
              <ul>
                {unmatched.map((n) => (
                  <NoteLine key={n.id} note={{ ...n, text: `${n.rawName ? `${n.rawName}: ` : ""}${n.text}` }} onRemove={() => removeNote(n.id)} />
                ))}
              </ul>
            </div>
          )}
          <details className="border-t border-border">
            <summary className="flex min-h-12 cursor-pointer items-center px-5 font-medium text-primary">
              Xem {others.length} em còn lại
            </summary>
            <ul>
              {others.map((s) => (
                <StudentRow key={s.id} student={s} notes={[]} onRemove={removeNote} />
              ))}
            </ul>
          </details>
        </div>
      </Card>
    );
  }

  // Lớp bộ môn: chỉ giữ vắng mặt, việc học cần cải thiện, và em làm tốt.
  const absent = roster.filter((s) => notesOf(s.id).some((n) => n.absentToday));
  const needHelp = roster.filter(
    (s) => notesOf(s.id).some((n) => n.kind === "hoc-tap") || s.traits.some((t) => /nợ|dưới trung bình|hổng/i.test(t)),
  );
  const doingWell = roster.filter((s) => notesOf(s.id).some((n) => n.kind === "khen-thuong"));

  const section = (title: string, list: Student[], empty: string, tone: Tone) => (
    <div className="border-t border-border px-5 py-3">
      <p className="text-sm font-semibold text-ink-muted">{title}</p>
      {list.length === 0 ? (
        <p className="py-1 text-ink-muted">{empty}</p>
      ) : (
        <ul className="mt-1 space-y-1.5">
          {list.map((s) => {
            const detail = notesOf(s.id).find((n) => n.kind !== "tam-ly" && n.kind !== "khac")?.text ?? s.traits[0];
            return (
              <li key={s.id} className="flex flex-wrap items-center gap-2">
                <Chip tone={tone}>{s.shortName}</Chip>
                <span>{s.fullName}</span>
                {detail && <span className="text-ink-muted">— {detail}</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  return (
    <Card>
      {header}
      <div className="mt-3">
        {section("Vắng tiết này", absent, "Hôm nay lớp đủ, không em nào vắng.", "urgent")}
        {section("Cần cải thiện / gọi lên gỡ điểm", needHelp, "Chưa có em nào cần gỡ điểm.", "accent")}
        {section("Làm tốt, nên khen", doingWell, `Có em nào làm tốt, ${h} ghi vào ô bên cạnh nhé.`, "success")}
        {absent.length > 0 && (
          <div className="border-t border-border px-5 py-3">
            <Link href="/soan-bai" className={buttonCls("secondary", "sm")}>
              Tạo phiếu bài tập bù cho em vắng
            </Link>
          </div>
        )}
      </div>
      <p className="border-t border-border px-5 py-3 text-sm text-ink-muted">
        {capFirst(h)} đang xem lớp bộ môn nên phần hạnh kiểm, gia đình, tâm lý được ẩn cho gọn.
      </p>
    </Card>
  );
}
