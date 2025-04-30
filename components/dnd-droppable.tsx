"use client";
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";

interface DroppableProps {
  id: string;
  children: React.ReactNode;
  items: string[];
}

export default function Droppable({ id, children, items }: DroppableProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      containerID: id // Store container ID in the droppable element's data
    }
  });
  
  const style = {
    backgroundColor: isOver ? "lightgreen" : "lightgray",
    padding: "16px",
    minHeight: "100px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px"
  };

  return (
    <div ref={setNodeRef} style={style} data-container-id={id}>
      <SortableContext items={items} strategy={horizontalListSortingStrategy}>
        {children}
      </SortableContext>
    </div>
  );
}
