"use client";

export default function ThemeToggle() {
  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="fixed right-6 top-24 text-2xl leading-none text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
    >
      ◐
    </button>
  );
}
