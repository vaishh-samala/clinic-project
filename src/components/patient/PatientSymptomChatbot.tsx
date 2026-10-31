import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Stethoscope, 
  FileText, 
  RefreshCw, 
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react';
import { Patient, Doctor, INITIAL_DOCTORS } from '../../services/mockData';
import { 
  consultationWorkflowService, 
  ChatMessage, 
  UrgencyLevel 
} from '../../services/consultationWorkflowService';

interface PatientSymptomChatbotProps {
  patient: Patient;
  onConsultationSubmitted?: () => void;
}

export const PatientSymptomChatbot: React.FC<PatientSymptomChatbotProps> = ({
  patient,
  onConsultationSubmitted
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init-1',
      sender: 'bot',
      text: `Hello ${patient.name.split(' ')[0]}! I'm your Clinic AI Triage Assistant. Please describe what health concerns or symptoms you are experiencing today.`,
      timestamp: 'Just now',
      quickReplies: [
        'Persistent headache and eye strain',
        'Cough, mild fever and sore throat',
        'Stomach ache and feeling nauseous',
        'Chest heaviness and shortness of breath'
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [stage, setStage] = useState<'intake' | 'followup' | 'severity' | 'summary' | 'submitted'>('intake');

  // Intake collected state
  const [collectedSymptoms, setCollectedSymptoms] = useState<string[]>([]);
  const [symptomSummaryText, setSymptomSummaryText] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Normal');
  const [urgencyReason, setUrgencyReason] = useState('');
  const [assignedDoctor, setAssignedDoctor] = useState<Doctor>(INITIAL_DOCTORS[1]); // Default to Dr. Marcus Vance (Internal Med)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'patient',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);

    const lower = text.toLowerCase();

    // Clinical keyword detection for urgency
    let detectedUrgency: UrgencyLevel = 'Normal';
    let reason = 'Mild self-limiting or subacute symptoms suitable for routine outpatient review.';
    let chosenDoc = INITIAL_DOCTORS[1]; // Marcus Vance (Internal Medicine)

    if (
      lower.includes('chest') ||
      lower.includes('heart') ||
      lower.includes('radiat') ||
      lower.includes('breath') ||
      lower.includes('sweat') ||
      lower.includes('pass out') ||
      lower.includes('faint') ||
      lower.includes('stroke')
    ) {
      detectedUrgency = 'Red Flag';
      reason = 'Cardiovascular / pulmonary alert symptoms reported. Requires rapid clinical review and ECG/vitals evaluation.';
      chosenDoc = INITIAL_DOCTORS[0]; // Dr. Sarah Mitchell (Cardiology)
    } else if (
      lower.includes('severe') ||
      lower.includes('migraine') ||
      lower.includes('aura') ||
      lower.includes('fever') ||
      lower.includes('vomit') ||
      lower.includes('infection') ||
      lower.includes('8') ||
      lower.includes('9') ||
      lower.includes('10')
    ) {
      detectedUrgency = 'Urgent';
      reason = 'Moderate-to-high acute symptom distress; prompt same-day physician consultation recommended.';
      chosenDoc = lower.includes('migraine') ? INITIAL_DOCTORS[4] || INITIAL_DOCTORS[1] : INITIAL_DOCTORS[1];
    } else if (lower.includes('child') || lower.includes('infant') || lower.includes('pediatric')) {
      chosenDoc = INITIAL_DOCTORS[2]; // Dr. Elena Rostova (Pediatrics)
    } else if (lower.includes('bone') || lower.includes('joint') || lower.includes('knee') || lower.includes('ankle') || lower.includes('back')) {
      chosenDoc = INITIAL_DOCTORS[3]; // Dr. Julian Chen (Orthopedics)
    }

    setUrgency(detectedUrgency);
    setUrgencyReason(reason);
    setAssignedDoctor(chosenDoc);

    setTimeout(() => {
      let botResponse = '';
      let nextReplies: string[] | undefined = undefined;

      if (stage === 'intake') {
        setCollectedSymptoms(prev => [...prev, text]);
        setSymptomSummaryText(text);

        if (detectedUrgency === 'Red Flag') {
          botResponse = `⚠️ High Priority Indicator: I noticed you reported "${text}". Because cardiovascular or acute respiratory sensations can be serious, are you feeling any cold sweating, dizziness, or pain moving toward your arm or jaw?`;
          nextReplies = ['Yes, radiating down my arm', 'No, just localized pressure', 'I feel slightly short of breath'];
        } else {
          botResponse = `Thank you for sharing that. How long have you been experiencing this, and on a scale of 1 to 10, how intense would you rate the discomfort?`;
          nextReplies = [
            'Started today (Mild, 3-4/10)',
            'Past 2-3 days (Moderate, 5-6/10)',
            'Over a week (Severe, 7-8/10)',
            'Sudden severe onset (9-10/10)'
          ];
        }
        setStage('followup');
      } else if (stage === 'followup') {
        const fullSymptoms = `${symptomSummaryText}. Duration & severity: ${text}.`;
        setSymptomSummaryText(fullSymptoms);

        // Cross-reference with patient's medical history
        const historyNote = patient.chronicConditions && patient.chronicConditions.length > 0
          ? `Noted against your chronic profile (${patient.chronicConditions.join(', ')}) and medications (${patient.currentMedications.join(', ')}).`
          : 'Cross-referenced with your clinic health record.';

        botResponse = `Understood. ${historyNote} Are you currently experiencing any fever, nausea, or unexpected chills?`;
        nextReplies = ['No additional symptoms', 'Yes, mild nausea and chills', 'Yes, high fever'];
        setStage('severity');
      } else if (stage === 'severity') {
        const fullSymptoms = `${symptomSummaryText}. Associated features: ${text}.`;
        setSymptomSummaryText(fullSymptoms);

        botResponse = `Thank you, ${patient.name.split(' ')[0]}. I have compiled your symptom assessment. Based on standard clinical guidelines, this has been categorized as "${urgency}" urgency. I have prepared your intake summary below for review and submission to ${assignedDoctor.name} (${assignedDoctor.specialty}).`;
        setStage('summary');
      } else {
        botResponse = `I have logged your additional note: "${text}". Please click "Submit Consultation Request" below so our medical team can review and approve your appointment.`;
      }

      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'bot',
          text: botResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickReplies: nextReplies
        }
      ]);
    }, 900);
  };

  const handleSubmitConsultation = () => {
    setIsSubmitting(true);

    const symptomList = collectedSymptoms.length > 0 
      ? collectedSymptoms 
      : [symptomSummaryText || 'Patient reported acute clinical symptoms for triage review.'];

    setTimeout(() => {
      consultationWorkflowService.submitNewConsultation({
        patientId: patient.id,
        patientName: patient.name,
        patientAge: patient.age,
        patientGender: patient.gender,
        patientPhone: patient.phone,
        patientEmail: patient.email,
        symptomsReported: symptomSummaryText || 'Patient reported symptoms via clinic triage chatbot.',
        symptomsList: symptomList,
        urgency: urgency,
        urgencyReason: urgencyReason,
        relevantMedicalHistory: patient.medicalHistory || patient.chronicConditions?.join('; ') || 'Standard clinical baseline',
        currentMedications: patient.currentMedications || [],
        allergies: patient.allergies || ['No known drug allergies'],
        chatTranscript: messages,
        assignedDoctorId: assignedDoctor.id,
        assignedDoctorName: assignedDoctor.name
      });

      setIsSubmitting(false);
      setSubmissionSuccess(true);
      setStage('submitted');
      if (onConsultationSubmitted) {
        onConsultationSubmitted();
      }
    }, 700);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        text: `Hello ${patient.name.split(' ')[0]}! Starting a fresh consultation. What symptoms or questions do you have today?`,
        timestamp: 'Just now',
        quickReplies: [
          'Mild morning dizziness and dry mouth',
          'Sharp knee pain after jogging',
          'Persistent cough with seasonal allergies',
          'Review medication side effects'
        ]
      }
    ]);
    setStage('intake');
    setCollectedSymptoms([]);
    setSymptomSummaryText('');
    setUrgency('Normal');
    setSubmissionSuccess(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col h-[700px]">
      {/* Chatbot Header */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600/60 border border-teal-400/40 flex items-center justify-center text-teal-200 shadow-inner">
            <Bot className="w-6 h-6 text-cyan-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-white tracking-wide text-base">
                Clinic AI Symptom Assistant
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-500/30 text-teal-200 border border-teal-400/30">
                <Sparkles className="w-3 h-3 mr-1 text-teal-300" />
                Active Triage
              </span>
            </div>
            <p className="text-xs text-teal-100/90">
              Interactive clinical intake for {patient.name} (ID: {patient.id})
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-teal-800/80 hover:bg-teal-700/80 text-teal-100 border border-teal-600/50 transition-colors"
          title="Restart conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Mandatory Non-Diagnostic Disclaimer Banner */}
      <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-2.5 flex items-start space-x-2.5 text-amber-900 text-xs">
        <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold text-amber-950">Non-Diagnostic Clinical Disclaimer: </strong>
          This AI assistant collects symptoms for clinic routing and preliminary urgency assessment only. It does not provide a definitive medical diagnosis. A licensed physician will review and approve all consultation requests.
        </p>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${
              msg.sender === 'patient' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                msg.sender === 'patient'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-teal-700 text-teal-100 shadow-sm'
              }`}
            >
              {msg.sender === 'patient' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] space-y-2`}>
              <div
                className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.sender === 'patient'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>

              {/* Quick reply chips if provided */}
              {msg.quickReplies && msg.quickReplies.length > 0 && stage !== 'submitted' && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {msg.quickReplies.map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(reply)}
                      className="text-xs bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200 shadow-xs transition-all font-medium text-left"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}

              <span className="text-[10px] text-slate-400 block px-1">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2 text-slate-500 text-xs p-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 px-3 py-2 rounded-2xl rounded-tl-none flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce"></span>
              <span className="text-slate-500 text-xs ml-1 font-medium">Assistant analyzing clinical cues...</span>
            </div>
          </div>
        )}

        {/* Live Consultation Summary Card when intake is complete */}
        {(stage === 'summary' || stage === 'submitted') && (
          <div className="my-4 p-4 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50/70 via-white to-cyan-50/50 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-teal-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-teal-700" />
                <h4 className="font-semibold text-slate-900 text-sm">
                  Generated Consultation Summary
                </h4>
              </div>

              {/* Urgency Badge */}
              <div className="flex items-center space-x-1.5">
                <span className="text-xs text-slate-500 font-medium">Urgency:</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    urgency === 'Red Flag'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                      : urgency === 'Urgent'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {urgency === 'Red Flag' && <ShieldAlert className="w-3 h-3 mr-1 text-rose-700" />}
                  {urgency === 'Urgent' && <AlertTriangle className="w-3 h-3 mr-1 text-amber-700" />}
                  {urgency === 'Normal' && <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-700" />}
                  {urgency}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
              <div className="bg-white/80 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block font-medium">Patient Info:</span>
                <span className="font-semibold text-slate-900">{patient.name}</span>, {patient.age}y ({patient.gender}) • ID: {patient.id}
              </div>

              <div className="bg-white/80 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block font-medium">Assigned Doctor:</span>
                <span className="font-semibold text-slate-900">{assignedDoctor.name}</span> ({assignedDoctor.specialty})
              </div>

              <div className="col-span-full bg-white/80 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block font-medium">Reported Symptoms:</span>
                <p className="text-slate-800 font-medium mt-0.5">{symptomSummaryText || 'Patient reported symptoms'}</p>
              </div>

              <div className="col-span-full bg-white/80 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-400 block font-medium">Relevant Medical Baseline:</span>
                <p className="text-slate-600 mt-0.5">
                  Chronic: {patient.chronicConditions?.join(', ') || 'None'} • Meds: {patient.currentMedications?.join(', ') || 'None'} • Allergies: {patient.allergies?.join(', ') || 'NKDA'}
                </p>
              </div>

              <div className="col-span-full bg-white/80 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block font-medium">Request Status:</span>
                  <span className="font-semibold text-amber-700 inline-flex items-center mt-0.5">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {submissionSuccess ? 'Awaiting Doctor Approval (Submitted)' : 'Ready for Submission'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block font-medium">Triage Recommendation:</span>
                  <span className="text-slate-700">{urgencyReason.slice(0, 55)}...</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            {!submissionSuccess ? (
              <div className="pt-2">
                <button
                  onClick={handleSubmitConsultation}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-white font-medium text-sm bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 shadow-sm transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Transmitting Consultation to Doctor Queue...</span>
                    </>
                  ) : (
                    <>
                      <Stethoscope className="w-4 h-4" />
                      <span>Submit Consultation Request to {assignedDoctor.name}</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Consultation Request Successfully Submitted!</p>
                  <p className="text-emerald-700 mt-0.5">
                    Your consultation request has been forwarded to <strong>{assignedDoctor.name}</strong> for clinical review. The status is currently <strong>Awaiting Doctor Approval</strong>. You will see updates on your dashboard once approved.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      {stage !== 'submitted' ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your symptoms or answer the questions..."
            className="flex-1 bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:outline-none rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 disabled:hover:bg-teal-600 transition-colors shadow-xs"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>Consultation submitted to physician queue.</span>
          <button
            onClick={handleResetChat}
            className="text-teal-700 hover:text-teal-800 font-medium underline"
          >
            Start another consultation intake
          </button>
        </div>
      )}
    </div>
  );
};
