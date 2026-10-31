import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  Sparkles, 
  AlertCircle,
  CheckCircle2,
  HeartPulse
} from 'lucide-react';
import { authService } from '../../services/authService';
import { INITIAL_PATIENTS, INITIAL_DOCTORS } from '../../services/mockData';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>('patient');

  // Patient form
  const [patientIdentifier, setPatientIdentifier] = useState('eleanor.sterling@example.com');
  // Doctor form
  const [doctorEmail, setDoctorEmail] = useState('vance@clinic.org');

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePatientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!patientIdentifier.trim()) {
      setErrorMsg('Please enter your registered phone number or email address.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = authService.loginAsPatient(patientIdentifier);
      setIsLoading(false);
      if (res.success) {
        navigate('/patient/dashboard');
      } else {
        setErrorMsg(res.message || 'Login failed. Please check your credentials.');
      }
    }, 400);
  };

  const handleDoctorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!doctorEmail.trim()) {
      setErrorMsg('Please enter your clinic physician email.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = authService.loginAsDoctor(doctorEmail);
      setIsLoading(false);
      if (res.success) {
        navigate('/doctor/dashboard');
      } else {
        setErrorMsg(res.message || 'Login failed. Please check your email.');
      }
    }, 400);
  };

  const selectPatientPreset = (emailOrPhone: string) => {
    setPatientIdentifier(emailOrPhone);
    setErrorMsg('');
  };

  const selectDoctorPreset = (email: string) => {
    setDoctorEmail(email);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Clinic Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-md mb-3">
          <HeartPulse className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Clinic AI Agent
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Intelligent Clinical Triage & Healthcare Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
          {/* Tab Selector */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('patient');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-all ${
                activeTab === 'patient'
                  ? 'bg-white text-teal-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Patient Portal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('doctor');
                setErrorMsg('');
              }}
              className={`flex-1 py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-all ${
                activeTab === 'doctor'
                  ? 'bg-white text-teal-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Doctor Portal</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* PATIENT LOGIN FORM */}
          {activeTab === 'patient' ? (
            <form onSubmit={handlePatientLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number or Email Address
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={patientIdentifier}
                    onChange={(e) => setPatientIdentifier(e.target.value)}
                    placeholder="e.g. (555) 782-9901 or name@example.com"
                    className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500 text-slate-800"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Patients can sign in with either their registered mobile phone number or email.
                </p>
              </div>

              {/* Demo Patient Fast Selection */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Quick Demo Patient Accounts:
                </span>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => selectPatientPreset('eleanor.sterling@example.com')}
                    className={`w-full text-left p-2 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                      patientIdentifier === 'eleanor.sterling@example.com'
                        ? 'border-teal-500 bg-teal-50/60 text-teal-900 font-medium'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>Eleanor Sterling (58F • Hypertension/Diabetes)</span>
                    <span className="text-[10px] text-slate-400">ID: pat-1</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectPatientPreset('maya.rodriguez@example.com')}
                    className={`w-full text-left p-2 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                      patientIdentifier === 'maya.rodriguez@example.com'
                        ? 'border-teal-500 bg-teal-50/60 text-teal-900 font-medium'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>Maya Lin Rodriguez (29F • Migraine with aura)</span>
                    <span className="text-[10px] text-slate-400">ID: pat-3</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectPatientPreset('+1 (555) 431-8822')}
                    className={`w-full text-left p-2 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                      patientIdentifier === '+1 (555) 431-8822'
                        ? 'border-teal-500 bg-teal-50/60 text-teal-900 font-medium'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>David K. Morrison ((555) 431-8822 • Asthma)</span>
                    <span className="text-[10px] text-slate-400">Phone Login</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-white font-medium text-sm bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-sm transition-all disabled:opacity-50"
                >
                  <span>{isLoading ? 'Verifying Account...' : 'Sign In as Patient'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* DOCTOR LOGIN FORM */
            <form onSubmit={handleDoctorLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Physician Clinic Email
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={doctorEmail}
                    onChange={(e) => setDoctorEmail(e.target.value)}
                    placeholder="e.g. vance@clinic.org"
                    className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500 text-slate-800"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Doctors sign in with their authenticated clinic hospital email.
                </p>
              </div>

              {/* Demo Doctor Fast Selection */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Select Clinic Physician Profile:
                </span>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => selectDoctorPreset('vance@clinic.org')}
                    className={`w-full text-left p-2 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                      doctorEmail === 'vance@clinic.org'
                        ? 'border-teal-500 bg-teal-50/60 text-teal-900 font-medium'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>Dr. Marcus Vance, MD</span>
                    <span className="text-[10px] text-teal-700 font-medium">Internal Medicine</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectDoctorPreset('mitchell@clinic.org')}
                    className={`w-full text-left p-2 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                      doctorEmail === 'mitchell@clinic.org'
                        ? 'border-teal-500 bg-teal-50/60 text-teal-900 font-medium'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>Dr. Sarah Mitchell, MD</span>
                    <span className="text-[10px] text-rose-700 font-medium">Cardiology</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectDoctorPreset('rostova@clinic.org')}
                    className={`w-full text-left p-2 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                      doctorEmail === 'rostova@clinic.org'
                        ? 'border-teal-500 bg-teal-50/60 text-teal-900 font-medium'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>Dr. Elena Rostova, MD</span>
                    <span className="text-[10px] text-purple-700 font-medium">Pediatrics</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-white font-medium text-sm bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 shadow-sm transition-all disabled:opacity-50"
                >
                  <span>{isLoading ? 'Authenticating Physician...' : 'Sign In to Doctor Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Safety Note */}
        <p className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Simulated clinic authentication with human-in-the-loop doctor approval.</span>
        </p>
      </div>
    </div>
  );
};
