import { Patient } from './mockData';

export interface StructuredConsultationResponse {
  patientId: string;
  patientName: string;
  consultationId: string;
  timestamp: string;
  symptomSummary: string;
  relevantMedicalHistory: {
    contributingConditions: string[];
    medicationConsiderations: string[];
    allergyAlerts: string[];
  };
  possibleExplanations: {
    hypothesis: string;
    likelihood: 'Primary Consideration' | 'Secondary Consideration' | 'Rule-Out Consideration';
    rationale: string;
  }[];
  suggestedFollowUpQuestions: string[];
  recommendedNextSteps: {
    diagnosticOrders: string[];
    bedsideExams: string[];
    monitoringOrReferral: string;
  };
  disclaimer: string;
}

export class ConsultationService {
  /**
   * Generates a structured clinical consultation analysis combining patient EHR and presenting symptoms.
   * Note: strictly formatted as clinical decision support, NOT a confirmed diagnosis.
   */
  public generateConsultationAnalysis(
    patient: Patient,
    symptomsText: string,
    vitalsOverride?: { bp?: string; hr?: string; spo2?: string; temp?: string }
  ): StructuredConsultationResponse {
    const textLower = symptomsText.toLowerCase();
    const now = new Date();
    const timeFormatted = `${now.getHours() % 12 || 12}:${now.getMinutes().toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

    // 1. Analyze symptoms summary
    const symptomSummary = `Patient ${patient.name} (${patient.age}y ${patient.gender}) presents with current complaints: "${symptomsText}". Vitals at intake: ${
      vitalsOverride?.bp || patient.recentVitals.bloodPressure
    } mmHg, pulse ${vitalsOverride?.hr || patient.recentVitals.heartRate} bpm, SpO₂ ${
      vitalsOverride?.spo2 || patient.recentVitals.oxygenSaturation
    }%, body temp ${vitalsOverride?.temp || patient.recentVitals.temperature}°F.`;

    // 2. Identify relevant medical history intersection
    const contributingConditions: string[] = [];
    const medicationConsiderations: string[] = [];
    const allergyAlerts: string[] = [];

    // Check chronic conditions
    if (patient.chronicConditions && patient.chronicConditions.length > 0) {
      patient.chronicConditions.forEach(cond => {
        const cLower = cond.toLowerCase();
        if (cLower.includes('hypertension') || cLower.includes('coronary') || cLower.includes('heart')) {
          contributingConditions.push(`Known ${cond}: heightened cardiovascular risk profile.`);
        } else if (cLower.includes('diabetes')) {
          contributingConditions.push(`Documented ${cond}: potential for atypical or silent ischemic presentation and glycemic fluctuations.`);
        } else if (cLower.includes('asthma')) {
          contributingConditions.push(`History of ${cond}: airway hyperreactivity must be distinguished from cardiac dyspnea.`);
        } else if (cLower.includes('migraine')) {
          contributingConditions.push(`Chronic ${cond}: neurological baseline for headache frequency and aura characteristics.`);
        } else {
          contributingConditions.push(`Documented baseline: ${cond}.`);
        }
      });
    } else {
      contributingConditions.push('No significant prior chronic illness documented in record.');
    }

    // Check medications
    if (patient.currentMedications && patient.currentMedications.length > 0) {
      patient.currentMedications.forEach(med => {
        medicationConsiderations.push(`Active: ${med} — monitor for compliance, dosage adequacy, and potential side-effect overlap.`);
      });
    } else {
      medicationConsiderations.push('Patient not currently taking regular prescription medications.');
    }

    // Check allergies
    if (patient.allergies && patient.allergies.length > 0 && !patient.allergies[0].includes('No known')) {
      patient.allergies.forEach(all => {
        allergyAlerts.push(`Documented allergy to ${all} — contraindicates related pharmacotherapy.`);
      });
    } else {
      allergyAlerts.push('No known drug allergies (NKDA) reported.');
    }

    // 3. Formulate possible explanations (clinical differentials)
    const possibleExplanations: StructuredConsultationResponse['possibleExplanations'] = [];
    const followUpQuestions: string[] = [];
    const diagnosticOrders: string[] = [];
    const bedsideExams: string[] = [];
    let monitoring = 'Standard outpatient observation following physician evaluation.';

    if (textLower.includes('chest') || textLower.includes('pressure') || textLower.includes('angina') || textLower.includes('shortness of breath')) {
      possibleExplanations.push(
        {
          hypothesis: 'Acute Coronary Syndrome (ACS) / Unstable Angina',
          likelihood: 'Primary Consideration',
          rationale: 'Patient age, cardiovascular history, and exertional chest pressure warrant highest index of suspicion for myocardial ischemia.'
        },
        {
          hypothesis: 'Gastroesophageal Reflux or Esophageal Spasm',
          likelihood: 'Secondary Consideration',
          rationale: 'Retrosternal discomfort can mimic cardiac pain; consider relationship to meals or recumbency.'
        },
        {
          hypothesis: 'Musculoskeletal Costochondritis / Chest Wall Strain',
          likelihood: 'Rule-Out Consideration',
          rationale: 'Localized tenderness upon sternocostal palpation can produce reproducible chest pain.'
        }
      );

      followUpQuestions.push(
        'Does the chest tightness radiate anywhere (e.g. neck, jaw, left shoulder, or back)?',
        'Did the onset coincide with physical exertion or emotional stress, and does rest provide relief?',
        'Are you experiencing diaphoresis (cold sweats), lightheadedness, or nausea right now?',
        'Have you taken any sublingual nitroglycerin or antacids, and did they change the pain intensity?'
      );

      diagnosticOrders.push(
        'Immediate 12-Lead Electrocardiogram (ECG) within 10 minutes',
        'Serial High-Sensitivity Troponin I & T at 0h and 2h',
        'Basic Metabolic Panel (BMP) and CBC',
        'Portable Chest Radiograph (CXR)'
      );

      bedsideExams.push(
        'Cardiac auscultation for new murmurs, gallops (S3/S4), or friction rubs',
        'Bilateral pulmonary auscultation for rales or basilar crackles',
        'Palpation of anterior chest wall for localized reproducible tenderness',
        'Bilateral upper extremity blood pressure comparison'
      );

      monitoring = 'Continuous telemetry cardiac monitoring and stat cardiology consult (Dr. Sarah Mitchell, Suite 204).';

    } else if (textLower.includes('fever') || textLower.includes('ear') || textLower.includes('throat') || textLower.includes('cough') || patient.age < 16) {
      possibleExplanations.push(
        {
          hypothesis: 'Acute Otitis Media (AOM) or Upper Respiratory Infection',
          likelihood: 'Primary Consideration',
          rationale: 'Fever accompanied by ear tugging/otalgia and upper airway erythema is classic for tympanic membrane inflammation.'
        },
        {
          hypothesis: 'Streptococcal Pharyngotonsillitis',
          likelihood: 'Secondary Consideration',
          rationale: 'Pharyngeal erythema with cervical lymphadenopathy and fever requires rapid antigen exclusion.'
        },
        {
          hypothesis: 'Viral Exanthem or Prodromal Illness',
          likelihood: 'Rule-Out Consideration',
          rationale: 'Pediatric low-grade pyrexia with decreased appetite often represents an acute viral infection.'
        }
      );

      followUpQuestions.push(
        'How many days has the fever persisted, and what was the highest temperature measured at home?',
        'Has there been any fluid or purulent discharge noted from the ears?',
        'Is the patient tolerating oral liquids, and when was their last wet diaper/urination?',
        'Have there been any rashes, vomiting, or neck stiffness noted by caregivers?'
      );

      diagnosticOrders.push(
        'Rapid Strep Antigen Swab (RADT)',
        'Tympanometry if middle ear effusion is suspected',
        'Oral temperature curve re-check post antipyretic'
      );

      bedsideExams.push(
        'Pneumatic otoscopic inspection of bilateral tympanic membranes (erythema, bulging, landmarks)',
        'Oropharynx inspection for tonsillar exudate, palatal petechiae, or posterior cobblestoning',
        'Anterior and posterior cervical lymph node palpation',
        'Neck flexion test to rule out nuchal rigidity'
      );

      monitoring = 'Pediatric evaluation (Dr. Elena Rostova, Suite 115). Advise parents on antipyretic dosing and hydration.';

    } else if (textLower.includes('headache') || textLower.includes('migraine') || textLower.includes('dizziness') || textLower.includes('aura')) {
      possibleExplanations.push(
        {
          hypothesis: 'Migraine with Typical Aura',
          likelihood: 'Primary Consideration',
          rationale: 'Hemicranial throbbing headache preceded or accompanied by visual disturbances and photophobia aligns with documented migraine diathesis.'
        },
        {
          hypothesis: 'Orthostatic Hypotension or Glycemic Disruption',
          likelihood: 'Secondary Consideration',
          rationale: 'Lightheadedness upon standing, particularly in patients on antihypertensive/diabetic medications, points toward postural blood pressure drops.'
        },
        {
          hypothesis: 'Acute Secondary Cephalea (Thunderclap or Vascular Etiology)',
          likelihood: 'Rule-Out Consideration',
          rationale: 'Must exclude sudden-onset neurological emergencies if accompanied by focal deficits.'
        }
      );

      followUpQuestions.push(
        'Did the headache reach peak intensity instantaneously (within seconds), or build gradually?',
        'Do you have any visual changes (scintillating scotoma, zig-zag lines), numbness, or tingling in the face or hands?',
        'Does bright light or loud sound significantly worsen the discomfort?',
        'When did you last eat and drink water today, and have you checked your blood sugar?'
      );

      diagnosticOrders.push(
        'Fingerstick blood glucose measurement',
        'Orthostatic vital signs (BP and HR supine, sitting, and standing at 1 and 3 minutes)',
        'Comprehensive Neurological Cranial Nerve Examination'
      );

      bedsideExams.push(
        'Cranial nerve testing (II-XII) with visual acuity and confrontation visual fields',
        'Fundoscopic evaluation to confirm absence of papilledema',
        'Pronator drift and Romberg gait equilibrium testing',
        'Temporal artery palpation for tenderness or induration'
      );

      monitoring = 'Neurology consult (Dr. Amara Patel, Suite 405). Quiet dim room while awaiting evaluation.';

    } else {
      // General Clinical Outpatient Intake
      possibleExplanations.push(
        {
          hypothesis: 'Acute Symptomatic Presentation - Primary Care Assessment',
          likelihood: 'Primary Consideration',
          rationale: 'Presentation requires structured physical examination and baseline lab correlation.'
        },
        {
          hypothesis: 'Medication Adverse Effect or Dosage Mismatch',
          likelihood: 'Secondary Consideration',
          rationale: 'Consider current pharmacological regimen and recent adherence changes.'
        },
        {
          hypothesis: 'Benign Self-Limiting Ambulatory Illness',
          likelihood: 'Rule-Out Consideration',
          rationale: 'Absence of immediate systemic red flags permits systematic ambulatory evaluation.'
        }
      );

      followUpQuestions.push(
        'When did you first notice these symptoms, and have they been constant or intermittent?',
        'Have you taken any over-the-counter medications, and did they provide any symptom relief?',
        'Have you noticed any unintentional weight changes, fevers, chills, or night sweats recently?',
        'Are there any specific activities or foods that trigger or relieve your discomfort?'
      );

      diagnosticOrders.push(
        'Complete Blood Count (CBC) with differential',
        'Comprehensive Metabolic Panel (CMP)',
        'Urinalysis dipstick and microscopy'
      );

      bedsideExams.push(
        'Comprehensive 4-limb vitals and cardiovascular examination',
        'Abdominal palpation for organomegaly, masses, or rebound tenderness',
        'Inspection of mucous membranes for hydration status'
      );

      monitoring = 'Attending Physician Evaluation (Dr. Marcus Vance, Room 102). Routine outpatient monitoring.';
    }

    return {
      patientId: patient.id,
      patientName: patient.name,
      consultationId: `CONS-${Date.now().toString().slice(-5)}`,
      timestamp: timeFormatted,
      symptomSummary,
      relevantMedicalHistory: {
        contributingConditions,
        medicationConsiderations,
        allergyAlerts
      },
      possibleExplanations,
      suggestedFollowUpQuestions: followUpQuestions,
      recommendedNextSteps: {
        diagnosticOrders,
        bedsideExams,
        monitoringOrReferral: monitoring
      },
      disclaimer: 'Clinical Decision Support Aid · This evaluation is an algorithmic assistive tool and does NOT constitute a confirmed medical diagnosis. All findings, differentials, and recommendations must be clinically verified by the licensed healthcare provider.'
    };
  }
}

export const consultationService = new ConsultationService();
