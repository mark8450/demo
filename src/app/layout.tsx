import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "ClassConnect Pro - Modern Learning Management System",
  description: "Connect teachers, students, and parents with a unified modern learning platform. Manage homework, lessons, quizzes, and track progress seamlessly.",
  keywords: ["ClassConnect Pro", "education", "learning management", "teachers", "students", "parents", "homework", "quizzes", "lessons"],
  authors: [{ name: "ClassConnect Pro Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "ClassConnect Pro",
    description: "Modern learning management system connecting teachers, students, and parents",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClassConnect Pro",
    description: "Modern learning management system",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
