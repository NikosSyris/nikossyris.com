import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import Providers from "./providers";
import ThemeToggle from "@/components/ThemeToggle";
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
    default: "Nikos Syris' Blog",
    template: "%s | Nikos Syris",
  },
  description: "A personal blog about software development.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}})()` }} />
      </head>
      <body className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] antialiased">
        <Providers>
          <header className="border-b border-[var(--border)]">
            <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
              <Link
                href="/"
                className="text-lg md:text-2xl font-bold tracking-tight hover:opacity-70 transition-opacity"
              >
                Nikos Syris&apos; Blog
              </Link>
              <nav className="flex items-center gap-6 text-base md:text-lg text-[var(--muted)]">
                <Link href="/" className="hover:text-[var(--foreground)] transition-colors">
                  Posts
                </Link>
                <Link href="/about" className="hover:text-[var(--foreground)] transition-colors">
                  About
                </Link>
              </nav>
            </div>

          </header>

          <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
            {children}
          </main>

          <footer className="border-t border-[var(--border)]">
            <div className="max-w-4xl mx-auto px-4 py-6 text-sm text-[var(--muted)]">
              © {new Date().getFullYear()} Nikos Syris
            </div>
          </footer>

          <ThemeToggle />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
