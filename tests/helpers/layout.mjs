import { createHash } from "node:crypto";
const plain = (html) =>
  html
    .replace(/<br\s*\/?\s*>/g, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
export function layoutSignature(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] || "";
  return {
    sections: [...main.matchAll(/<(section|nav)\b([^>]*)>/g)].map(
      ([, tag, attrs]) =>
        tag + ":" + (attrs.match(/class="([^"]*)"/)?.[1] || ""),
    ),
    headings: [...main.matchAll(/<(h[123])\b[^>]*>([\s\S]*?)<\/\1>/g)].map(
      ([, tag, text]) => tag + ":" + plain(text),
    ),
    textHash: createHash("sha256").update(plain(main)).digest("hex"),
  };
}
