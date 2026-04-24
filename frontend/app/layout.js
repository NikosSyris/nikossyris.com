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
    default: "Nikos Syris",
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
            <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
              <Link
                href="/"
                className="text-lg font-bold tracking-tight hover:opacity-70 transition-opacity"
              >
                Nikos Syris
              </Link>
              <nav className="flex items-center gap-6 text-base text-[var(--muted)]">
                <Link href="/" className="hover:text-[var(--foreground)] transition-colors">
                  Posts
                </Link>
                <Link href="/about" className="hover:text-[var(--foreground)] transition-colors">
                  About
                </Link>
              </nav>
            </div>

            <div className="border-t border-[var(--border)] py-3 flex justify-center gap-5">
              <a
                href="https://github.com/NikosSyris"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/in/your-username"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </header>

          <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
            {children}
          </main>

          <footer className="border-t border-[var(--border)]">
            <div className="max-w-2xl mx-auto px-4 py-6 text-sm text-[var(--muted)]">
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
