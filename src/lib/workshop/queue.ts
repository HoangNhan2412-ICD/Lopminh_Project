export type QueueState<T> = { status: "cho" | "dang-lam" | "xong" | "loi"; progress: number; message?: string; result?: T };
export type Work<T> = { id: string; run: (progress: (value: number) => void) => Promise<T> };

/** Lỗi của một file không hủy những file còn lại. Không giữ rejected promise khi thử lại. */
export async function runQueue<T>(jobs: Work<T>[], update: (id: string, state: QueueState<T>) => void) {
  for (const job of jobs) {
    update(job.id, { status: "dang-lam", progress: 0 });
    try {
      const result = await job.run(progress => update(job.id, { status: "dang-lam", progress: Math.max(0, Math.min(99, progress)) }));
      update(job.id, { status: "xong", progress: 100, result });
    } catch {
      // Không phản chiếu lỗi SDK: có thể chứa yêu cầu và dữ liệu riêng.
      update(job.id, { status: "loi", progress: 0, message: "Chưa tạo được file này. Hãy kiểm tra yêu cầu, tham số rồi thử lại." });
    }
  }
}
