
"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { VideoProject } from "@/types";
import { Eye, CalendarClock, CheckCircle, AlertTriangle, Loader2, Edit3, Trash2, Sparkles } from "lucide-react";
import { format, parseISO } from 'date-fns';

interface VideoProjectListItemProps {
  project: VideoProject;
  onDelete: (projectId: string) => void;
}

const statusConfig = {
  idle: { label: "Idle", badgeVariant: "outline", icon: <AlertTriangle className="h-4 w-4" /> },
  generating: { label: "Generating...", badgeVariant: "secondary", icon: <Loader2 className="h-4 w-4 animate-spin" /> },
  review: { label: "Needs Review", badgeVariant: "default", className:"bg-yellow-500 hover:bg-yellow-600 text-white", icon: <Edit3 className="h-4 w-4" /> },
  scheduled: { label: "Scheduled", badgeVariant: "default", className:"bg-purple-500 hover:bg-purple-600 text-white", icon: <CalendarClock className="h-4 w-4" /> },
  published: { label: "Published", badgeVariant: "default", className:"bg-green-500 hover:bg-green-600 text-white", icon: <CheckCircle className="h-4 w-4" /> },
  failed: { label: "Failed", badgeVariant: "destructive", icon: <AlertTriangle className="h-4 w-4" /> },
};

export function VideoProjectListItem({ project, onDelete }: VideoProjectListItemProps) {
  const currentStatusInfo = statusConfig[project.status] || statusConfig.idle;

  return (
    <Card className="flex flex-col overflow-hidden shadow-md transition-shadow hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="relative aspect-video w-full mb-2 overflow-hidden rounded-md bg-muted/50">
          {project.thumbnailDataUri ? (
            <Image
              src={project.thumbnailDataUri}
              alt={project.title || "Video thumbnail"}
              layout="fill"
              objectFit="cover"
              data-ai-hint="video thumbnail"
            />
          ) : project.status === 'generating' ? (
             <div className="flex h-full w-full items-center justify-center bg-secondary">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
             </div>
          ) : (
            <Image
              src={`https://placehold.co/600x338.png?text=${project.status === 'failed' ? 'Failed' : 'No+Thumbnail'}`}
              alt="Placeholder thumbnail"
              layout="fill"
              objectFit="cover"
              data-ai-hint="placeholder video"
            />
          )}
        </div>
        <CardTitle className="text-lg truncate" title={project.title || "Untitled Video Project"}>
          {project.title || "Untitled Video Project"}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Created: {format(parseISO(project.createdAt), "MMM d, yyyy HH:mm")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2" title={project.prompt}>
          <strong>Prompt:</strong> {project.prompt}
        </p>
        <Badge variant={currentStatusInfo.badgeVariant as any} className={currentStatusInfo.className || ''}>
          {currentStatusInfo.icon}
          <span className="ml-1">{currentStatusInfo.label}</span>
        </Badge>
        {project.status === 'failed' && project.error && (
           <p className="text-xs text-destructive mt-1 line-clamp-2" title={project.error}>Error: {project.error}</p>
        )}
         {project.status === 'scheduled' && project.scheduledAt && (
          <p className="text-xs text-muted-foreground mt-1">
            Scheduled for: {format(parseISO(project.scheduledAt), "MMM d, yyyy HH:mm")}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center gap-2 pt-2">
        <Button asChild variant="default" size="sm" disabled={project.status === 'generating'}>
          <Link href={`/content/${project.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            {project.status === 'review' || project.status === 'failed' ? 'Review & Edit' : 'View'}
          </Link>
        </Button>
         <Button variant="ghost" size="icon" onClick={() => onDelete(project.id)} aria-label="Delete project">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </CardFooter>
    </Card>
  );
}
