// Escapes text for use inside HTML, e.g. a user's name in an email body, so
// characters such as < and & show as text instead of changing the markup.
export function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
