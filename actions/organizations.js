"use server";

import { clerkClient } from "@clerk/nextjs/server";

export async function getOrganization(slug) {
  try {
    const organization = await clerkClient().organizations.getOrganization({
      slug,
    });
    return organization;
  } catch (error) {
    console.error("Error fetching organization:", error);
    return null;
  }
}

export async function getProjects(orgId) {
  try {
    const projects = await db.project.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    });
    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export async function getUserIssues(userId) {
  try {
    const issues = await db.issue.findMany({
      where: {
        OR: [{ assigneeId: userId }, { reporterId: userId }],
      },
      include: {
        project: true,
        assignee: true,
        reporter: true,
      },
      orderBy: { updatedAt: "desc" },
    });
    return issues;
  } catch (error) {
    console.error("Error fetching user issues:", error);
    return [];
  }
}
