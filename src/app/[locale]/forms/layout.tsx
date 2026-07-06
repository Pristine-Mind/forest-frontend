import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forms Management - Forest Management System",
  description: "Create and manage survey forms and cutting registers",
};

export default function FormsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container">
      {children}
    </div>
  );
}
