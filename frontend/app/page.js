import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div>
      {posts.length === 0 && (
        <p className="text-[var(--muted)]">No posts yet.</p>
      )}

      <ul className="flex flex-col divide-y divide-[var(--border)]">
        {posts.map((post) => (
          <li key={post.slug} className="py-8 first:pt-0">
            <article>
              <time
                className="text-base text-[var(--muted)]"
                dateTime={post.date}
              >
                {formatDate(post.date)}
              </time>

              <h2 className="mt-1 text-2xl font-bold leading-snug">
                <Link
                  href={`/posts/${post.slug}`}
                  className="hover:opacity-70 transition-opacity"
                >
                  {post.title}
                </Link>
              </h2>
              <div className="w-5 h-0.5 bg-[var(--foreground)] mt-1.5 opacity-80" />

              {post.excerpt && (
                <p className="mt-3 text-base leading-relaxed text-[var(--muted)]">
                  {post.excerpt}
                </p>
              )}
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
