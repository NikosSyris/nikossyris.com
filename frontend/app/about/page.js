import Image from "next/image";

export const metadata = {
  title: "About",
  description: "A bit about me and this blog.",
};

export default function AboutPage() {
  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      <div className="not-prose flex justify-center mb-8">
        <div className="relative w-36 h-36 rounded-full overflow-hidden">
          <Image
            src="/avatar.png"
            alt="Nikos Syris"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      <p>
        Hi, I&apos;m Nikos, a software developer from Greece, mostly focused
        on backend development and infrastructure. I&apos;ve always enjoyed
        reading about new concepts and experimenting with them, but writing
        about something forces you to actually understand it. That&apos;s the
        main reason this blog exists and if it turns out to be useful to someone
        else, even better.
      </p>

      <h2>Get in touch</h2>
      <ul>
        <li>
          <a href="https://github.com/NikosSyris" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </li>
        <li>
          <a href="https://www.linkedin.com/in/nikossyris" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </li>
      </ul>
    </article>
  );
}
