import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Fetches a public web page server-side and extracts readable text.
 * No external APIs — just a plain fetch plus HTML stripping.
 */
export const fetchUrlText = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ url: z.string().url() }).parse(data))
  .handler(async ({ data }) => {
    let parsed: URL;
    try {
      parsed = new URL(data.url);
    } catch {
      throw new Error("That doesn't look like a valid URL.");
    }
    if (!/^https?:$/.test(parsed.protocol)) {
      throw new Error("Only http and https links are supported.");
    }

    const res = await fetch(parsed.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; WorkplaceAssistant/1.0; +https://lovable.dev)",
        Accept: "text/html,application/xhtml+xml,text/plain",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      throw new Error(`The page responded with an error (status ${res.status}).`);
    }

    const contentType = res.headers.get("content-type") || "";
    const raw = await res.text();

    let text: string;
    if (contentType.includes("text/html") || raw.trimStart().startsWith("<")) {
      text = htmlToText(raw);
    } else {
      text = raw;
    }

    text = text.replace(/\s+/g, " ").trim();
    if (text.length < 40) {
      throw new Error("Couldn't find enough readable text on that page.");
    }

    // Keep the payload reasonable for analysis.
    return { text: text.slice(0, 20000), url: parsed.toString() };
  });

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|article|section|h[1-6]|li|br|tr)>/gi, ". ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}
