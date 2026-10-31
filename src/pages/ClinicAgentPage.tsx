import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Sparkles, 
  MessageSquare, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  RotateCcw, 
  Sliders, 
  HelpCircle,
  FileText,
  Stethoscope,
  Activity
} from 'lucide-react';
import { 
  Conversation, 
  ChatMessage, 
  INITIAL_CONVERSATIONS, 
  getMockAIResponse 
} from '../services/mockChatData';
import { ChatSidebar } from '../components/chat/ChatSidebar';
import { ChatMessageList } from '../components/chat/ChatMessageList';
import { ChatInputBox } from '../components/chat/ChatInputBox';
import { PatientConsultationWorkflow } from '../components/consultation/PatientConsultationWorkflow';
import { api } from '../services/api';

export const ClinicAgentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialPatientParam = searchParams.get('patient') || undefined;
  const initialMode = searchParams.get('mode') === 'chat' ? 'chat' : 'consultation';

  const [activeMode, setActiveMode] = useState<'consultation' | 'chat'>(initialMode);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<string>(INITIAL_CONVERSATIONS[0].id);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState<boolean>(false);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];

  const handleSendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;

    const now = new Date();
    const timeString = `${now.getHours() % 12 || 12}:${now.getMinutes().toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      content: text,
      timestamp: timeString
    };

    const updatedMessages = [...(activeConversation?.messages || []), userMessage];
    
    let newTitle = activeConversation.title;
    if (activeConversation.title === 'New Clinical Consultation' || activeConversation.messages.length === 0) {
      newTitle = text.slice(0, 36) + (text.length > 36 ? '...' : '');
    }

    setConversations(prev => prev.map(c => {
      if (c.id === activeConversationId) {
        return {
          ...c,
          title: newTitle,
          lastMessage: text,
          timestamp: 'Just now',
          messages: updatedMessages
        };
      }
      return c;
    }));

    setIsTyping(true);

    api.chatWithAgent(text, activeConversationId)
      .then((res) => {
        const aiReplyText = res.reply;
        const aiMessage: ChatMessage = {
          id: `msg-${Date.now()}-ai`,
          sender: 'assistant',
          content: aiReplyText,
          timestamp: `${now.getHours() % 12 || 12}:${now.getMinutes().toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`
        };

        setConversations(prev => prev.map(c => {
          if (c.id === activeConversationId) {
            return {
              ...c,
              lastMessage: aiReplyText.split('\n')[0].replace(/[#*]/g, '').trim(),
              timestamp: 'Just now',
              messages: [...updatedMessages, aiMessage]
            };
          }
          return c;
        }));
      })
      .catch(() => {
        const aiReplyText = getMockAIResponse(text);
        const aiMessage: ChatMessage = {
          id: `msg-${Date.now()}-ai`,
          sender: 'assistant',
          content: aiReplyText,
          timestamp: `${now.getHours() % 12 || 12}:${now.getMinutes().toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`
        };

        setConversations(prev => prev.map(c => {
          if (c.id === activeConversationId) {
            return {
              ...c,
              lastMessage: aiReplyText.split('\n')[0].replace(/[#*]/g, '').trim(),
              timestamp: 'Just now',
              messages: [...updatedMessages, aiMessage]
            };
          }
          return c;
        }));
      })
      .finally(() => {
        setIsTyping(false);
      });
  };

  const handleNewConversation = () => {
    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: 'New Clinical Consultation',
      lastMessage: 'Ready for clinical intake and inquiry...',
      timestamp: 'Just now',
      messages: []
    };

    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newId);
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (conversations.length <= 1) {
      handleNewConversation();
      setConversations(prev => prev.filter(c => c.id !== id));
      return;
    }

    const remaining = conversations.filter(c => c.id !== id);
    setConversations(remaining);
    if (activeConversationId === id) {
      setActiveConversationId(remaining[0].id);
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Top Mode Navigation Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              AI Clinical Assistant & Consultation Suite
            </h1>
            <p className="text-xs text-slate-500">
              Structured patient consultations, differential hypotheses, and clinical Q&A.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveMode('consultation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'consultation'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            <span>Consultation Workflow</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'chat'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
            <span>AI Assistant Chat</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Patient Consultation Workflow */}
      {activeMode === 'consultation' ? (
        <PatientConsultationWorkflow initialPatientId={initialPatientParam} />
      ) : (
        /* Mode 2: Chat Interface */
        <div className="h-[calc(100vh-10.5rem)] flex flex-col bg-white rounded-3xl border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Top Banner inside Chat */}
          <div className="px-4 sm:px-6 py-3 border-b border-slate-200/90 bg-white flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setIsMobileHistoryOpen(true)}
                className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Open conversation history"
              >
                <MessageSquare className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 truncate">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <h2 className="text-sm font-bold text-slate-900 truncate">
                    {activeConversation.title}
                  </h2>
                  <p className="text-[11px] text-slate-400 truncate">
                    {activeConversation.patientContext || 'Clinical Decision Support'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleNewConversation}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Chat</span>
              </button>
            </div>
          </div>

          {/* Main Chat Workspace Split */}
          <div className="flex-1 flex min-h-0 relative">
            <ChatSidebar
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={setActiveConversationId}
              onNewConversation={handleNewConversation}
              onDeleteConversation={handleDeleteConversation}
              isOpenMobile={isMobileHistoryOpen}
              onCloseMobile={() => setIsMobileHistoryOpen(false)}
            />

            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
              <ChatMessageList
                messages={activeConversation.messages}
                isTyping={isTyping}
                onSelectPrompt={handleSendMessage}
              />

              <ChatInputBox
                onSendMessage={handleSendMessage}
                isTyping={isTyping}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
