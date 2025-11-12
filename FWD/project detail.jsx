project detail

import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Calendar, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";

import MembersList from "../components/project/MembersList";
import AddMemberDialog from "../components/project/AddMemberDialog";
import EditProjectDialog from "../components/dashboard/EditProjectDialog";
import ChatSection from "../components/project/ChatSection";

const colorThemes = {
  indigo: "from-indigo-500 to-indigo-600",
  blue: "from-blue-500 to-blue-600",
  purple: "from-purple-500 to-purple-600",
  green: "from-green-500 to-green-600",
  orange: "from-orange-500 to-orange-600",
  red: "from-red-500 to-red-600",
  pink: "from-pink-500 to-pink-600",
  teal: "from-teal-500 to-teal-600",
};

const statusLabels = {
  planning: "Planning",
  in_progress: "In Progress",
  on_hold: "On Hold",
  completed: "Completed",
  archived: "Archived"
};

export default function ProjectDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("id");

  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const projects = await base44.entities.Project.filter({ id: projectId });
      return projects[0];
    },
    enabled: !!projectId,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['projectMembers', projectId],
    queryFn: () => base44.entities.ProjectMember.filter({ project_id: projectId }),
    enabled: !!projectId,
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (memberId) => base44.entities.ProjectMember.delete(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries(['projectMembers', projectId]);
    },
  });

  const updateMemberRoleMutation = useMutation({
    mutationFn: ({ memberId, role }) => base44.entities.ProjectMember.update(memberId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries(['projectMembers', projectId]);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-32 bg-slate-200 rounded animate-pulse mb-8" />
          <div className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen p-6 md:p-10 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Project not found</h2>
          <Button onClick={() => navigate(createPageUrl("Dashboard"))}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const theme = colorThemes[project.color] || colorThemes.indigo;

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="mb-6 hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card className="overflow-hidden border-slate-200 shadow-xl mb-8">
            <div className={`h-4 bg-gradient-to-r ${theme}`} />
            
            <CardHeader className="pb-6">
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
                    <Badge className={`bg-${project.color}-100 text-${project.color}-700`}>
                      {statusLabels[project.status]}
                    </Badge>
                  </div>
                  <p className="text-slate-600 text-lg">{project.description || "No description"}</p>
                </div>
                <Button
                  onClick={() => setEditProjectDialogOpen(true)}
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  Edit Project
                </Button>
              </div>
            </CardHeader>

            <CardContent className="border-t border-slate-100 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Team Members</p>
                    <p className="text-2xl font-bold text-slate-900">{members.length}</p>
                  </div>
                </div>

                {project.due_date && (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Due Date</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {format(new Date(project.due_date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Created</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {format(new Date(project.created_date), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Team Members Section */}
            <div>
              <Card className="border-slate-200 shadow-lg">
                <CardHeader className="border-b border-slate-100">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">Team Members</CardTitle>
                    <Button
                      onClick={() => setAddMemberDialogOpen(true)}
                      className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Member
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <MembersList
                    members={members}
                    onRemoveMember={(memberId) => deleteMemberMutation.mutate(memberId)}
                    onUpdateRole={(memberId, role) => updateMemberRoleMutation.mutate({ memberId, role })}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Chat Section */}
            <div>
              <ChatSection projectId={projectId} />
            </div>
          </div>
        </motion.div>

        <AddMemberDialog
          projectId={projectId}
          open={addMemberDialogOpen}
          onOpenChange={setAddMemberDialogOpen}
          existingMembers={members}
        />

        <EditProjectDialog
          project={project}
          open={editProjectDialogOpen}
          onOpenChange={setEditProjectDialogOpen}
        />
      </div>
    </div>
  );
}