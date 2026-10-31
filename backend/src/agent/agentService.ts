import { env } from '../config/env.js';
import { conversationService } from '../services/conversationService.js';
import { clinicTools } from './agentTools.js';
import type {
  AgentEngine,
  AgentResponse,
  TriageAssessment,
  UrgencyLevel,
  AgentAction,
} from './agentInterfaces.js';

const CLINICAL_DISCLAIMER =
  'Notice: This AI Clinic Assistant provides educational triage guidance and scheduling assistance. It does NOT provide formal medical diagnoses or prescriptions. If you are experiencing a life-threatening medical emergency, call 911 immediately or proceed to the nearest emergency department.';

export class AgentService implements AgentEngine {
  /**
   * Main conversational entry point
   */
  async processMessage(
    sessionId: string,
    userMessage: string,
    patientId?: string
  ): Promise<AgentResponse> {
    // 1. Get or create conversation session
    const conversation = await conversationService.getOrCreateConversation(sessionId, patientId);

    // 2. Persist the incoming user message
    await conversationService.appendMessage(conversation.id, 'USER', userMessage);

    // 3. Check for n8n AI agent webhook connection
    if (env.N8N_WEBHOOK_URL) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(env.N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            message: userMessage,
            patientId,
            timestamp: new Date().toISOString(),
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.ok) {
          const data = (await res.json()) as any;
          if (data && (data.reply || data.output || data.response)) {
            const replyText = data.reply || data.output || data.response;
            const urgency: UrgencyLevel = data.urgency || 'NORMAL';
            await conversationService.appendMessage(conversation.id, 'ASSISTANT', replyText, {
              urgency,
              source: 'n8n_workflow',
            });
            return {
              sessionId,
              reply: replyText,
              urgency,
              suggestedPrompts: data.suggestedPrompts || ['Show available doctors', 'Book an appointment'],
              disclaimer: CLINICAL_DISCLAIMER,
            };
          }
        }
      } catch {
        // Fallback gracefully to internal clinical triage agent engine
      }
    }

    const lowerMsg = userMessage.toLowerCase();

    // 3. Triage & Red Flag Evaluation
    const redFlagKeywords = [
      'chest pain',
      'crushing pressure',
      'short of breath',
      'difficulty breathing',
      'stroke',
      'face drooping',
      'arm weakness',
      'slurred speech',
      'coughing blood',
      'passed out',
      'unconscious',
      'anaphylaxis',
      'throat swelling',
      'blue lips',
      'severe head injury',
    ];

    const urgentKeywords = [
      'high fever',
      'sprained',
      'fracture',
      'severe migraine',
      'persistent vomiting',
      'infected cut',
      'deep laceration',
      'asthma flare',
      'severe abdominal pain',
      'burn',
    ];

    const isRedFlag = redFlagKeywords.some((keyword) => lowerMsg.includes(keyword));
    const isUrgent = !isRedFlag && urgentKeywords.some((keyword) => lowerMsg.includes(keyword));

    let urgency: UrgencyLevel = 'NORMAL';
    let assessment: TriageAssessment | undefined;
    const actionsExecuted: AgentAction[] = [];
    let reply = '';
    const suggestedPrompts: string[] = [];

    // Emergency red flag protocol
    if (isRedFlag) {
      urgency = 'RED_FLAG';
      assessment = {
        urgency: 'RED_FLAG',
        isEmergency: true,
        symptomsSummary: userMessage,
        possibleExplanations: [
          'Acute cardiovascular or respiratory emergency requiring urgent medical evaluation',
          'Potential acute coronary syndrome, pulmonary distress, or neurological event',
        ],
        suggestedQuestionsForDoctor: [
          'What immediate emergency interventions are necessary?',
          'Should an ambulance / EMS team be dispatched immediately?',
        ],
        recommendedNextSteps: [
          'Call 911 or your local emergency medical service immediately.',
          'Do NOT drive yourself to the hospital; have EMS transport you safely.',
          'Rest in a comfortable sitting position and remain calm.',
          'Do not take medications unless directed by emergency dispatchers.',
        ],
        disclaimer: CLINICAL_DISCLAIMER,
      };

      reply =
        '🚨 EMERGENCY ALERT: Based on the symptoms described (such as acute chest discomfort, severe breathing distress, or neurological signs), this may represent a critical medical emergency. Please dial 911 or proceed immediately to the nearest Emergency Department. Do not wait for a clinic appointment.';

      suggestedPrompts.push(
        'Clinic Emergency Contacts',
        'Find Nearest Emergency Room',
        'How do I cancel my pending routine appointment?'
      );
    } else if (isUrgent) {
      urgency = 'URGENT';
      assessment = {
        urgency: 'URGENT',
        isEmergency: false,
        symptomsSummary: userMessage,
        possibleExplanations: [
          'Acute onset requiring same-day or next-day clinical evaluation',
          'Potential infection, inflammatory episode, or musculoskeletal sprain',
        ],
        suggestedQuestionsForDoctor: [
          'How quickly should this symptom be addressed in person?',
          'Are there diagnostic labs or imaging studies recommended?',
          'What warning signs indicate I should escalate to emergency care?',
        ],
        recommendedNextSteps: [
          'Schedule an urgent consultation with our Internal Medicine or Urgent Care specialist.',
          'Stay hydrated and monitor your temperature/symptoms every 2-3 hours.',
          'If symptoms worsen acutely or you experience shortness of breath, seek emergency care immediately.',
        ],
        disclaimer: CLINICAL_DISCLAIMER,
      };

      reply =
        'Your symptoms indicate an urgent concern that should be reviewed promptly by a healthcare professional within 24 to 48 hours. Would you like me to find an available physician (such as Internal Medicine) for you today or tomorrow?';

      suggestedPrompts.push(
        'Show available doctors for today',
        'Book urgent consultation',
        'Clinic hours and address'
      );
    } else {
      // Normal / Intent handling
      if (
        lowerMsg.includes('doctor') ||
        lowerMsg.includes('specialist') ||
        lowerMsg.includes('cardiologist') ||
        lowerMsg.includes('pediatrician')
      ) {
        let specialty: string | undefined;
        if (lowerMsg.includes('cardio') || lowerMsg.includes('heart')) specialty = 'Cardiology';
        else if (lowerMsg.includes('pediatric') || lowerMsg.includes('child')) specialty = 'Pediatrics';
        else if (lowerMsg.includes('bone') || lowerMsg.includes('ortho') || lowerMsg.includes('joint')) specialty = 'Orthopedics';
        else if (lowerMsg.includes('general') || lowerMsg.includes('internal')) specialty = 'Internal Medicine';

        const doctors = (await clinicTools.findDoctors.execute({ specialty })) as any[];
        actionsExecuted.push({
          toolName: 'findDoctors',
          parameters: { specialty: specialty ?? 'All' },
          result: doctors,
        });

        reply = `We have ${doctors.length} qualified specialist${doctors.length > 1 ? 's' : ''} available at Metro Health:\n` +
          doctors.map((d: any) => `• ${d.name} (${d.specialization}) - ${d.roomNumber}`).join('\n') +
          '\n\nWould you like me to check available appointment slots for one of these physicians?';

        suggestedPrompts.push(
          'Check Dr. Jenkins availability',
          'Book an appointment',
          'What are the clinic hours?'
        );
      } else if (lowerMsg.includes('hour') || lowerMsg.includes('location') || lowerMsg.includes('address') || lowerMsg.includes('contact')) {
        const info = (await clinicTools.getClinicInfo.execute({})) as any;
        actionsExecuted.push({
          toolName: 'getClinicInfo',
          parameters: {},
          result: info,
        });

        reply = `📍 ${info.name}\nAddress: ${info.address}\nPhone: ${info.phone}\n\nOperating Hours:\n• Mon-Fri: ${info.hours.weekdays}\n• Saturday: ${info.hours.saturday}\n• Sunday: ${info.hours.sunday}`;

        suggestedPrompts.push(
          'Show available doctors',
          'Schedule an appointment',
          'Speak with triage assistant'
        );
      } else if (lowerMsg.includes('appointment') || lowerMsg.includes('schedule') || lowerMsg.includes('book')) {
        reply =
          'I can help you review or schedule an appointment. You can specify a doctor, preferred date, or let me know what symptoms you are experiencing so I can recommend the right specialist.';

        suggestedPrompts.push(
          'Show available cardiology slots',
          'Book Dr. Marcus Vance',
          'Check my upcoming appointments'
        );
      } else {
        // General symptom triage
        assessment = {
          urgency: 'NORMAL',
          isEmergency: false,
          symptomsSummary: userMessage,
          possibleExplanations: [
            'Common mild conditions consistent with self-limiting viral illness, mild fatigue, or dietary factors',
            'Non-acute symptoms appropriate for routine outpatient consultation',
          ],
          suggestedQuestionsForDoctor: [
            'What lifestyle or dietary modifications might help?',
            'How long should I monitor these symptoms before further follow-up?',
            'Are any preventive screening tests recommended for my age group?',
          ],
          recommendedNextSteps: [
            'Keep a symptom log noting time of day, severity, and any triggers.',
            'Rest adequately and maintain good hydration.',
            'Schedule a routine outpatient consultation with our primary care physician.',
          ],
          disclaimer: CLINICAL_DISCLAIMER,
        };

        reply =
          `Thank you for sharing your symptoms. I have logged your description for your care team. Based on standard triage guidelines, your symptoms appear non-acute at this time. Here is a summary of recommended next steps:\n\n` +
          `• Maintain rest and hydration\n` +
          `• Keep a log of symptom progression\n` +
          `• Book a routine consultation if symptoms persist\n\n` +
          `Would you like me to help you schedule an appointment with a primary care doctor or specialist?`;

        suggestedPrompts.push(
          'Find a primary care physician',
          'Check doctor availability',
          'Summarize my symptom assessment'
        );
      }
    }

    // 4. Persist the assistant's response in conversation history
    await conversationService.appendMessage(conversation.id, 'ASSISTANT', reply, {
      urgency,
      assessment,
      actionsExecuted,
    });

    return {
      sessionId,
      reply,
      urgency,
      assessment,
      actionsExecuted: actionsExecuted.length > 0 ? actionsExecuted : undefined,
      suggestedPrompts,
      disclaimer: CLINICAL_DISCLAIMER,
    };
  }
}

export const agentService = new AgentService();
