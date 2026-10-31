import React, { useState } from 'react';
import { 
  UserPlus, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw, 
  ShieldAlert, 
  Heart,
  Pill,
  FileText,
  Activity,
  Calendar,
  Phone,
  Mail,
  User
} from 'lucide-react';
import { Patient } from '../../services/mockData';

interface FormErrors {
  patientId?: string;
  name?: string;
  age?: string;
  gender?: string;
  phone?: string;
  email?: string;
  medicalHistory?: string;
  currentMedications?: string;
  allergies?: string;
  currentSymptoms?: string;
}

interface PatientRegistrationFormProps {
  onPatientRegistered: (patient: Patient) => void;
  onCancel?: () => void;
}

export const PatientRegistrationForm: React.FC<PatientRegistrationFormProps> = ({
  onPatientRegistered,
  onCancel
}) => {
  // Generate random default ID
  const generateNewId = () => `PAT-${Math.floor(1000 + Math.random() * 9000)}`;

  const [formData, setFormData] = useState({
    patientId: generateNewId(),
    name: '',
    age: '',
    gender: 'Female' as Patient['gender'],
    phone: '',
    email: '',
    medicalHistory: '',
    currentMedications: '',
    allergies: '',
    currentSymptoms: '',
    bloodType: 'O+'
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Full legal name is required.';
        if (value.trim().length < 2) return 'Name must be at least 2 characters.';
        return undefined;

      case 'age':
        if (!value) return 'Age is required.';
        const numAge = Number(value);
        if (isNaN(numAge) || numAge < 0 || numAge > 125) {
          return 'Age must be a valid number between 0 and 125.';
        }
        return undefined;

      case 'gender':
        if (!value) return 'Please select a gender.';
        return undefined;

      case 'phone':
        if (!value.trim()) return 'Contact number is required.';
        // Basic phone format check: at least 7 digits
        const digits = value.replace(/\D/g, '');
        if (digits.length < 7) {
          return 'Contact number must contain at least 7 digits.';
        }
        return undefined;

      case 'email':
        if (!value.trim()) return 'Email address is required.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) {
          return 'Please enter a valid email address (e.g. name@example.com).';
        }
        return undefined;

      case 'currentSymptoms':
        if (!value.trim()) return 'Please describe current symptoms or chief complaint.';
        if (value.trim().length < 4) return 'Symptom description must be at least 4 characters.';
        return undefined;

      default:
        return undefined;
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const errorMsg = validateField(fieldName, formData[fieldName as keyof typeof formData] as string);
    setErrors(prev => ({ ...prev, [fieldName]: errorMsg }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const errorMsg = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: errorMsg }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all required fields as touched
    const requiredFields = ['name', 'age', 'gender', 'phone', 'email', 'currentSymptoms'];
    const newTouched: Record<string, boolean> = {};
    const newErrors: FormErrors = {};
    let isValid = true;

    requiredFields.forEach(field => {
      newTouched[field] = true;
      const errorMsg = validateField(field, formData[field as keyof typeof formData] as string);
      if (errorMsg) {
        newErrors[field as keyof FormErrors] = errorMsg;
        isValid = false;
      }
    });

    setTouched(newTouched);
    setErrors(newErrors);

    if (!isValid) {
      // Scroll to top of form or first error
      return;
    }

    // Process medical history, medications, allergies into arrays
    const chronicConditions = formData.medicalHistory
      ? formData.medicalHistory.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const currentMedications = formData.currentMedications
      ? formData.currentMedications.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const allergies = formData.allergies
      ? formData.allergies.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const registeredPatient: Patient = {
      id: formData.patientId.trim().toUpperCase(),
      name: formData.name.trim(),
      age: Number(formData.age),
      gender: formData.gender,
      dob: `${2026 - Number(formData.age)}-01-01`,
      bloodType: formData.bloodType,
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: 'Outpatient Clinic Intake',
      allergies: allergies.length > 0 ? allergies : ['No known drug allergies (NKDA)'],
      chronicConditions,
      currentMedications,
      medicalHistory: formData.medicalHistory.trim(),
      currentSymptoms: formData.currentSymptoms.trim(),
      recentVitals: {
        bloodPressure: '120/80',
        heartRate: 72,
        respiratoryRate: 16,
        temperature: 98.6,
        oxygenSaturation: 98,
        recordedAt: 'Just now'
      },
      insuranceProvider: 'Verified Ambulatory Coverage',
      emergencyContact: {
        name: 'Family Contact',
        relationship: 'Emergency Contact',
        phone: formData.phone.trim()
      },
      lastVisit: 'Today (Intake)'
    };

    onPatientRegistered(registeredPatient);
  };

  const handleReset = () => {
    setFormData({
      patientId: generateNewId(),
      name: '',
      age: '',
      gender: 'Female',
      phone: '',
      email: '',
      medicalHistory: '',
      currentMedications: '',
      allergies: '',
      currentSymptoms: '',
      bloodType: 'O+'
    });
    setErrors({});
    setTouched({});
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 shadow-xs">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Patient Registration & Clinical Intake
            </h2>
            <p className="text-xs text-slate-500">
              Complete demographic profile, medical background, and presenting symptoms.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Reset form fields"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Row 1: Patient ID, Full Name, Age, Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          {/* Patient ID */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Patient ID <span className="text-teal-600">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Unique medical record identifier</p>
          </div>

          {/* Full Name */}
          <div className="sm:col-span-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Full Legal Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={() => handleBlur('name')}
              placeholder="e.g. Jonathan R. Miller"
              className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all ${
                touched.name && errors.name
                  ? 'border-rose-300 ring-2 ring-rose-500/10 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'
              }`}
            />
            {touched.name && errors.name && (
              <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Age */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Age <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="age"
              min="0"
              max="125"
              value={formData.age}
              onChange={handleChange}
              onBlur={() => handleBlur('age')}
              placeholder="e.g. 46"
              className={`w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all ${
                touched.age && errors.age
                  ? 'border-rose-300 ring-2 ring-rose-500/10 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'
              }`}
            />
            {touched.age && errors.age && (
              <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.age}</span>
              </p>
            )}
          </div>

          {/* Gender */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Gender <span className="text-rose-500">*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              onBlur={() => handleBlur('gender')}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Row 2: Contact Number & Email Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Contact Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Contact Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={() => handleBlur('phone')}
                placeholder="+1 (555) 000-0000"
                className={`w-full bg-slate-50 border rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all ${
                  touched.phone && errors.phone
                    ? 'border-rose-300 ring-2 ring-rose-500/10 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'
                }`}
              />
            </div>
            {touched.phone && errors.phone && (
              <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.phone}</span>
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                placeholder="patient@example.com"
                className={`w-full bg-slate-50 border rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all ${
                  touched.email && errors.email
                    ? 'border-rose-300 ring-2 ring-rose-500/10 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'
                }`}
              />
            </div>
            {touched.email && errors.email && (
              <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>
        </div>

        {/* Row 3: Current Symptoms (Chief Complaint) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Current Symptoms & Chief Complaint <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            name="currentSymptoms"
            value={formData.currentSymptoms}
            onChange={handleChange}
            onBlur={() => handleBlur('currentSymptoms')}
            placeholder="Describe presenting symptoms, onset duration, and severity (e.g. Acute substernal chest pressure for 2 hours, shortness of breath on exertion)..."
            className={`w-full bg-slate-50 border rounded-xl p-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all leading-relaxed ${
              touched.currentSymptoms && errors.currentSymptoms
                ? 'border-rose-300 ring-2 ring-rose-500/10 focus:border-rose-500'
                : 'border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'
            }`}
          />
          {touched.currentSymptoms && errors.currentSymptoms && (
            <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errors.currentSymptoms}</span>
            </p>
          )}
        </div>

        {/* Row 4: Medical History, Medications, Allergies */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Medical History */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span>Medical History</span>
            </label>
            <textarea
              rows={3}
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              placeholder="e.g. Essential Hypertension, Type 2 Diabetes, Coronary Artery Disease, prior appendectomy..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 leading-relaxed"
            />
            <p className="text-[10px] text-slate-400 mt-1">Comma-separated conditions or past diagnoses</p>
          </div>

          {/* Current Medications */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-teal-600" />
              <span>Current Medications</span>
            </label>
            <textarea
              rows={3}
              name="currentMedications"
              value={formData.currentMedications}
              onChange={handleChange}
              placeholder="e.g. Lisinopril 10mg daily, Metformin 500mg BID, Atorvastatin 20mg..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 leading-relaxed"
            />
            <p className="text-[10px] text-slate-400 mt-1">Dosage, frequency, & active prescriptions</p>
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              <span>Allergies</span>
            </label>
            <textarea
              rows={3}
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              placeholder="e.g. Penicillin (anaphylaxis), Sulfa drugs, Aspirin, Iodine contrast dye..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 leading-relaxed"
            />
            <p className="text-[10px] text-slate-400 mt-1">Specify drug or environmental allergies</p>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            <span className="text-rose-500">*</span> Required clinical intake fields
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-all active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Patient Record</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
