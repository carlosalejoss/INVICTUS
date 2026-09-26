import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";
import { getClubInfo } from "@/lib/data";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const display = Manrope({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display" });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Invictus Padel Club",
  description: "Club de pádel de Zaragoza. Cinco equipos, una misma pasión por el pádel.",
  icons: { icon: "/branding/emblem.jpg" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const club = await getClubInfo();

  return (
    <html lang="es" className={`${sans.variable} ${display.variable}`}>
      <body className="font-sans antialiased">
        <SessionProviderWrapper>
          <Navbar />
          <main>{children}</main>
          <Footer instagramUrl={club.instagramUrl} followers={club.followers} />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
