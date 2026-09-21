import type { Metadata } from "next";
import { Bebas_Neue, Manrope } from "next/font/google";
import { club } from "@/lib/club";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${club.name} · ${club.league}`,
  description: `${club.origin}. Fundado el ${club.foundedOn} en la ${club.foundedPlace}. Fútbol y hockey en la ${club.league} de ${club.country}.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${bebasNeue.variable} ${manrope.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bordo text-white">
        {children}
      </body>
    </html>
  );
}
