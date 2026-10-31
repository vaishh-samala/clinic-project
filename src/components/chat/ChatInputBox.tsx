import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, CornerDownLeft, Paperclip } from 'lucide-react';

interface ChatInputBoxProps {
  onSendMessage: (messageText: string) => void;
  isTyping: boolean;
}

export const ChatInputBox: React.FC<ChatInputBoxProps> = ({
  onSendMessage,
  isTyping
}) => {
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const quickPatientChips = [
    { label: 'Arthur Pendelton (CAD)', text: 'Review Arthur Pendelton’s symptoms: 71yo male with exertional chest tightness.' },
    { label: 'Eleanor Sterling (Diabetes)', text: 'Summarize medical history and medication regimen for Eleanor Sterling.' },
    { label: 'Zoe Chen (Pediatric Fever)', text: 'Help me understand these symptoms: 8yo child with 100.2F fever and ear tugging.' }
  ];

  const handleSend = () => {
    if (!inputText.trim() || isTyping) return;
    onSendMessage(inputText.trim());
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    // Auto resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleInsertChip = (text: string) => {
    setInputText(text);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-white border-t border-slate-200/90 space-y-2.5">
      {/* Quick context insertion chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
          Context:
        </span>
        {quickPatientChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleInsertChip(chip.text)}
            className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 hover:bg-teal-50 hover:border-teal-200 text-slate-600 hover:text-teal-900 text-[11px] font-medium shrink-0 transition-colors"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input container */}
      <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-200/90 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
        <textarea
          ref={textareaRef}
          rows={1}
          value={inputText}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask a clinical question, analyze symptoms, or summarize records (Press Enter to send)..."
          disabled={isTyping}
          className="w-full bg-transparent px-3 py-1.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none max-h-32 min-h-[36px] leading-relaxed"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!inputText.trim() || isTyping}
          className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 hover:bg-teal-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs active:scale-[0.96]"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
        <span>AI responses are simulation aids and should be reviewed by an attending physician.</span>
        <span className="hidden sm:inline font-mono">Shift + Enter for new line</span>
      </div>
    </div>
  );
};
