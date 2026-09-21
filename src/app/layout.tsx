import type { Metadata } from "next";
import { Kalam, Caveat, Shadows_Into_Light } from "next/font/google";
import "./globals.css";

const kalam = Kalam({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-kalam",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-caveat",
  display: "swap",
});

const shadows = Shadows_Into_Light({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-shadows",
  display: "swap",
});

export const metadata: Metadata = {
  title: "My Diary — personal handwritten notebook",
  description:
    "A single-user digital notebook with handwritten styling, notebooks & pages, and PDF export.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${kalam.variable} ${caveat.variable} ${shadows.variable} antialiased`}
      >
        {/* SVG filter for a subtle hand-wobble on underlines (progressive enhancement) */}
        <svg width="0" height="0" className="absolute" aria-hidden>
          <defs>
            <filter id="wobble">
              <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="1" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="0.6" />
            </filter>
          </defs>
        </svg>
        {children}
      </body>
    </html>
  );
}
