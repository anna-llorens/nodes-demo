/**
 * Splits a translated string around its `{link}` placeholder so a component can render a real
 * link in the middle. A string without the placeholder comes back whole in `before`.
 */
export function withLink(text: string): { before: string; after: string; hasLink: boolean } {
  const index = text.indexOf("{link}");
  if (index === -1) return { before: text, after: "", hasLink: false };
  return { before: text.slice(0, index), after: text.slice(index + "{link}".length), hasLink: true };
}
