import ReactMarkdown from "react-markdown";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { notFound } from "next/navigation";
import Image from "next/image";
import Comments from "@/components/Comments";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      ...(post.coverUrl && {
        images: [{ url: post.coverUrl, width: 1200, height: 630 }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      ...(post.coverUrl && { images: [post.coverUrl] }),
    },
  };
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function PostPage({ params }) {
  const { slug } = await params;

  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <article>
      <header className="mb-10">
        <time
          className="text-base md:text-xl text-[var(--muted)]"
          dateTime={post.date}
        >
          {formatDate(post.date)}
        </time>
        <h1 className="mt-2 text-4xl md:text-6xl font-bold leading-tight">{post.title}</h1>
        {post.excerpt && (
          <p className="mt-3 text-lg md:text-xl text-[var(--muted)] leading-relaxed">{post.excerpt}</p>
        )}
      </header>

      {post.coverUrl && (
        <div className="relative w-full h-64 mb-10 rounded-lg overflow-hidden">
          <Image
            src={post.coverUrl}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="prose prose-zinc dark:prose-invert max-w-none">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      <div className="mt-16 pt-8 border-t border-[var(--border)]">
        <Comments />
      </div>
    </article>
  );
}
