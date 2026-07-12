import type { Metadata } from "next";
import "./globals.css";
import RefreshGuard from "@/components/RefreshGuard";

export const metadata: Metadata = {
  title: "회의 조율",
  description: "6명이 함께 회의 시간을 잡는 가장 쉬운 방법",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-white">
        <RefreshGuard />
        {children}
      </body>
    </html>
  );
}
