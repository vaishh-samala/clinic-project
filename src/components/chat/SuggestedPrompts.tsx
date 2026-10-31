import React from 'react';
import { 
  FileText, 
  Stethoscope, 
  ClipboardCheck, 
  Activity, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface SuggestedPromptsProps {
  onSelectPrompt: (promptText: string) => void;
}

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ onSelectPrompt }) => {
  const suggestions = [
    {
      title: "Summarize a patient's medical history.",
      description: "Extract chronic conditions, medications, allergies, and recent vital signs.",
      icon: FileText,
      color: "text-blue-600 bg-blue-50 border-blue-100"
    },
    {
      title: "Help me understand these symptoms.",
      description: "Evaluate clinical urgency, differential diagnoses, and red flag indicators.",
      icon: Stethoscope,
      color: "text-teal-600 bg-teal-50 border-teal-100"
    },
    {
      title: "Review a patient's clinical notes.",
      description: "Verify structured SOAP documentation (Subjective, Objective, Assessment, Plan).",
      icon: ClipboardCheck,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100"
    },
    {
      title: "Explain a medical report.",
      description: "Interpret 12-lead ECG traces, diagnostic lab panels, or cardiac biomarkers.",
      icon: Activity,
      color: "text-cyan-600 bg-cyan-50 border-cyan-100"
    }
  ];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 text-center">
      {/* Welcome Hero Lockup */}
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-teal-500/20">
        <Sparkles className="w-7 h-7" />
      </div>

      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
        Clinic AI Clinical Assistant
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
        Ask questions regarding patient intake, triage categorization, clinical notes, and diagnostic interpretation.
      </p>

      {/* Suggested Questions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8 text-left">
        {suggestions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.title)}
              className="group p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-teal-300 hover:shadow-[0_4px_16px_-4px_rgba(20,184,166,0.12)] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-teal-900 transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
