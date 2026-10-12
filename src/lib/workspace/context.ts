import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { assertWorkspaceAccess, type AccessSubject } from "./access";
import { readSandboxCookie, SANDBOX_COOKIE_NAME } from "./cookie";

const DAY_MS = 24 * 60 * 60 * 1000;

export type WorkspaceContext = {
  workspaceId: string;
  workspaceName: string;
  isSandbox: boolean;
  sandboxExpiresAt: Date | null;
  sandboxDaysLeft: number | null;
  plan: "FREE" | "PRO";
  subject: AccessSubject;
};

function sandboxDaysLeft(expiresAt: Date | null) {
  if (!expiresAt) {
    return null;
  }
  return Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / DAY_MS));
}

export async function getWorkspaceContext(): Promise<WorkspaceContext | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (userId) {
    const memberships = await prisma.membership.findMany({
      where: { userId },
      include: { workspace: true },
      orderBy: { workspace: { createdAt: "asc" } },
    });
    const membership = memberships[0];
    if (membership) {
      const subject: AccessSubject = {
        kind: "user",
        userId,
        membershipWorkspaceIds: memberships.map((row) => row.workspaceId),
      };
      assertWorkspaceAccess(subject, membership.workspaceId);
      return {
        workspaceId: membership.workspace.id,
        workspaceName: membership.workspace.name,
        isSandbox: membership.workspace.isSandbox,
        sandboxExpiresAt: membership.workspace.sandboxExpiresAt,
        sandboxDaysLeft: sandboxDaysLeft(membership.workspace.sandboxExpiresAt),
        plan: membership.workspace.plan,
        subject,
      };
    }
  }

  const jar = await cookies();
  const token = jar.get(SANDBOX_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const payload = await readSandboxCookie(token);
  if (!payload) {
    return null;
  }

  const sandbox = await prisma.sandboxSession.findUnique({
    where: { id: payload.sessionId },
    include: { workspace: true },
  });
  if (
    !sandbox ||
    sandbox.workspaceId !== payload.workspaceId ||
    sandbox.expiresAt.getTime() < Date.now() ||
    (sandbox.workspace.sandboxExpiresAt &&
      sandbox.workspace.sandboxExpiresAt.getTime() < Date.now())
  ) {
    return null;
  }

  const subject: AccessSubject = {
    kind: "sandbox",
    sessionId: sandbox.id,
    workspaceId: sandbox.workspaceId,
  };
  assertWorkspaceAccess(subject, sandbox.workspaceId);

  return {
    workspaceId: sandbox.workspace.id,
    workspaceName: sandbox.workspace.name,
    isSandbox: sandbox.workspace.isSandbox,
    sandboxExpiresAt: sandbox.workspace.sandboxExpiresAt,
    sandboxDaysLeft: sandboxDaysLeft(sandbox.workspace.sandboxExpiresAt),
    plan: sandbox.workspace.plan,
    subject,
  };
}

export async function requireWorkspace() {
  const context = await getWorkspaceContext();
  if (!context) {
    redirect("/");
  }
  return context;
}
