chat section


import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageCircle, User, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const ChatSection = React.memo(({ projectId }) => {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: messages = [], refetch, isRefetching } = useQuery({
    queryKey: ['chat', projectId],
    queryFn: () => base44.entities.Chat.filter({ project_id: projectId }, '-created_date'),
    enabled: !!projectId,
    staleTime: 10000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      const user = await base44.auth.me();
      return base44.entities.Chat.create({
        ...messageData,
        user_email: user.email,
        user_name: user.full_name || user.email.split('@')[0]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chat', projectId]);
      setMessage("");
    },
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessageMutation.mutate({
      project_id: projectId,
      message: message.trim(),
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const reversedMessages = React.useMemo(() => [...messages].reverse(), [messages]);

  return (
    <Card className="border-slate-200 shadow-lg h-[600px] flex flex-col">
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <MessageCircle className="w-5 h-5 text-indigo-600" />
            Team Chat
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-8 w-8"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {reversedMessages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium">No messages yet</p>
                <p className="text-sm text-slate-500 mt-1">Start the conversation!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {reversedMessages.map((msg) => {
                const isCurrentUser = currentUser && msg.user_email === currentUser.email;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCurrentUser 
                          ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' 
                          : 'bg-gradient-to-br from-slate-300 to-slate-400'
                      }`}>
                        <User className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className={`flex-1 max-w-[75%] ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`flex items-baseline gap-2 mb-1 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-sm font-semibold text-slate-900">
                          {isCurrentUser ? 'You' : msg.user_name || msg.user_email.split('@')[0]}
                        </span>
                        <span className="text-xs text-slate-500">
                          {format(new Date(msg.created_date), 'HH:mm')}
                        </span>
                      </div>
                      
                      <div className={`rounded-2xl px-4 py-2.5 ${
                        isCurrentUser 
                          ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white' 
                          : 'bg-white border border-slate-200 text-slate-900'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200">
          <div className="flex gap-3">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="min-h-[60px] max-h-[120px] resize-none rounded-xl border-slate-200 focus:border-indigo-300 focus:ring-indigo-200"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <Button
              type="submit"
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 self-end h-[60px] px-6"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </CardContent>
    </Card>
  );
});

ChatSection.displayName = 'ChatSection';

export default ChatSection;