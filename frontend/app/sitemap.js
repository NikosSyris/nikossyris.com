import { getAllPosts } from "@/lib/posts";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

export default function sitemap() {
  const posts = getAllPosts();

  const postEntries = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: post.date,
  }));

  return [
    { url: baseUrl },
    { url: `${baseUrl}/about` },
    ...postEntries,
  ];
}
