import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Search, 
  Trash2, 
  Clock, 
  User, 
  Sparkles,
  X
} from 'lucide-react';
import { Conversation } from '../../services/mockChatData';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.patientContext && c.patientContext.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200/90 flex flex-col shrink-0 transition-transform duration-200 md:static md:translate-x-0 ${
        isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none'
      }`}>
        {/* Top: New Conversation Button & Mobile Close */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              onNewConversation();
              if (onCloseMobile) onCloseMobile();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 active:scale-[0.98] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Chat History */}
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chat sessions..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Clinical Sessions</span>
            <span className="font-mono">{filteredConversations.length}</span>
          </div>

          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`group relative p-3 rounded-2xl cursor-pointer text-left transition-all ${
                    isActive
                      ? 'bg-teal-50/80 border border-teal-200/90 shadow-2xs'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <h4 className={`text-xs font-bold leading-tight line-clamp-1 ${
                      isActive ? 'text-teal-950 font-extrabold' : 'text-slate-800'
                    }`}>
                      {conv.title}
                    </h4>

                    {conversations.length > 1 && (
                      <button
                        onClick={(e) => onDeleteConversation(conv.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all shrink-0 -mr-1 -mt-1"
                        title="Delete conversation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 leading-normal">
                    {conv.lastMessage}
                  </p>

                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{conv.timestamp}</span>
                    </span>
                    {conv.patientContext && (
                      <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-sans font-medium truncate max-w-[110px]">
                        {conv.patientContext.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No clinical sessions found.
            </div>
          )}
        </div>

        {/* Sidebar Footer info */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-semibold text-slate-700">Clinical Protocol v2.4</span>
          </div>
          <span className="text-teal-700 font-bold">Offline Ready</span>
        </div>
      </div>
    </>
  );
};
