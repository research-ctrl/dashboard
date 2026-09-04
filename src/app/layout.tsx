import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { cookies } from "next/headers";

import { parseTheme, THEME_BOOTSTRAP, THEME_COOKIE } from "@/lib/theme";

/**
 * Project-wide typeface. Swap JetBrains_Mono for another Google font here
 * (e.g. IBM_Plex_Mono, Roboto_Mono, Space_Mono) and the whole app follows.
 */
const sans = JetBrains_Mono({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Stamped on the server so the first paint is already the right theme.
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <html
      lang="en"
      className={`${sans.variable} h-full antialiased${theme === "dark" ? " dark" : ""}`}
      /* The bootstrap script below can add `dark` before React hydrates, which
         React would otherwise report as a mismatch on this element. */
      suppressHydrationWarning
    >
      <head>
        {theme === null && (
          <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        )}
      </head>
      <body className="flex min-h-full flex-col bg-canvas text-ink">
        {children}
      </body>
    </html>
  );
}
