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
      <h1 className="text-3xl font-bold mb-10">Posts</h1>

      {posts.length === 0 && (
        <p className="text-zinc-500">No posts yet.</p>
      )}

      <ul className="flex flex-col gap-10">
        {posts.map((post) => (
          <li key={post.slug}>
            <article>
              <time className="text-sm text-zinc-500" dateTime={post.date}>
                {formatDate(post.date)}
              </time>

              <h2 className="mt-1 text-xl font-semibold">
                <Link
                  href={`/posts/${post.slug}`}
                  className="hover:text-zinc-600 transition-colors"
                >
                  {post.title}
                </Link>
              </h2>

              {post.excerpt && (
                <p className="mt-2 text-zinc-600 leading-relaxed">
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
