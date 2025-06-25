
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { VideoProject } from '@/types';

const LOCAL_STORAGE_KEY = 'autoTubeAI_videoProjects';

export function useVideoProjects(): {
  projects: VideoProject[];
  addProject: (project: VideoProject) => void;
  updateProject: (updatedProject: Partial<VideoProject> & { id: string }) => void;
  getProject: (projectId: string) => VideoProject | undefined;
  clearProjects: () => void;
  addOrUpdateProject: (project: VideoProject) => void;
} {
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedProjects = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedProjects) {
          setProjects(JSON.parse(storedProjects));
        }
      } catch (error) {
        console.error("Error reading video projects from localStorage:", error);
      }
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
      } catch (error) {
        console.error("Error writing video projects to localStorage:", error);
      }
    }
  }, [projects, isInitialized]);

  const addProject = useCallback((project: VideoProject) => {
    setProjects((prevProjects) => {
      // Ensure no duplicate ID is added if this function is called directly
      if (prevProjects.some(p => p.id === project.id)) {
        return prevProjects.map(p => p.id === project.id ? { ...p, ...project, updatedAt: new Date().toISOString() } : p);
      }
      return [project, ...prevProjects];
    });
  }, []);

  const updateProject = useCallback((updatedProject: Partial<VideoProject> & { id: string }) => {
    setProjects((prevProjects) =>
      prevProjects.map((p) =>
        p.id === updatedProject.id ? { ...p, ...updatedProject, updatedAt: new Date().toISOString() } : p
      )
    );
  }, []);

  const addOrUpdateProject = useCallback((project: VideoProject) => {
    setProjects(prevProjects => {
      const existingProjectIndex = prevProjects.findIndex(p => p.id === project.id);
      if (existingProjectIndex !== -1) {
        // Update existing project
        const newProjects = [...prevProjects];
        newProjects[existingProjectIndex] = { 
          ...newProjects[existingProjectIndex], 
          ...project, 
          updatedAt: new Date().toISOString() 
        };
        return newProjects;
      } else {
        // Add new project
        // Ensure the project has createdAt if it's truly new here
        const projectToAdd = {
            ...project,
            createdAt: project.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        return [projectToAdd, ...prevProjects];
      }
    });
  }, []);

  const removeProject = useCallback((projectId: string) => {
    setProjects((prevProjects) => prevProjects.filter((p) => p.id !== projectId));
  }, []);

  const getProject = useCallback((projectId: string) => {
    return projects.find(p => p.id === projectId);
  }, [projects]);
  
  const clearProjects = useCallback(() => {
    setProjects([]);
  }, []);

  return { projects, addProject, updateProject, removeProject, getProject, clearProjects, addOrUpdateProject };
}

