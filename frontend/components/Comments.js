"use client";

import Giscus from "@giscus/react";
import { useEffect, useState } from "react";

export default function Comments() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const update = () =>
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");

    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <Giscus
      repo={process.env.NEXT_PUBLIC_GISCUS_REPO}
      repoId={process.env.NEXT_PUBLIC_GISCUS_REPO_ID}
      category={process.env.NEXT_PUBLIC_GISCUS_CATEGORY}
      categoryId={process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID}
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="bottom"
      theme={theme}
      lang="en"
    />
  );
}
