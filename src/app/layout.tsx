import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forest Management System",
  description: "Community Forest User Group management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
