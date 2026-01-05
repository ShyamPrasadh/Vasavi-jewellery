import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sri Vasavi Jewellery",
  description: "Calculate accurate gold jewellery prices with wastage and making charges.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/svj-1.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Sri Vasavi Jewellery",
    description: "Calculate accurate gold jewellery prices with wastage and making charges.",
    images: [
      {
        url: "/svj-1.png",
        width: 800,
        height: 800,
        alt: "Sri Vasavi Jewellery Logo",
      },
    ],
  },
};

import ClientLayout from "./ClientLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
