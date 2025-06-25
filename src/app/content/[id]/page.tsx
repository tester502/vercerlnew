
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ContentReviewForm } from "@/components/content-review/ContentReviewForm";
import { useVideoProjects } from "@/hooks/useVideoProjects";
import type { VideoProject } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContentReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { getProject, updateProject } = useVideoProjects();
  const [project, setProject] = useState<VideoProject | null | undefined>(undefined); // undefined for loading, null for not found

  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (projectId) {
      const foundProject = getProject(projectId);
      setProject(foundProject || null); 
    }
  }, [projectId, getProject]);

  const handleUpdateProject = (updatedData: Partial<VideoProject> & { id: string }) => {
    updateProject(updatedData);
    const refreshedProject = getProject(projectId); // Fetch the latest version after update
    setProject(refreshedProject || null);
  };

  if (project === undefined) { // Loading state
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-12 w-1/2 rounded-md" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-72 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <Card className="w-full max-w-lg mx-auto mt-10 text-center shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-destructive flex items-center justify-center gap-2">
            <AlertTriangle className="h-8 w-8" /> Project Not Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            The video project you're looking for doesn't exist or couldn't be loaded.
          </p>
          <Button
            onClick={() => router.push('/')}
          >
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <ContentReviewForm project={project} onUpdateProject={handleUpdateProject} />
  );
}
