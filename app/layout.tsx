import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Bible Coloring Journey | Genesis Coloring Book for Kids",
  description: "A printable and interactive Bible coloring experience for Christian families, homeschool, and Sunday school. Help your child discover Genesis through coloring, Bible stories, and faith-filled games.",
  keywords: "Bible coloring book, kids Bible activities, Genesis coloring, Sunday school, homeschool, Christian kids, printable Bible activities",
  openGraph: {
    title: "Bible Coloring Journey | Genesis Coloring Book for Kids",
    description: "Help your child discover the Bible through coloring. Faith-filled printable activities for Christian families, homeschool, and Sunday school.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ backgroundColor: "#F8F1E7" }}>
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
