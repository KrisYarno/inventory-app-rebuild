import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { getCSRFToken } from "@/lib/csrf";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: [
    {
      path: "./fonts/JetBrainsMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/JetBrainsMono-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/JetBrainsMono-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Inventory App",
  description: "Modern inventory management system",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Generate or get existing CSRF token server-side
  const csrfToken = await getCSRFToken();
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="csrf-token" content={csrfToken} />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <AuthProvider>
            <QueryProvider>
              {children}
            </QueryProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
