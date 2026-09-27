/**
 * Safe HTML Sanitizer
 * Strips executable tags (<script>, <iframe>, <object>, etc.) and inline event handlers
 * without adding heavy external dependencies.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";

  if (typeof window === "undefined") {
    // Fallback for SSR
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+\s*=\s*(?:["'][^"']*["']|[^\s>]+)/gi, "")
      .replace(/javascript\s*:/gi, "");
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Remove forbidden executable elements
    const forbiddenTags = [
      "script",
      "iframe",
      "object",
      "embed",
      "link",
      "style",
      "meta",
      "form",
      "input",
      "button",
      "base",
      "frame",
    ];

    forbiddenTags.forEach((tag) => {
      const elements = doc.querySelectorAll(tag);
      elements.forEach((el) => el.remove());
    });

    // Remove all event handlers and pseudo-protocols
    const allElements = doc.querySelectorAll("*");
    allElements.forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        const val = attr.value.toLowerCase().replace(/[\s\x00-\x1f]+/g, "");
        if (
          name.startsWith("on") ||
          val.startsWith("javascript:") ||
          val.startsWith("data:text/html") ||
          val.startsWith("vbscript:")
        ) {
          el.removeAttribute(attr.name);
        }
      });
    });

    return doc.body.innerHTML;
  } catch {
    // If parsing fails, return plain text
    return html.replace(/<[^>]*>?/gm, "");
  }
}
