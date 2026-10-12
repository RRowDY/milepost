import { SandboxBanner } from "@/components/sandbox-banner";
import { requireWorkspace } from "@/lib/workspace/context";
import { connection } from "next/server";
import { Suspense } from "react";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-sm text-muted-foreground">Loading sandbox…</p>
      }
    >
      <PortalFrame>{children}</PortalFrame>
    </Suspense>
  );
}

async function PortalFrame({ children }: { children: React.ReactNode }) {
  await connection();
  const workspace = await requireWorkspace();

  return (
    <div className="min-h-screen">
      <SandboxBanner daysLeft={workspace.sandboxDaysLeft} />
      <header className="flex items-center justify-between gap-4 border-b px-6 py-4">
        <p className="text-sm font-medium">{workspace.workspaceName}</p>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Workspace
          <select
            aria-label="Workspace"
            disabled
            defaultValue={workspace.workspaceId}
            className="rounded-md border bg-muted px-2 py-1 text-foreground disabled:cursor-not-allowed disabled:opacity-70"
          >
            <option value={workspace.workspaceId}>{workspace.workspaceName}</option>
          </select>
        </label>
      </header>
      {children}
    </div>
  );
}
