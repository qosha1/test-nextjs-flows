import type { Metadata } from "next";
import "./globals.css";

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
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
