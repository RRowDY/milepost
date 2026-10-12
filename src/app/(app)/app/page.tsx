import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/workspace/context";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const approvalLabel = {
  pending: "Pending",
  approved: "Approved",
  changes_requested: "Changes requested",
} as const;

export default function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ workspaceId?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-sm text-muted-foreground">Loading dashboard…</p>
      }
    >
      <Dashboard searchParams={searchParams} />
    </Suspense>
  );
}

async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ workspaceId?: string }>;
}) {
  await connection();
  const workspace = await requireWorkspace();
  const { workspaceId } = await searchParams;
  if (workspaceId && workspaceId !== workspace.workspaceId) {
    notFound();
  }

  const clients = await prisma.client.findMany({
    where: { workspaceId: workspace.workspaceId },
    orderBy: { name: "asc" },
    include: {
      projects: {
        orderBy: { name: "asc" },
        include: {
          milestones: {
            orderBy: { title: "asc" },
            include: {
              comments: { orderBy: { createdAt: "asc" } },
              attachments: { orderBy: { createdAt: "asc" } },
            },
          },
        },
      },
    },
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {clients.length} clients in this sandbox. Data stays inside this workspace.
        </p>
      </div>
      {clients.map((client) => (
        <Card key={client.id}>
          <CardHeader>
            <CardTitle>{client.name}</CardTitle>
            <CardDescription>{client.email}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {client.projects.map((project) => (
              <section key={project.id} className="flex flex-col gap-2">
                <h2 className="text-sm font-medium">{project.name}</h2>
                <ul className="flex flex-col gap-2">
                  {project.milestones.map((milestone) => (
                    <li key={milestone.id} className="rounded-md border px-3 py-2">
                      <p className="text-sm">
                        {milestone.title}{" "}
                        <span className="text-muted-foreground">
                          {approvalLabel[milestone.approval]}
                        </span>
                      </p>
                      {milestone.comments.map((comment) => (
                        <p key={comment.id} className="mt-1 text-sm text-muted-foreground">
                          {comment.authorName}: {comment.body}
                        </p>
                      ))}
                      {milestone.attachments.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={attachment.url}
                          className="mt-1 block text-sm underline"
                        >
                          {attachment.label}
                        </a>
                      ))}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </CardContent>
        </Card>
      ))}
    </main>
  );
}
