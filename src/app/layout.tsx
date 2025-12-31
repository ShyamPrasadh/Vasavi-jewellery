import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sri Vasavi Jewellery - Smart Price Calculator",
  description: "Calculate accurate gold jewellery prices with wastage and making charges.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Sri Vasavi Jewellery - Smart Price Calculator",
    description: "Calculate accurate gold jewellery prices with wastage and making charges.",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Sri Vasavi Jewellery Logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
