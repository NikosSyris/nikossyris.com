import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "My Blog",
    template: "%s | My Blog",
  },
  description: "A personal blog about software development.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-white text-zinc-900">
        <header className="border-b border-zinc-200">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="font-semibold text-lg hover:text-zinc-600 transition-colors">
              My Blog
            </Link>
            <nav className="flex gap-6 text-sm">
              <Link href="/about" className="hover:text-zinc-600 transition-colors">
                About
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
          {children}
        </main>

        <footer className="border-t border-zinc-200">
          <div className="max-w-2xl mx-auto px-4 py-6 text-sm text-zinc-500">
            © {new Date().getFullYear()} My Blog
          </div>
        </footer>
      <Analytics />
      </body>
    </html>
  );
}
