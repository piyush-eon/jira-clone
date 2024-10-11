"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

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
    console.log(projects, orgId);

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

export async function getOrganizationUsers(orgId) {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const organizationMemberships =
      await clerkClient().organizations.getOrganizationMembershipList({
        organizationId: orgId,
      });

    // console.log(organizationMemberships.data);

    const userIds = organizationMemberships.data.map(
      (membership) => membership.publicUserData.userId
    );

    const users = await db.user.findMany({
      where: {
        clerkUserId: {
          in: userIds,
        },
      },
    });

    return users;
  } catch (error) {
    throw new Error("Error fetching organization users: " + error.message);
  }
}
