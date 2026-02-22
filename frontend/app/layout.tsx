import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Green Factures – Facturation Simple",
  description: "Solution de facturation pour entrepreneurs africains",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-950 text-slate-200 antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <Toaster position="top-right" toastOptions={{
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px border #334155'
            }
          }} />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
