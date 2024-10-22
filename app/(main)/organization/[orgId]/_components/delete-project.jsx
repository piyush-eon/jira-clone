"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useOrganization } from "@clerk/nextjs";
import { deleteProject } from "@/actions/projects";
import { useRouter } from "next/navigation";

export default function DeleteProject({ projectId }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { membership } = useOrganization();
  const router = useRouter();

  const isAdmin = membership?.role === "org:admin";

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      setIsDeleting(true);
      try {
        await deleteProject(projectId);
        router.refresh(); // This will trigger a re-render of the server component
      } catch (error) {
        console.error("Failed to delete project:", error);
        alert("Failed to delete project. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (!isAdmin) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`${isDeleting ? "animate-pulse" : ""}`}
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
