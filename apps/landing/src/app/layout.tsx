import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { SITE_URL } from "@/src/config";
import "./globals.css";

// The brand fonts: Bricolage Grotesque for headlines (800 for the main heading, 700 for the rest), Atkinson Hyperlegible for text.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  weight: ["700", "800"],
  subsets: ["latin"],
});

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SmartLearnersHQ · Learn smart, pass with confidence.",
    template: "SmartLearnersHQ | %s",
  },
  description:
    "Prep for JAMB, WAEC and more with lessons, practice tests, live classes and Brainy, your AI study buddy. SmartLearnersHQ: learn smart, pass with confidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${atkinson.variable} ${bricolage.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
