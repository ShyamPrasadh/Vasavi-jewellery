import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sri Vasavi Jewellery",
  description: "Calculate accurate gold jewellery prices with wastage and making charges.",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "Sri Vasavi Jewellery",
    description: "Calculate accurate gold jewellery prices with wastage and making charges.",
    images: [
      {
        url: "/logo.jpg",
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
