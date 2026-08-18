import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./marketing.css";

export const metadata: Metadata = {
  description:
    "MaruCheck independently verifies that AI-generated software still satisfies approved product behavior.",
  title: {
    default: "MaruCheck — Test what your AI didn't",
    template: "%s · MaruCheck",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
