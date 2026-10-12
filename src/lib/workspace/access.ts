export class WorkspaceAccessError extends Error {
  constructor(message = "Workspace access denied") {
    super(message);
    this.name = "WorkspaceAccessError";
  }
}

export type AccessSubject =
  | { kind: "user"; userId: string; membershipWorkspaceIds: string[] }
  | { kind: "sandbox"; sessionId: string; workspaceId: string };

export function assertWorkspaceAccess(
  subject: AccessSubject,
  workspaceId: string,
): void {
  if (!workspaceId) {
    throw new WorkspaceAccessError();
  }

  if (subject.kind === "sandbox") {
    if (!subject.sessionId || subject.workspaceId !== workspaceId) {
      throw new WorkspaceAccessError();
    }
    return;
  }

  if (!subject.userId || !subject.membershipWorkspaceIds.includes(workspaceId)) {
    throw new WorkspaceAccessError();
  }
}
