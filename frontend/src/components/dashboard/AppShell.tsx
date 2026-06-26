import React from "react";
import Sidebar from "@/layouts/Sidebar";

type Props = {
  children: React.ReactNode;
};

export default function AppShell({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-[#f6f3ef]">

      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}