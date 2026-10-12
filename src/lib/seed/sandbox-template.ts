import type { Prisma } from "@prisma/client";

export async function seedSandboxTemplate(
  db: Prisma.TransactionClient,
  workspaceId: string,
) {
  const existing = await db.client.count({ where: { workspaceId } });
  if (existing > 0) {
    return;
  }

  await db.client.create({
    data: {
      workspaceId,
      name: "Northwind Studio",
      email: "northwind@example.com",
      projects: {
        create: [
          {
            workspaceId,
            name: "Brand refresh",
            milestones: {
              create: [
                {
                  workspaceId,
                  title: "Homepage concepts",
                  approval: "pending",
                  comments: {
                    create: {
                      workspaceId,
                      authorName: "Demo owner",
                      body: "Waiting on the first visual round.",
                    },
                  },
                },
                {
                  workspaceId,
                  title: "Logo lockup",
                  approval: "approved",
                },
              ],
            },
          },
          {
            workspaceId,
            name: "Website launch",
            milestones: {
              create: [
                {
                  workspaceId,
                  title: "Staging review",
                  approval: "changes_requested",
                  comments: {
                    create: {
                      workspaceId,
                      authorName: "Demo owner",
                      body: "Tighten the hero spacing before approval.",
                    },
                  },
                  attachments: {
                    create: {
                      workspaceId,
                      label: "Staging URL",
                      url: "https://example.com/staging",
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  await db.client.create({
    data: {
      workspaceId,
      name: "Harbor & Co",
      email: "harbor@example.com",
      projects: {
        create: [
          {
            workspaceId,
            name: "Q4 campaign",
            milestones: {
              create: [
                {
                  workspaceId,
                  title: "Media plan",
                  approval: "pending",
                },
                {
                  workspaceId,
                  title: "Creative cutdown",
                  approval: "approved",
                  comments: {
                    create: {
                      workspaceId,
                      authorName: "Demo owner",
                      body: "Approved for the demo cut.",
                    },
                  },
                },
              ],
            },
          },
          {
            workspaceId,
            name: "Monthly retainer",
            milestones: {
              create: [
                {
                  workspaceId,
                  title: "October status",
                  approval: "pending",
                },
              ],
            },
          },
        ],
      },
    },
  });
}
