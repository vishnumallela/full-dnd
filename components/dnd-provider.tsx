"use client";
import React, { createContext } from "react";
import { closestCorners, DndContext, DragEndEvent, DragStartEvent } from "@dnd-kit/core";

interface DndProviderProps {
  children: React.ReactNode;
  onDragEnd?: (event: DragEndEvent) => void;
  onDragStart?: (event: DragStartEvent) => void;
  onSortWithinContainer?: (
    activeId: string, 
    overId: string, 
    containerId: string
  ) => void;
  onMoveBetweenContainers?: (
    activeId: string, 
    overId: string, 
    fromContainerId: string, 
    toContainerId: string
  ) => void;
}

// Create a context to share drag and drop state
export const DndProviderContext = createContext({});

export default function DndProvider({ 
  children, 
  onDragEnd,
  onDragStart,
  onSortWithinContainer,
  onMoveBetweenContainers 
}: DndProviderProps) {
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Call the main onDragEnd if provided
    if (onDragEnd) {
      onDragEnd(event);
    }
    
    // If no specialized handlers or no over target, we're done
    if ((!onSortWithinContainer && !onMoveBetweenContainers) || !over) {
      return;
    }
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Get container information from data attributes
    // This assumes you've set data-container-id on your droppable elements
    const activeContainer = active.data.current?.containerID;
    const overContainer = over.data.current?.containerID;
    
    if (activeContainer === overContainer) {
      // Handle sorting within the same container
      if (onSortWithinContainer) {
        onSortWithinContainer(activeId, overId, activeContainer);
      }
    } else if (activeContainer !== overContainer) {
      // Handle moving between different containers
      if (onMoveBetweenContainers) {
        onMoveBetweenContainers(activeId, overId, activeContainer, overContainer);
      }
    }
  };

  return (
    <DndContext 
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      onDragStart={onDragStart}
    >
      {children}
    </DndContext>
  );
}
