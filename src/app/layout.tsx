import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "@fontsource/be-vietnam-pro/vietnamese-400.css";
import "@fontsource/be-vietnam-pro/vietnamese-500.css";
import "@fontsource/be-vietnam-pro/vietnamese-600.css";
import "@fontsource/be-vietnam-pro/vietnamese-700.css";
import "@fontsource/be-vietnam-pro/latin-400.css";
import "@fontsource/be-vietnam-pro/latin-500.css";
import "@fontsource/be-vietnam-pro/latin-600.css";
import "@fontsource/be-vietnam-pro/latin-700.css";
import "./globals.css";
import { AppShell } from "@/components/shell/AppShell";
import { AppStoreProvider } from "@/lib/store/app-store";

export const metadata: Metadata = {
  title: "Lớp Mình — trợ lý của thầy cô",
  description: "Bé Bảng giúp thầy cô theo dõi lớp, soạn bài và nghỉ ngơi.",
};

export const viewport: Viewport = {
  themeColor: "#1e3a2f",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <AppStoreProvider>
          <AppShell>{children}</AppShell>
        </AppStoreProvider>
        <Toaster position="top-center" richColors closeButton toastOptions={{ style: { fontSize: "1rem" } }} />
      </body>
    </html>
  );
}
