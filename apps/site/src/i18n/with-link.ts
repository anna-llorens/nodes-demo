/**
 * Splits a translated string around one placeholder (default `{link}`) so a component can render
 * a real link in the middle. A string without the placeholder comes back whole in `before`.
 */
export function withLink(text: string, placeholder = "link"): { before: string; after: string; hasLink: boolean } {
  const token = `{${placeholder}}`;
  const index = text.indexOf(token);
  if (index === -1) return { before: text, after: "", hasLink: false };
  return { before: text.slice(0, index), after: text.slice(index + token.length), hasLink: true };
}
