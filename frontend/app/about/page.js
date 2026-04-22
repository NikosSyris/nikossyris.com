export const metadata = {
  title: "About",
  description: "A bit about me and this blog.",
};

export default function AboutPage() {
  return (
    <article className="prose prose-zinc max-w-none">
      <h1>About</h1>

      <p>
        Hi, I&apos;m Nikolaos — a software developer based in Greece. I write
        about things I learn, projects I work on, and topics I find worth
        thinking through.
      </p>

      <h2>About this blog</h2>
      <p>
        This is my personal space for writing about software development. Posts
        are mostly about backend development, system design, and whatever else
        catches my attention.
      </p>

      <h2>Get in touch</h2>
      <ul>
        <li>
          <a href="https://github.com/your-username" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </li>
        <li>
          <a href="https://linkedin.com/in/your-username" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </li>
      </ul>
    </article>
  );
}
