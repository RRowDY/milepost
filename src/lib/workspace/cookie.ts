export const SANDBOX_COOKIE_NAME = "sandbox_session";
export const SANDBOX_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const SANDBOX_TTL_SECONDS = SANDBOX_TTL_MS / 1000;

export type SandboxCookiePayload = {
  sessionId: string;
  workspaceId: string;
  exp: number;
};

function cookieSecret() {
  const secret = process.env.SANDBOX_COOKIE_SECRET;
  if (!secret) {
    throw new Error("SANDBOX_COOKIE_SECRET is not set");
  }
  return secret;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlToBytes(value: string) {
  const pad = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/") + pad;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function signBody(body: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return bytesToBase64Url(new Uint8Array(signature));
}

function signaturesMatch(left: string, right: string) {
  const encoder = new TextEncoder();
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a[index]! ^ b[index]!;
  }
  return diff === 0;
}

export async function signSandboxCookie(payload: SandboxCookiePayload) {
  const body = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await signBody(body, cookieSecret());
  return `${body}.${signature}`;
}

export async function readSandboxCookie(
  token: string,
): Promise<SandboxCookiePayload | null> {
  const separator = token.indexOf(".");
  if (separator <= 0) {
    return null;
  }
  const body = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  if (!body || !signature) {
    return null;
  }

  const expected = await signBody(body, cookieSecret());
  if (!signaturesMatch(signature, expected)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(body)),
    ) as Partial<SandboxCookiePayload>;
    if (
      typeof parsed.sessionId !== "string" ||
      typeof parsed.workspaceId !== "string" ||
      typeof parsed.exp !== "number" ||
      !parsed.sessionId ||
      !parsed.workspaceId ||
      parsed.exp < Date.now()
    ) {
      return null;
    }
    return {
      sessionId: parsed.sessionId,
      workspaceId: parsed.workspaceId,
      exp: parsed.exp,
    };
  } catch {
    return null;
  }
}
