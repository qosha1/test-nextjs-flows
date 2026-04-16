import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { ToastProvider } from "@/lib/toast";

export const metadata: Metadata = {
  title: "test-nextjs-flows",
  description:
    "Non-trivial Next.js flows for evaluating DebuggAI's E2E workflow against ground truth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">
        <ToastProvider>
          <nav className="border-b px-6 py-3 text-sm">
            <Link
              href="/"
              className="font-medium hover:underline"
              data-testid="nav-home"
            >
              ← test-nextjs-flows
            </Link>
          </nav>
          <div className="flex-1">{children}</div>
        </ToastProvider>
      </body>
    </html>
  );
}
