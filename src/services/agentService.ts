import { TriageUrgency } from './mockData';

export interface TriageResult {
  urgency: TriageUrgency;
  confidenceScore: number;
  primaryDepartment: string;
  recommendedDoctorName: string;
  recommendedDoctorId: string;
  suggestedDurationMinutes: number;
  clinicalSummary: string;
  recommendedPreTests: string[];
  redFlagAlerts: string[];
  suggestedSoapNote: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
}

export interface DrugSafetyCheck {
  hasConflict: boolean;
  warnings: string[];
  suggestedAlternatives?: string[];
}

export class AgentService {
  /**
   * Evaluates patient intake, symptoms, age, and existing conditions to calculate
   * triage urgency, matching department, and clinical recommendations.
   */
  public evaluateSymptoms(
    symptomsText: string,
    patientName: string,
    age?: number,
    knownAllergies: string[] = []
  ): TriageResult {
    const textLower = symptomsText.toLowerCase();

    // Check emergency red flags
    const redFlags: string[] = [];
    let urgency: TriageUrgency = 'Standard (Level 3)';
    let department = 'Primary Care';
    let doctorName = 'Dr. Marcus Vance';
    let doctorId = 'doc-2';
    let duration = 30;
    const preTests: string[] = [];

    // Red flag detection
    if (
      textLower.includes('chest pain') ||
      textLower.includes('chest pressure') ||
      textLower.includes('radiating to arm') ||
      textLower.includes('difficulty breathing') ||
      textLower.includes('cyanosis') ||
      textLower.includes('sudden numbness') ||
      textLower.includes('speech slurred')
    ) {
      urgency = 'Emergency (Level 1)';
      department = 'Cardiovascular Care';
      doctorName = 'Dr. Sarah Mitchell';
      doctorId = 'doc-1';
      duration = 45;
      redFlags.push('Potential acute coronary syndrome or critical cardiopulmonary compromise');
      preTests.push('Immediate 12-Lead ECG', 'Stat Troponin I & T', 'Continuous Pulse Oximetry');
    } else if (
      textLower.includes('heart') ||
      textLower.includes('palpitation') ||
      textLower.includes('blood pressure') ||
      textLower.includes('hypertension') ||
      textLower.includes('arrhythmia')
    ) {
      urgency = 'Urgent (Level 2)';
      department = 'Cardiovascular Care';
      doctorName = 'Dr. Sarah Mitchell';
      doctorId = 'doc-1';
      duration = 40;
      preTests.push('Baseline 12-Lead ECG', 'Lipid Panel', 'Basic Metabolic Panel');
    } else if (
      (age !== undefined && age < 16) ||
      textLower.includes('child') ||
      textLower.includes('ear tugging') ||
      textLower.includes('pediatric') ||
      textLower.includes('croup')
    ) {
      urgency = textLower.includes('high fever') || textLower.includes('lethargic') ? 'Urgent (Level 2)' : 'Standard (Level 3)';
      department = 'Pediatric Center';
      doctorName = 'Dr. Elena Rostova';
      doctorId = 'doc-3';
      duration = 30;
      preTests.push('Tympanic Temperature Log', 'Rapid Strep Antigen Test', 'Otoscopic Exam');
    } else if (
      textLower.includes('bone') ||
      textLower.includes('fracture') ||
      textLower.includes('knee') ||
      textLower.includes('ankle') ||
      textLower.includes('sprain') ||
      textLower.includes('joint') ||
      textLower.includes('ortho')
    ) {
      urgency = textLower.includes('deformity') || textLower.includes('cannot bear weight') ? 'Urgent (Level 2)' : 'Standard (Level 3)';
      department = 'Musculoskeletal Care';
      doctorName = 'Dr. Julian Chen';
      doctorId = 'doc-4';
      duration = 35;
      preTests.push('Weight-Bearing X-Ray Series', 'Range-of-Motion Goniometry');
    } else if (
      textLower.includes('headache') ||
      textLower.includes('migraine') ||
      textLower.includes('seizure') ||
      textLower.includes('tremor') ||
      textLower.includes('aura') ||
      textLower.includes('dizziness')
    ) {
      urgency = 'Standard (Level 3)';
      department = 'Neurosciences';
      doctorName = 'Dr. Amara Patel';
      doctorId = 'doc-5';
      duration = 40;
      preTests.push('Cranial Nerve Screening', 'Visual Field Examination');
    } else if (
      textLower.includes('checkup') ||
      textLower.includes('annual') ||
      textLower.includes('refill') ||
      textLower.includes('vaccine') ||
      textLower.includes('wellness')
    ) {
      urgency = 'Routine (Level 4)';
      department = 'Primary Care';
      doctorName = 'Dr. Marcus Vance';
      doctorId = 'doc-2';
      duration = 20;
      preTests.push('Routine Vitals Station', 'Preventative Screen Questionnaire');
    } else {
      // General primary care intake
      urgency = textLower.includes('fever') || textLower.includes('vomiting') ? 'Urgent (Level 2)' : 'Standard (Level 3)';
      department = 'Primary Care';
      doctorName = 'Dr. Marcus Vance';
      doctorId = 'doc-2';
      duration = 30;
      preTests.push('Standard Vitals Check', 'Blood Glucose Fingerstick');
    }

    // Allergy check against suggested pre-tests or medication context
    if (knownAllergies.length > 0) {
      knownAllergies.forEach(allergy => {
        if (allergy.toLowerCase().includes('penicillin') && textLower.includes('infection')) {
          redFlags.push(`Critical: Patient has verified ${allergy} allergy. Exclude Beta-lactam antibiotics from plan.`);
        }
        if (allergy.toLowerCase().includes('iodine') && (department === 'Cardiovascular Care' || department === 'Musculoskeletal Care')) {
          redFlags.push(`Caution: Patient has ${allergy} allergy. Use non-ionic or non-contrast imaging.`);
        }
      });
    }

    const clinicalSummary = `Patient ${patientName || 'Intake'} presents with primary complaints: "${symptomsText}". Classified under ${department} pathway with ${urgency} triage score. Recommend expedited evaluation by ${doctorName}.`;

    return {
      urgency,
      confidenceScore: 94.8,
      primaryDepartment: department,
      recommendedDoctorName: doctorName,
      recommendedDoctorId: doctorId,
      suggestedDurationMinutes: duration,
      clinicalSummary,
      recommendedPreTests: preTests,
      redFlagAlerts: redFlags,
      suggestedSoapNote: {
        subjective: `Patient reports: "${symptomsText}". Denies history of acute traumatic impact unless noted.`,
        objective: `Pending clinician evaluation. Pre-consultation orders initiated: ${preTests.join(', ') || 'Standard vitals'}.`,
        assessment: `Clinical presentation suggestive of acute symptomatic presentation under ${department}. Urgency level: ${urgency}.`,
        plan: `1. Direct consult with ${doctorName}.\n2. Complete pre-tests (${preTests.join(', ')}).\n3. Re-evaluate post-vitals acquisition.`
      }
    };
  }

  /**
   * Quick drug safety interaction simulator
   */
  public checkDrugInteraction(medication: string, patientAllergies: string[]): DrugSafetyCheck {
    const medLower = medication.toLowerCase();
    const warnings: string[] = [];
    let hasConflict = false;

    for (const allergy of patientAllergies) {
      const aLower = allergy.toLowerCase();
      if (
        (aLower.includes('penicillin') && (medLower.includes('amoxicillin') || medLower.includes('ampicillin') || medLower.includes('augmentin'))) ||
        (aLower.includes('sulfa') && (medLower.includes('bactrim') || medLower.includes('sulfamethoxazole'))) ||
        (aLower.includes('aspirin') && (medLower.includes('nsaid') || medLower.includes('ibuprofen') || medLower.includes('naproxen')))
      ) {
        hasConflict = true;
        warnings.push(`Severe Contraindication: "${medication}" cross-reacts with documented patient allergy to "${allergy}".`);
      }
    }

    return {
      hasConflict,
      warnings,
      suggestedAlternatives: hasConflict ? ['Azithromycin', 'Clindamycin', 'Acetaminophen'] : []
    };
  }
}

export const agentService = new AgentService();
