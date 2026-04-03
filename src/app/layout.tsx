import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";  

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Incakola Ruleta Buenazo",
  description: "¡Gira la ruleta y gana premios increíbles con Incakola en el Buenazo Fest 2026! Participa en nuestra promoción exclusiva y descubre qué premio te espera. ¡No te lo pierdas!",
  // AGREGAMOS EL ICONO AQUÍ
  icons: {
    icon: "/favicon.png",
    // Opcional: puedes agregar el apple-touch-icon si lo deseas
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}