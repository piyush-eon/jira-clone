"use client";

import { useState, useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import { getIssuesForSprint, updateIssueOrder } from "@/actions/issues";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarLoader } from "react-spinners";
import IssueCreationDrawer from "./create-issue";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

const columns = [
  {
    name: "Todo",
    key: "TODO",
  },
  {
    name: "In Progress",
    key: "IN_PROGRESS",
  },
  {
    name: "In Review",
    key: "IN_REVIEW",
  },
  {
    name: "Done",
    key: "DONE",
  },
];

function reorder(list, startIndex, endIndex) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

export default function SprintBoard({ sprints, projectId, orgId }) {
  const [currentSprintId, setCurrentSprintId] = useState(sprints[0].id);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const {
    loading: issuesLoading,
    error: issuesError,
    fn: fetchIssues,
    data: issues,
    setData: setIssues,
  } = useFetch(getIssuesForSprint);

  useEffect(() => {
    if (currentSprintId) {
      fetchIssues(currentSprintId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSprintId]);

  const handleAddIssue = (status) => {
    setSelectedStatus(status);
    setIsDrawerOpen(true);
  };

  const handleIssueCreated = () => {
    fetchIssues(currentSprintId);
  };

  const {
    fn: updateIssueOrderFn,
    loading: updateIssuesLoading,
    error: updateIssuesError,
  } = useFetch(updateIssueOrder);

  const onDragEnd = async (result) => {
    const { destination, source } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newOrderedData = [...issues];

    // source and destination list
    const sourceList = newOrderedData.filter(
      (list) => list.status === source.droppableId
    );

    const destinationList = newOrderedData.filter(
      (list) => list.status === destination.droppableId
    );

    if (source.droppableId === destination.droppableId) {
      const reorderedCards = reorder(
        sourceList,
        source.index,
        destination.index
      );

      reorderedCards.forEach((card, i) => {
        card.order = i;
      });

      // API Call
    } else {
      // remove card from the source list
      const [movedCard] = sourceList.splice(source.index, 1);

      // assign the new list id to the moved card
      movedCard.status = destination.droppableId;

      // add new card to the destination list
      destinationList.splice(destination.index, 0, movedCard);

      sourceList.forEach((card, i) => {
        card.order = i;
      });

      // update the order for each card in destination list
      destinationList.forEach((card, i) => {
        card.order = i;
      });

      // API Call
    }

    const sortedIssues = newOrderedData.sort((a, b) => a.order - b.order);
    console.log(sortedIssues, newOrderedData);

    setIssues(newOrderedData, sortedIssues);

    updateIssueOrderFn(projectId, sortedIssues);
  };

  if (issuesLoading)
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  if (issuesError) return <div>Error loading issues</div>;

  return (
    <div className="flex flex-col">
      <Select
        value={currentSprintId}
        onValueChange={(value) => setCurrentSprintId(value)}
      >
        <SelectTrigger className="bg-slate-950 w-72">
          <SelectValue placeholder="Select Sprint" />
        </SelectTrigger>
        <SelectContent>
          {sprints.map((sprint) => (
            <SelectItem key={sprint.id} value={sprint.id}>
              {sprint.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {updateIssuesError && (
        <p className="text-red-500 mt-2">{updateIssuesError.message}</p>
      )}
      {updateIssuesLoading && (
        <BarLoader className="mt-4" width={"100%"} color="#36d7b7" />
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-4 gap-4 mt-4 bg-slate-900 p-4 rounded-lg">
          {columns.map((column) => (
            <Droppable key={column.key} droppableId={column.key}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  <h3 className="font-semibold mb-2 text-center">
                    {column.name}
                  </h3>
                  {issues
                    ?.filter((issue) => issue.status === column.key)
                    .map((issue, index) => (
                      <Draggable
                        key={issue.id}
                        draggableId={issue.id}
                        index={index}
                      >
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <CardContent className="p-2">
                              <h4 className="font-medium">{issue.title}</h4>
                              <p className="text-sm text-gray-500">
                                {issue.assignee?.name || "Unassigned"}
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                  {column.key === "TODO" && (
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => handleAddIssue(column.key)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Issue
                    </Button>
                  )}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
      <IssueCreationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sprintId={currentSprintId}
        status={selectedStatus}
        projectId={projectId}
        onIssueCreated={handleIssueCreated}
        orgId={orgId}
      />
    </div>
  );
}
