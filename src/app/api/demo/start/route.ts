import { prisma } from "@/lib/prisma";
import { seedSandboxTemplate } from "@/lib/seed/sandbox-template";
import {
  SANDBOX_COOKIE_NAME,
  SANDBOX_TTL_MS,
  SANDBOX_TTL_SECONDS,
  signSandboxCookie,
} from "@/lib/workspace/cookie";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const expiresAt = new Date(Date.now() + SANDBOX_TTL_MS);
  const created = await prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        name: "Sandbox demo",
        slug: `sandbox-${crypto.randomUUID()}`,
        isSandbox: true,
        sandboxExpiresAt: expiresAt,
        plan: "FREE",
      },
    });
    const session = await tx.sandboxSession.create({
      data: {
        workspaceId: workspace.id,
        expiresAt,
      },
    });
    await seedSandboxTemplate(tx, workspace.id);
    return { workspace, session };
  });

  const token = await signSandboxCookie({
    sessionId: created.session.id,
    workspaceId: created.workspace.id,
    exp: expiresAt.getTime(),
  });

  const response = NextResponse.redirect(new URL("/app", request.url), 303);
  response.cookies.set(SANDBOX_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SANDBOX_TTL_SECONDS,
  });
  return response;
}
