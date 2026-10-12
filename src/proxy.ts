import {
  readSandboxCookie,
  SANDBOX_COOKIE_NAME,
} from "@/lib/workspace/cookie";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function hasAuthSession(request: NextRequest) {
  return request.cookies.getAll().some((cookie) => {
    const name = cookie.name;
    return (
      name === "authjs.session-token" ||
      name.startsWith("authjs.session-token.") ||
      name === "__Secure-authjs.session-token" ||
      name.startsWith("__Secure-authjs.session-token.")
    );
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/app")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SANDBOX_COOKIE_NAME)?.value;
  if (token) {
    try {
      const payload = await readSandboxCookie(token);
      if (payload) {
        return NextResponse.next();
      }
    } catch {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (hasAuthSession(request)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/app/:path*"],
};
