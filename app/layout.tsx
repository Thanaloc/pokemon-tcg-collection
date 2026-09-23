import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import SessionProvider from "@/components/SessionProvider/SessionProvider";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/app/contexts/ToastContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Display face for titles: gives the site its own voice next to Geist.
const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pokémon TCG Collection",
  description: "Toutes les cartes Pokémon, Pokémon par Pokémon, avec leurs prix Cardmarket. Gérez votre collection et suivez l'évolution des prix.",
  icons: {
    icon: '/logo.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} antialiased`}
      >
        <ToastProvider>
          <SessionProvider>
            {children}
            <Footer />
          </SessionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}