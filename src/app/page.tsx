
"use client";

import { CreateContentForm } from "@/components/dashboard/CreateContentForm";
import { VideoProjectList } from "@/components/dashboard/VideoProjectList";
import { useVideoProjects } from "@/hooks/useVideoProjects";
import type { VideoProject } from "@/types";
import { useCallback, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ProjectStatusFilter = VideoProject['status'] | 'all';

const statusFilters: { label: string; value: ProjectStatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Generating", value: "generating" },
  { label: "Review", value: "review" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Published", value: "published" },
  { label: "Failed", value: "failed" },
];

export default function DashboardPage() {
  const { projects, addOrUpdateProject, removeProject, clearProjects } = useVideoProjects();
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<ProjectStatusFilter>("all");

  const handleContentGenerated = useCallback((project: VideoProject) => {
    addOrUpdateProject(project);
  }, [addOrUpdateProject]);

  const handleDeleteProject = useCallback((projectId: string) => {
    removeProject(projectId);
    toast({
        title: "Project Deleted",
        description: "The video project has been removed.",
      });
  }, [removeProject, toast]);
  
  const handleClearAllProjects = () => {
    clearProjects();
    toast({
        title: "All Projects Cleared",
        description: "All video projects have been removed from local storage.",
      });
  }

  const filteredProjects = useMemo(() => {
    if (activeFilter === "all") {
      return projects;
    }
    return projects.filter(project => project.status === activeFilter);
  }, [projects, activeFilter]);


  return (
    <div className="container mx-auto py-2 space-y-8">
      <CreateContentForm onContentGenerated={handleContentGenerated} />
      
      {projects.length > 0 && (
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as ProjectStatusFilter)} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-none sm:inline-flex">
              {statusFilters.map(filter => (
                <TabsTrigger key={filter.value} value={filter.value}>
                  {filter.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                <Trash2 className="mr-2 h-4 w-4" /> Clear All Projects
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all
                  your video projects from local storage.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAllProjects}>
                  Yes, delete all
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      <VideoProjectList projects={filteredProjects} onDeleteProject={handleDeleteProject} />
    </div>
  );
}
