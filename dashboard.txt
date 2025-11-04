dashboard


import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Search, TrendingUp, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ProjectCard from "../components/dashboard/ProjectCard";
import CreateProjectDialog from "../components/dashboard/CreateProjectDialog";
import EditProjectDialog from "../components/dashboard/EditProjectDialog";
import AnalyticsDashboard from "../components/dashboard/AnalyticsDashboard";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [activeTab, setActiveTab] = useState("projects");
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date'),
    staleTime: 30000,
  });

  const { data: projectMembers = [] } = useQuery({
    queryKey: ['projectMembers'],
    queryFn: () => base44.entities.ProjectMember.list(),
    staleTime: 30000,
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (projectId) => base44.entities.Project.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      queryClient.invalidateQueries(['projectMembers']);
    },
  });

  const filteredProjects = useMemo(() => 
    projects.filter(project =>
      project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [projects, searchQuery]
  );

  const getMemberCount = useMemo(() => {
    const memberCounts = {};
    projectMembers.forEach(m => {
      memberCounts[m.project_id] = (memberCounts[m.project_id] || 0) + 1;
    });
    return memberCounts;
  }, [projectMembers]);

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
              <p className="text-slate-600">Track progress and manage your projects</p>
            </div>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-500/30 transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Projects
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics">
              <AnalyticsDashboard 
                projects={projects} 
                projectMembers={projectMembers}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="projects">
              <div className="relative max-w-md mb-8">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-white border-slate-200 focus:border-indigo-300 focus:ring-indigo-200 rounded-xl"
                />
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 bg-white rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Plus className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                    {searchQuery ? 'No projects found' : 'No projects yet'}
                  </h3>
                  <p className="text-slate-600 mb-6">
                    {searchQuery ? 'Try adjusting your search' : 'Create your first project to get started'}
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={() => setCreateDialogOpen(true)}
                      className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Project
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      memberCount={getMemberCount[project.id] || 0}
                      onEdit={() => setEditingProject(project)}
                      onDelete={() => deleteProjectMutation.mutate(project.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <CreateProjectDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />

        <EditProjectDialog
          project={editingProject}
          open={!!editingProject}
          onOpenChange={(open) => !open && setEditingProject(null)}
        />
      </div>
    </div>
  );
}