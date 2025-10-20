import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LayoutContent } from "@/components/LayoutContent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Portal",
  description: "Modern admin portal with premium UI design",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <TooltipProvider>
            <LayoutContent>
              {children}
            </LayoutContent>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}