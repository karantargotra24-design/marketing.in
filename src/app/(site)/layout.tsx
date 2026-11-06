import type { Metadata } from "next";
import { Anton, Inter, JetBrains_Mono } from "next/font/google";
import { BRAND } from "@/portfolio/brand";
import { SmoothScroll } from "@/portfolio/components/SmoothScroll";
import { Cursor } from "@/portfolio/components/Cursor";
import { Nav } from "@/portfolio/components/Nav";
import { Footer } from "@/portfolio/components/Footer";
import { GridOverlay } from "@/portfolio/components/Personal";

const display = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display-face", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-face", display: "swap" });
const body = Inter({ subsets: ["latin"], variable: "--font-body-face", display: "swap" });

export const metadata: Metadata = {
  title: `${BRAND.person} | Performance Marketer & Growth Strategist, Jammu`,
  description:
    "Meta Ads, lead generation, WhatsApp marketing and brand strategy for car dealerships, real estate and local brands across J&K and India.",
  openGraph: { type: "website", siteName: BRAND.name, locale: "en_IN" },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`portfolio ${display.variable} ${body.variable} ${mono.variable} relative min-h-screen overflow-x-clip bg-ink font-body text-fog`}>
      <SmoothScroll />
      <GridOverlay />
      <Cursor />
      <Nav />
      {children}
      <Footer />
    </div>
  );
}
