project card

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Users, Calendar, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const colorThemes = {
  indigo: { bg: "bg-gradient-to-br from-indigo-500 to-indigo-600", badge: "bg-indigo-100 text-indigo-700" },
  blue: { bg: "bg-gradient-to-br from-blue-500 to-blue-600", badge: "bg-blue-100 text-blue-700" },
  purple: { bg: "bg-gradient-to-br from-purple-500 to-purple-600", badge: "bg-purple-100 text-purple-700" },
  green: { bg: "bg-gradient-to-br from-green-500 to-green-600", badge: "bg-green-100 text-green-700" },
  orange: { bg: "bg-gradient-to-br from-orange-500 to-orange-600", badge: "bg-orange-100 text-orange-700" },
  red: { bg: "bg-gradient-to-br from-red-500 to-red-600", badge: "bg-red-100 text-red-700" },
  pink: { bg: "bg-gradient-to-br from-pink-500 to-pink-600", badge: "bg-pink-100 text-pink-700" },
  teal: { bg: "bg-gradient-to-br from-teal-500 to-teal-600", badge: "bg-teal-100 text-teal-700" },
};

const statusLabels = {
  planning: "Planning",
  in_progress: "In Progress",
  on_hold: "On Hold",
  completed: "Completed",
  archived: "Archived"
};

const ProjectCard = React.memo(({ project, memberCount, onEdit, onDelete }) => {
  const theme = colorThemes[project.color] || colorThemes.indigo;

  return (
    <Link to={createPageUrl(`ProjectDetail?id=${project.id}`)}>
      <Card className="overflow-hidden border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 bg-white group cursor-pointer">
        <div className={`h-3 ${theme.bg}`} />
        
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-slate-900 mb-1 truncate group-hover:text-indigo-600 transition-colors">
                {project.name}
              </h3>
              <Badge variant="secondary" className={theme.badge}>
                {statusLabels[project.status]}
              </Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button variant="ghost" size="icon" className="hover:bg-slate-100">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.preventDefault(); onEdit(); }}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => { e.preventDefault(); onDelete(); }}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-slate-600 line-clamp-2 min-h-[2.5rem]">
            {project.description || "No description provided"}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
            </div>
            {project.due_date && (
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{format(new Date(project.due_date), "MMM d, yyyy")}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

ProjectCard.displayName = 'ProjectCard';

export default ProjectCard;