import type { Metadata } from "next";
import localFont from "next/font/local";
import { WorkspaceProvider } from "@/components/workspace-provider";
import { OfflineProvider } from "@/components/offline-provider";
import { LanguageProvider } from "@/components/language-provider";
import "./globals.css";
const manrope = localFont({
  src: "../../public/fonts/manrope-latin-wght-normal.woff2",
  variable: "--font-manrope",
  weight: "200 800",
  display: "swap",
});
export const metadata: Metadata = {
  title: "STEMBridge — Find your people. Build what's next.",
  description:
    "A community for women in STEM. Find mentors, meet collaborators, and turn opportunities into your next step.",
  icons: { icon: "/icon.svg" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>
        <LanguageProvider>
          <OfflineProvider>
            <WorkspaceProvider>{children}</WorkspaceProvider>
          </OfflineProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
