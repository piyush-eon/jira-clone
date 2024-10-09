import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getUserIssues } from "@/actions/organizations";

export default async function UserIssues({ userId }) {
  const issues = await getUserIssues(userId);

  if (issues.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {issues.map((issue) => (
        <div key={issue.id} className="border p-4 rounded-lg">
          <h3 className="font-semibold mb-2">
            <Link
              href={`/projects/${issue.projectId}/issues/${issue.id}`}
              className="text-blue-500 hover:underline"
            >
              {issue.title}
            </Link>
          </h3>
          <p className="text-sm text-gray-500 mb-2">{issue.description}</p>
          <div className="flex items-center space-x-2">
            <Badge>{issue.status}</Badge>
            <Badge variant="outline">{issue.priority}</Badge>
            <span className="text-sm text-gray-500">
              {issue.assigneeId === userId
                ? "Assigned to you"
                : "Reported by you"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
