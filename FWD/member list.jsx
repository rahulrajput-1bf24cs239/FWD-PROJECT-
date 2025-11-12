member list

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Trash2, Crown, UserCheck, Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const roleIcons = {
  admin: Crown,
  member: UserCheck,
  viewer: Eye,
};

const roleColors = {
  admin: "bg-purple-100 text-purple-700",
  member: "bg-blue-100 text-blue-700",
  viewer: "bg-slate-100 text-slate-700",
};

export default function MembersList({ members, onRemoveMember, onUpdateRole }) {
  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-600">No team members yet</p>
        <p className="text-sm text-slate-500 mt-1">Add members to start collaborating</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {members.map((member) => {
          const RoleIcon = roleIcons[member.role];
          return (
            <motion.div
              key={member.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-11 h-11 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{member.user_email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={roleColors[member.role]}>
                      <RoleIcon className="w-3 h-3 mr-1" />
                      {member.role}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={member.role}
                  onValueChange={(role) => onUpdateRole(member.id, role)}
                >
                  <SelectTrigger className="w-32 h-9 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove team member?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove {member.user_email} from this project? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onRemoveMember(member.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}