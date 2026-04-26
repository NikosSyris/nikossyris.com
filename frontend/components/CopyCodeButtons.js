"use client";
import { useEffect } from "react";

export default function CopyCodeButtons() {
  useEffect(() => {
    const figures = document.querySelectorAll("[data-rehype-pretty-code-figure]");

    figures.forEach((figure) => {
      if (figure.querySelector(".copy-btn")) return;

      figure.style.position = "relative";

      const button = document.createElement("button");
      button.className = "copy-btn";
      button.textContent = "Copy";

      button.addEventListener("click", () => {
        const code = figure.querySelector("code");
        navigator.clipboard.writeText(code.innerText).then(() => {
          button.textContent = "Copied!";
          setTimeout(() => {
            button.textContent = "Copy";
          }, 2000);
        });
      });

      figure.appendChild(button);
    });
  }, []);

  return null;
}
