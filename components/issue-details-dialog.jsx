"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MDEditor from "@uiw/react-md-editor";
import UserAvatar from "./user-avatar";
import useFetch from "@/hooks/use-fetch";
import { deleteIssue } from "@/actions/issues";
import { useRouter } from "next/navigation";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function IssueDetailsDialog({
  isOpen,
  onClose,
  issue,
  onDelete = () => window.location.reload(),
}) {
  const {
    user: { id: userId },
  } = useUser();
  const { membership } = useOrganization();

  const {
    loading: deleteLoading,
    error: deleteError,
    fn: deleteIssueFn,
    data: deleted,
  } = useFetch(deleteIssue);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this issue?")) {
      deleteIssueFn(issue.id);
    }
  };

  useEffect(() => {
    if (deleted) {
      onClose();
      onDelete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleted, deleteLoading]);

  const canDelete =
    userId === issue.reporter.clerkUserId || membership.role === "org:admin";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{issue.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge>{issue.status}</Badge>
            <Badge variant="outline">{issue.priority}</Badge>
          </div>
          <div>
            <h4 className="font-semibold">Description</h4>
            <MDEditor.Markdown
              className="rounded px-2 py-1"
              source={issue.description}
            />
          </div>
          <div className="flex justify-between">
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold">Assignee</h4>
              <UserAvatar user={issue.assignee} />
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold">Reporter</h4>
              <UserAvatar user={issue.reporter} />
            </div>
          </div>
          {canDelete && (
            <Button
              onClick={handleDelete}
              disabled={deleteLoading}
              variant="destructive"
            >
              {deleteLoading ? "Deleting..." : "Delete Issue"}
            </Button>
          )}
          {deleteError && <p className="text-red-500">{deleteError.message}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
