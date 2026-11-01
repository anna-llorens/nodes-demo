/** Response and email helpers shared by the Worker endpoints. */

/** Strips line breaks so user input cannot add headers. */
export function headerValue(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

/** RFC 2047 encoded word, so accents and "·" survive in the subject. */
export function encodeHeader(value: string): string {
  return `=?UTF-8?B?${base64Utf8(headerValue(value))}?=`;
}

export function base64Utf8(value: string): string {
  let binary = "";
  for (const byte of new TextEncoder().encode(value)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });
}
