import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Evimes Reserva",
  description: "Sistema de reservas para restaurantes",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Evimes",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/api/icon/192" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
