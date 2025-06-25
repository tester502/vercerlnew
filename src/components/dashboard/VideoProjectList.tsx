
"use client";

import type { VideoProject } from "@/types";
import { VideoProjectListItem } from "./VideoProjectListItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Film } from "lucide-react";

interface VideoProjectListProps {
  projects: VideoProject[];
  onDeleteProject: (projectId: string) => void;
}

export function VideoProjectList({ projects, onDeleteProject }: VideoProjectListProps) {
  if (projects.length === 0) {
    return (
      <Card className="mt-8 text-center shadow-sm border-dashed border-2">
        <CardHeader>
            <CardTitle className="text-xl font-medium text-muted-foreground">No Video Projects Yet</CardTitle>
        </CardHeader>
        <CardContent className="py-10">
          <Film className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            Start by generating your first video content using the form above.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">Your Video Projects</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {projects.map((project) => (
          <VideoProjectListItem key={project.id} project={project} onDelete={onDeleteProject} />
        ))}
      </div>
    </div>
  );
}
