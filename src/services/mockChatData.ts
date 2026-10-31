export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  structuredData?: {
    patientName?: string;
    urgency?: string;
    department?: string;
    recommendations?: string[];
    vitalsSummary?: string;
    redFlags?: string[];
  };
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  patientContext?: string;
  messages: ChatMessage[];
}

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Arthur Pendelton - CAD & Chest Tightness',
    lastMessage: 'Recommend immediate 12-lead ECG and bedside Troponin baseline...',
    timestamp: 'Today, 10:14 AM',
    patientContext: 'Arthur Pendelton (71y, Male)',
    messages: [
      {
        id: 'msg-1-1',
        sender: 'user',
        content: 'Review Arthur Pendelton’s symptoms: 71yo male presenting with substernal chest pressure radiating toward left shoulder, onset 45 min ago.',
        timestamp: '10:12 AM'
      },
      {
        id: 'msg-1-2',
        sender: 'assistant',
        content: `### Clinical Risk Assessment · Emergency Level 1

Based on patient history (Coronary Artery Disease, Hypertension) and current complaints, this presentation carries a high suspicion for **Acute Coronary Syndrome (ACS)**.

#### Immediate Action Protocol:
1. **Immediate 12-Lead ECG**: Acquire and review within 10 minutes of arrival.
2. **Stat Cardiac Biomarkers**: High-sensitivity Troponin I & T serial draw.
3. **Bedside Hemodynamics**: Continuous pulse oximetry, automated BP cycling, supplemental oxygen if SpO₂ < 90%.
4. **Physician Notification**: Fast-tracked to Dr. Sarah Mitchell (Suite 204).

⚠️ **Contraindication Notice**: Patient has documented allergy to **Aspirin** (bronchospasm) and **Iodine contrast dye**. Inquire regarding alternative antiplatelet agents (e.g., Clopidogrel) per attending cardiologist orders.`,
        timestamp: '10:13 AM',
        structuredData: {
          patientName: 'Arthur Pendelton',
          urgency: 'Emergency (Level 1)',
          department: 'Cardiovascular Care',
          recommendations: ['Immediate 12-lead ECG', 'Stat Troponin baseline', 'Clopidogrel protocol verification'],
          vitalsSummary: 'BP 142/90 mmHg · HR 66 bpm · SpO2 96%',
          redFlags: ['Substernal chest pressure', 'Documented CAD history', 'Aspirin allergy contraindication']
        }
      }
    ]
  },
  {
    id: 'conv-2',
    title: 'Eleanor Sterling - Diabetic Polypharmacy',
    lastMessage: 'Summary completed: Lisinopril & Metformin titration notes...',
    timestamp: 'Today, 09:30 AM',
    patientContext: 'Eleanor Sterling (58y, Female)',
    messages: [
      {
        id: 'msg-2-1',
        sender: 'user',
        content: 'Summarize a patient’s medical history for Eleanor Sterling.',
        timestamp: '09:28 AM'
      },
      {
        id: 'msg-2-2',
        sender: 'assistant',
        content: `### Comprehensive Patient Summary: Eleanor Sterling (58y, Female)

**Primary Diagnoses**: Type 2 Diabetes Mellitus, Essential Hypertension.  
**Allergies**: Penicillin (urticaria), Sulfa drugs.

#### 1. Current Active Prescriptions:
- **Lisinopril 10mg PO Daily** (Antihypertensive - ACE Inhibitor)
- **Metformin 500mg PO BID** (Oral Antidiabetic - Biguanide)

#### 2. Recent Vital Signs & Lab Parameters:
- **Blood Pressure**: 138/86 mmHg (Stage 1 Hypertension threshold)
- **Fasting Glucose**: 128 mg/dL
- **Heart Rate**: 74 bpm (Regular sinus rhythm)
- **Body Temp**: 98.4°F · SpO₂: 98% on room air

#### 3. Clinical Recommendations for Today's Visit:
- Order quarterly HbA1c to monitor glycemic control.
- Evaluate morning lightheadedness complaints for potential orthostatic blood pressure drops.
- Screen renal function panel (eGFR and serum creatinine) prior to any Lisinopril dosage increase.`,
        timestamp: '09:30 AM',
        structuredData: {
          patientName: 'Eleanor Sterling',
          urgency: 'Standard (Level 3)',
          department: 'Primary Care',
          recommendations: ['HbA1c order', 'Orthostatic vital check', 'BMP renal function'],
          vitalsSummary: 'BP 138/86 mmHg · HR 74 bpm · Glucose 128 mg/dL'
        }
      }
    ]
  },
  {
    id: 'conv-3',
    title: 'Zoe Chen - Pediatric Fever & Otitis',
    lastMessage: 'Rapid strep antigen test prepared, otoscopic guidelines...',
    timestamp: 'Yesterday',
    patientContext: 'Zoe Chen (8y, Female)',
    messages: [
      {
        id: 'msg-3-1',
        sender: 'user',
        content: 'Help me understand these symptoms: 8-year-old female presenting with 100.2°F fever, right ear tugging, and mild dysphagia.',
        timestamp: 'Yesterday, 04:15 PM'
      },
      {
        id: 'msg-3-2',
        sender: 'assistant',
        content: `### Symptom Assessment · Acute Otitis Media & Pharyngitis

**Age Group**: Pediatric (8 years old)  
**Urgency Classification**: Level 2 (Urgent Pediatric Intake)

#### Diagnostic Considerations:
- **Acute Otitis Media (AOM)**: Indicated by unilateral otalgia, ear tugging, and low-grade pyrexia.
- **Concurrent Viral or Streptococcal Pharyngitis**: Supported by complaints of mild sore throat and dysphagia.

#### Recommended Clinical Pathway:
1. Pneumatic otoscopy to inspect right tympanic membrane (erythema, bulging, or effusion).
2. Oropharyngeal examination with Rapid Antigen Detection Test (RADT) for Group A Streptococcus.
3. Review documented allergies: Patient has severe **Peanut and Tree Nut allergies** (no antibiotic cross-reactivity noted).`,
        timestamp: 'Yesterday, 04:16 PM'
      }
    ]
  }
];

export function getMockAIResponse(promptText: string): string {
  const textLower = promptText.toLowerCase();

  if (textLower.includes('summarize a patient') || textLower.includes('medical history') || textLower.includes('eleanor') || textLower.includes('history')) {
    return `### Patient Clinical Summary & History

**Patient**: Eleanor Sterling (Age: 58 · Female · DOB: 1968-04-12)  
**Assigned Physician**: Dr. Marcus Vance (Primary Care)

#### Diagnoses & Medical Conditions:
- **Type 2 Diabetes Mellitus**: Diagnosed 2018. Fasting blood sugar target range 110-140 mg/dL.
- **Essential Hypertension**: Diagnosed 2019. Monitored with home BP log.

#### Medication Profile:
- **Lisinopril 10mg Tablet**: 1 tablet orally once daily each morning.
- **Metformin 500mg Tablet**: 1 tablet orally twice daily with meals.

#### Critical Safety Flags:
- ❌ **Verified Allergies**: Penicillin, Sulfa drugs (Severe rash and hives).
- ⚠️ **Recent Vitals**: Blood Pressure 138/86 mmHg, Pulse 74 bpm, Glucose 128 mg/dL.

#### Suggested Next Steps:
1. Schedule routine comprehensive metabolic panel and HbA1c.
2. Review self-monitored blood glucose log for asymptomatic morning dips.`;
  }

  if (textLower.includes('understand these symptoms') || textLower.includes('symptom') || textLower.includes('chest') || textLower.includes('fever') || textLower.includes('headache')) {
    return `### Clinical Symptom Evaluation & Differential Pathway

**Reported Clinical Presentation**:
"${promptText}"

#### 1. Urgency & Triage Classification:
- **Severity Stratification**: Emergency Severity Index (ESI) **Level 2 - High Priority**.
- **Recommended Department**: Cardiopulmonary or Internal Medicine Consult.

#### 2. Key Differential Considerations:
- **Primary Hypothesis**: Acute cardiopulmonary or neuropathic strain requiring immediate objective verification.
- **Secondary Considerations**: Musculoskeletal chest wall tenderness, gastroesophageal reflux spasm, or acute exertion fatigue.

#### 3. Immediate Red Flags to Rule Out:
- Radiation of discomfort to neck, jaw, epigastrium, or left arm.
- Accompanying diaphoresis, dyspnea, nausea, or lightheadedness.
- Hemodynamic instability (Systolic BP < 90 or > 180 mmHg).

#### 4. Diagnostic Pre-Orders Recommended:
- Standard 12-Lead Electrocardiogram (ECG) within 10 minutes.
- Continuous SpO₂ pulse oximetry and automated vitals cycle.
- Serial Cardiac Enzymes (High-Sensitivity Troponin I).`;
  }

  if (textLower.includes('review a patient') || textLower.includes('clinical notes') || textLower.includes('soap') || textLower.includes('note')) {
    return `### Clinical SOAP Note Review & Verification

**Review Protocol**: Comprehensive Chart Audit  
**Status**: Ready for Clinician Attestation

#### **S (Subjective)**:
Patient presents for planned quarterly evaluation. Reports good compliance with prescribed regimen. Notes intermittent morning lightheadedness that resolves after drinking water and sitting down for 5 minutes. Denies syncopal episodes, chest pain, or visual changes.

#### **O (Objective)**:
- **BP**: 138/86 mmHg (seated, right arm)
- **HR**: 74 bpm, regular rhythm
- **RR**: 16 breaths/min, unlabored
- **SpO₂**: 98% room air
- **Temp**: 98.4°F
- **General**: Alert, oriented x3, well-nourished, in no acute distress.
- **Cardiovascular**: S1, S2 present, no murmurs, rubs, or gallops. Lungs clear to auscultation bilaterally.

#### **A (Assessment)**:
1. Type 2 Diabetes Mellitus without acute complications; fasting glucose slightly above strict target at 128 mg/dL.
2. Stage 1 Essential Hypertension with mild systolic elevation.
3. Possible mild orthostatic hypotension or dehydration contributing to morning lightheadedness.

#### **P (Plan)**:
1. Continue Lisinopril 10mg daily and Metformin 500mg twice daily.
2. Advise increased oral hydration upon waking.
3. Order baseline HbA1c and basic metabolic profile.
4. Return to clinic in 3 months or sooner if lightheadedness worsens.`;
  }

  if (textLower.includes('explain a medical report') || textLower.includes('report') || textLower.includes('lab') || textLower.includes('ecg') || textLower.includes('mri')) {
    return `### Medical Diagnostic Report Interpretation

**Report Under Review**: Diagnostic Laboratory & Electrocardiographic Panel

#### 1. Key Diagnostic Findings:
- **12-Lead Electrocardiogram (ECG)**: Normal sinus rhythm with heart rate of 72 bpm. PR interval 160ms, QRS duration 88ms, QTc 418ms. No acute ST-segment elevation or pathological Q waves. Trace T-wave flattening in lead III without reciprocal changes.
- **Complete Blood Count (CBC)**:
  - Hemoglobin: 14.2 g/dL (Normal: 12.0 - 16.0 g/dL)
  - White Blood Cells (WBC): 6.8 x 10³/µL (Normal: 4.5 - 11.0 x 10³/µL)
  - Platelets: 245 x 10³/µL (Normal: 150 - 450 x 10³/µL)
- **High-Sensitivity Troponin I**: < 0.01 ng/mL (Below 99th percentile cutoff; negative for acute myocardial necrosis).

#### 2. Clinical Significance:
- Biomarkers and electrical conduction metrics show no acute ischemic injury or cardiac necrosis.
- Findings are reassuring for an outpatient setting, supporting conservative management with routine scheduled follow-up.`;
  }

  // General clinical inquiry response
  return `### Clinical Assistant Analysis

Regarding your inquiry:
"${promptText}"

#### Clinical Summary:
- **Patient Context Verified**: Evaluated against clinical practice protocols and ambulatory outpatient guidelines.
- **Safety Screening**: No adverse drug-allergy interactions or critical physiological contraindications identified in current active parameters.

#### Suggested Actions:
1. Confirm patient baseline vitals at triage station (BP, Heart Rate, SpO₂, Temperature).
2. Cross-reference documented allergy records before initiating any new antibiotic or NSAID therapy.
3. If symptoms progress or acute red flags manifest, update triage urgency to Priority Level 1 or 2 for direct physician evaluation.`;
}
