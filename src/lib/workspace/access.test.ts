import { describe, expect, it } from "vitest";
import { assertWorkspaceAccess, WorkspaceAccessError } from "./access";

const workspaceA = "ws_a";
const workspaceB = "ws_b";

describe("assertWorkspaceAccess", () => {
  it("allows a member of the requested workspace", () => {
    expect(() =>
      assertWorkspaceAccess(
        { kind: "user", userId: "user_1", membershipWorkspaceIds: [workspaceA] },
        workspaceA,
      ),
    ).not.toThrow();
  });

  it("rejects a member of a different workspace", () => {
    expect(() =>
      assertWorkspaceAccess(
        { kind: "user", userId: "user_1", membershipWorkspaceIds: [workspaceA] },
        workspaceB,
      ),
    ).toThrow(WorkspaceAccessError);
  });

  it("rejects a signed-in user with no memberships", () => {
    expect(() =>
      assertWorkspaceAccess(
        { kind: "user", userId: "user_1", membershipWorkspaceIds: [] },
        workspaceA,
      ),
    ).toThrow(WorkspaceAccessError);
  });

  it("allows a sandbox session for its own workspace", () => {
    expect(() =>
      assertWorkspaceAccess(
        { kind: "sandbox", sessionId: "ses_1", workspaceId: workspaceA },
        workspaceA,
      ),
    ).not.toThrow();
  });

  it("rejects a sandbox session for another workspace", () => {
    expect(() =>
      assertWorkspaceAccess(
        { kind: "sandbox", sessionId: "ses_1", workspaceId: workspaceA },
        workspaceB,
      ),
    ).toThrow(WorkspaceAccessError);
  });
});
