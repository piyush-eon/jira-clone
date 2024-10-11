"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getIssuesForSprint(sprintId) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    const issues = await db.issue.findMany({
      where: { sprintId: sprintId },
      orderBy: [{ status: "asc" }, { order: "asc" }],
      include: {
        assignee: true,
        reporter: true,
      },
    });

    return issues;
  } catch (error) {
    console.error("Error fetching issues:", error);
    throw new Error("Failed to fetch issues");
  }
}

export async function createIssue(projectId, data) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    let user = await db.user.findUnique({ where: { clerkUserId: userId } });

    const lastIssue = await db.issue.findFirst({
      where: { projectId, status: data.status },
      orderBy: { order: "desc" },
    });

    const newOrder = lastIssue ? lastIssue.order + 1 : 0;

    const issue = await db.issue.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        projectId: projectId,
        sprintId: data.sprintId,
        reporterId: user.id,
        assigneeId: data.assigneeId || null, // Add this line
        order: newOrder,
      },
      include: {
        assignee: true,
        reporter: true,
      },
    });

    return issue;
  } catch (error) {
    throw new Error("Error creating issue: " + error.message);
  }
}

export async function updateIssueOrder(projectId, updatedIssues) {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  try {
    // Start a transaction
    await db.$transaction(async (prisma) => {
      // Update each issue
      for (const issue of updatedIssues) {
        await prisma.issue.update({
          where: { id: issue.id },
          data: {
            status: issue.status,
            order: issue.order,
          },
        });
      }
    });

    // Fetch and return the updated issues
    // const updatedIssuesList = await db.issue.findMany({
    //   where: { projectId: projectId },
    //   orderBy: [{ status: "asc" }, { order: "asc" }],
    //   include: {
    //     assignee: true,
    //     reporter: true,
    //   },
    // });

    // return updatedIssuesList;
  } catch (error) {
    console.error("Failed to update issue order:", error);
    throw new Error("Failed to update issue order: " + error.message);
  }
}
