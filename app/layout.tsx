import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { AppLayout } from "@/components/app-layout";

export const metadata: Metadata = {
  title: "MockAPI — AI-powered API Mocking",
  description:
    "Describe your endpoint, get a live URL that returns realistic JSON instantly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
