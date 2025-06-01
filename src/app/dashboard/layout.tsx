"use client"

import { SessionProvider } from "next-auth/react"; // Import SessionProvider
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
