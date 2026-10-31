import React, { useRef, useEffect } from 'react';
import { 
  Sparkles, 
  User, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Activity,
  FileText
} from 'lucide-react';
import { ChatMessage } from '../../services/mockChatData';
import { SuggestedPrompts } from './SuggestedPrompts';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onSelectPrompt: (promptText: string) => void;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isTyping,
  onSelectPrompt
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto flex items-center justify-center p-4">
        <SuggestedPrompts onSelectPrompt={onSelectPrompt} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      {messages.map((msg) => {
        const isUser = msg.sender === 'user';

        return (
          <div
            key={msg.id}
            className={`flex items-start gap-3 sm:gap-4 ${
              isUser ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs ${
              isUser
                ? 'bg-slate-900 text-white'
                : 'bg-gradient-to-tr from-teal-500 to-blue-600 text-white shadow-teal-500/20'
            }`}>
              {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className={`flex flex-col max-w-2xl min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-xs font-bold text-slate-800">
                  {isUser ? 'Dr. Marcus Vance' : 'Clinic Assistant AI'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                  {msg.timestamp}
                </span>
              </div>

              <div className={`rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed transition-all ${
                isUser
                  ? 'bg-slate-900 text-white rounded-tr-xs shadow-xs'
                  : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)]'
              }`}>
                {/* Formatted Markdown-like Content */}
                <div className="space-y-2.5 whitespace-pre-line">
                  {msg.content}
                </div>

                {/* Structured triage data card if present */}
                {msg.structuredData && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 bg-slate-50/80 -mx-2 -mb-2 p-3 rounded-xl border border-slate-200/70 text-xs text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-teal-600" />
                        Clinical Triage Profile
                      </span>
                      {msg.structuredData.urgency && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          msg.structuredData.urgency.includes('Level 1')
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}>
                          {msg.structuredData.urgency}
                        </span>
                      )}
                    </div>

                    {msg.structuredData.vitalsSummary && (
                      <p className="font-mono text-[11px] text-slate-600">
                        <strong>Vitals:</strong> {msg.structuredData.vitalsSummary}
                      </p>
                    )}

                    {msg.structuredData.recommendations && (
                      <div className="space-y-1">
                        <strong className="text-[10px] uppercase font-bold text-slate-400 block">Orders Generated:</strong>
                        <div className="flex flex-wrap gap-1">
                          {msg.structuredData.recommendations.map((rec, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-800">
                              ✓ {rec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action buttons (Copy text) */}
              {!isUser && (
                <div className="flex items-center gap-2 mt-1.5 px-1">
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-teal-600" />
                        <span className="text-teal-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy summary</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* 4. Typing Indicator */}
      {isTyping && (
        <div className="flex items-start gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4 animate-spin" />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-4 shadow-xs flex items-center gap-3">
            {/* Animated bouncing dots */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              AI Assistant is reviewing clinical guidelines & EHR context...
            </span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
