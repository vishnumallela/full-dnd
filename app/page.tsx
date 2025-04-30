"use client";
import React from 'react';
import { DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { 
  arrayMove,
} from '@dnd-kit/sortable';
import Draggable from '../components/dnd-draggable';
import Droppable from '../components/dnd-droppable';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DndProvider from '@/components/dnd-provider';

// Sample chart component
const Chart = ({ title, data }: { title: string; data: number }) => {
  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        Sample Chart Value: {data}
      </CardContent>
    </Card>
  );
};

// Sample data
const initialSections = [
  {
    id: 'section1',
    title: 'Analytics',
    charts: [
      { id: 'chart1', title: 'Revenue', data: 5000 },
      { id: 'chart2', title: 'Users', data: 1200 },
    ]
  },
  {
    id: 'section2',
    title: 'Performance',
    charts: [
      { id: 'chart3', title: 'Load Time', data: 1.5 },
      { id: 'chart4', title: 'Error Rate', data: 0.02 },
    ]
  },
  {
    id: 'section3',
    title: 'Marketing',
    charts: [
      { id: 'chart5', title: 'Conversion', data: 15 },
      { id: 'chart6', title: 'Engagement', data: 75 },
    ]
  }
];

export default function DashboardPage() {
  const [sections, setSections] = useState(initialSections);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeChart, setActiveChart] = useState<{title: string; data: number} | null>(null);

  // Handle drag start for showing overlay
  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveId(id);
    
    // Find the chart being dragged to show in overlay
    for (const section of sections) {
      const chart = section.charts.find(chart => chart.id === id);
      if (chart) {
        setActiveChart({title: chart.title, data: chart.data});
        break;
      }
    }
  };

  // Handle sorting within the same section
  const handleSortWithinContainer = (
    activeId: string, 
    overId: string, 
    containerId: string
  ) => {
    // Find the section by containerId
    const sectionIndex = sections.findIndex(section => section.id === containerId);
    if (sectionIndex === -1) return;
    
    const activeSection = sections[sectionIndex];
    const activeChartIndex = activeSection.charts.findIndex(chart => chart.id === activeId);
    const overChartIndex = activeSection.charts.findIndex(chart => chart.id === overId);
    
    // Only reorder if dropping on a different item
    if (activeChartIndex !== overChartIndex && activeChartIndex !== -1 && overChartIndex !== -1) {
      const newCharts = arrayMove(
        activeSection.charts,
        activeChartIndex,
        overChartIndex
      );
      
      const newSections = [...sections];
      newSections[sectionIndex] = {
        ...activeSection,
        charts: newCharts
      };
      
      setSections(newSections);
      console.log("Sorted within container:", activeSection.title);
    }
  };

  // Handle moving between different sections
  const handleMoveBetweenContainers = (
    activeId: string, 
    overId: string, 
    fromContainerId: string, 
    toContainerId: string
  ) => {
    // Find the section indexes
    const fromSectionIndex = sections.findIndex(section => section.id === fromContainerId);
    const toSectionIndex = sections.findIndex(section => section.id === toContainerId);
    
    if (fromSectionIndex === -1 || toSectionIndex === -1) return;
    
    // Get the active section and chart
    const activeSection = sections[fromSectionIndex];
    const activeChart = activeSection.charts.find(chart => chart.id === activeId);
    
    if (!activeChart) return;
    
    const newSections = [...sections];
    
    // Remove from old section
    newSections[fromSectionIndex] = {
      ...activeSection,
      charts: activeSection.charts.filter(chart => chart.id !== activeId)
    };
    
    // Add to new section
    const overSection = newSections[toSectionIndex];
    
    // If dropping on a chart in the target section, find its position
    const overChartIndex = overSection.charts.findIndex(chart => chart.id === overId);
    
    if (overChartIndex !== -1) {
      // Insert after the target chart
      const newOverCharts = [...overSection.charts];
      newOverCharts.splice(overChartIndex + 1, 0, activeChart);
      
      newSections[toSectionIndex] = {
        ...overSection,
        charts: newOverCharts
      };
      
      console.log(`Moved from ${activeSection.title} to ${overSection.title} after item`);
    } else {
      // Add to the end of the target section
      newSections[toSectionIndex] = {
        ...overSection,
        charts: [...overSection.charts, activeChart]
      };
      
      console.log(`Moved from ${activeSection.title} to ${overSection.title}`);
    }
    
    setSections(newSections);
  };

  // Main drag end handler (used for cleanup)
  const handleDragEnd = () => {
    // Just reset the active item state
    setActiveId(null);
    setActiveChart(null);
  };

  return (
    <DndProvider 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onSortWithinContainer={handleSortWithinContainer}
      onMoveBetweenContainers={handleMoveBetweenContainers}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="flex flex-col gap-4">
          {sections.map((section) => (
            <Droppable 
              key={section.id} 
              id={section.id}
              items={section.charts.map(chart => chart.id)}
            >
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.charts.map((chart) => (
                    <Draggable key={chart.id} id={chart.id} containerId={section.id}>
                      <Chart title={chart.title} data={chart.data} />
                    </Draggable>
                  ))}
                </CardContent>
              </Card>
            </Droppable>
          ))}
        </div>
        
        <DragOverlay>
          {activeId && activeChart ? (
            <div style={{ opacity: 0.8, width: "100%" }}>
              <Chart title={activeChart.title} data={activeChart.data} />
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndProvider>
  );
}