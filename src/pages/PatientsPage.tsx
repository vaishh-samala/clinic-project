import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Plus, 
  UserPlus, 
  Filter, 
  CheckCircle2, 
  FileText, 
  AlertTriangle, 
  Calendar, 
  Phone, 
  Mail, 
  Activity, 
  ChevronRight,
  Sparkles,
  ArrowUpDown,
  X,
  Stethoscope,
  ArrowRight
} from 'lucide-react';
import { Patient } from '../services/mockData';
import { clinicService } from '../services/clinicService';
import { PatientRegistrationForm } from '../components/patients/PatientRegistrationForm';
import { PatientDetailsCard } from '../components/patients/PatientDetailsCard';

interface OutletContextType {
  patients: Patient[];
  onOpenBookingForPatient: (patient: Patient) => void;
  onOpenQuickTriage: () => void;
}

export const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { onOpenBookingForPatient, onOpenQuickTriage } = useOutletContext<OutletContextType>();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<'directory' | 'register'>('directory');
  const [isNewlyRegistered, setIsNewlyRegistered] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [genderFilter, setGenderFilter] = useState('All');
  const [ageFilter, setAgeFilter] = useState('All');
  const [conditionFilter, setConditionFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'age'>('recent');

  const targetPatientId = patientId || searchParams.get('selected');

  useEffect(() => {
    const refresh = () => {
      const currentList = clinicService.getPatients();
      setPatients(currentList);
      
      // Select patient based on URL params or default to first
      if (targetPatientId) {
        const found = currentList.find(p => p.id.toLowerCase() === targetPatientId.toLowerCase());
        if (found) {
          setSelectedPatient(found);
          setActiveTab('directory');
          return;
        }
      }

      if (!selectedPatient && currentList.length > 0) {
        setSelectedPatient(currentList[0]);
      }
    };

    refresh();
    const unsub = clinicService.subscribe(refresh);
    return () => unsub();
  }, [targetPatientId]);

  const handlePatientRegistered = (newPatient: Patient) => {
    // Add to clinic service store & update local state
    const saved = clinicService.addPatient(newPatient);
    setPatients(clinicService.getPatients());
    setSelectedPatient(saved);
    setIsNewlyRegistered(true);
    setActiveTab('directory');

    // Auto dismiss new badge after 6 seconds
    setTimeout(() => {
      setIsNewlyRegistered(false);
    }, 6000);
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsNewlyRegistered(false);
    setSearchParams({ selected: patient.id }, { replace: true });
  };

  // Filter & Search Logic
  const filteredPatients = patients.filter(p => {
    // Search query
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(searchLower) ||
      p.id.toLowerCase().includes(searchLower) ||
      p.phone.includes(searchLower) ||
      p.email.toLowerCase().includes(searchLower) ||
      (p.currentSymptoms && p.currentSymptoms.toLowerCase().includes(searchLower)) ||
      (p.chronicConditions && p.chronicConditions.some(c => c.toLowerCase().includes(searchLower))) ||
      (p.allergies && p.allergies.some(a => a.toLowerCase().includes(searchLower)));

    // Gender filter
    const matchesGender = genderFilter === 'All' || p.gender === genderFilter;

    // Age filter
    let matchesAge = true;
    if (ageFilter === 'pediatric') matchesAge = p.age < 18;
    else if (ageFilter === 'adult') matchesAge = p.age >= 18 && p.age < 65;
    else if (ageFilter === 'senior') matchesAge = p.age >= 65;

    // Condition filter
    let matchesCondition = true;
    if (conditionFilter === 'allergies') {
      matchesCondition = p.allergies.length > 0 && !p.allergies[0].includes('No known');
    } else if (conditionFilter === 'chronic') {
      matchesCondition = p.chronicConditions.length > 0;
    }

    return matchesSearch && matchesGender && matchesAge && matchesCondition;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'age') return a.age - b.age;
    return 0; // default recent
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Workflow Guidance Bar */}
      <div className="bg-white rounded-2xl px-4 py-2.5 border border-slate-200/80 shadow-2xs flex items-center justify-between text-xs text-slate-500 overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/" className="hover:text-teal-700 font-medium">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">Patient Records</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="font-semibold text-slate-700">Patient Details ({selectedPatient?.name || 'Selected'})</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link 
            to={selectedPatient ? `/ai-assistant?patient=${selectedPatient.id}&mode=consultation` : '/ai-assistant?mode=consultation'} 
            className="hover:text-teal-700 flex items-center gap-1 text-teal-700 font-semibold"
          >
            <span>AI Assistant</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-400">Consultation Results</span>
        </div>

        {selectedPatient && (
          <Link
            to={`/ai-assistant?patient=${selectedPatient.id}&mode=consultation`}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition-colors shadow-2xs"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Launch Consultation for {selectedPatient.name.split(' ')[0]}</span>
          </Link>
        )}
      </div>

      {/* Top Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Patient Records & EHR
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Electronic health profiles, patient intake registration, and clinical histories.
          </p>
        </div>

        {/* View Switch: Directory vs Register Form */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'directory'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span>Patient Directory ({patients.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('register')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'register'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Patient</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {activeTab === 'register' ? (
        <div className="max-w-4xl mx-auto">
          <PatientRegistrationForm
            onPatientRegistered={handlePatientRegistered}
            onCancel={() => setActiveTab('directory')}
          />
        </div>
      ) : (
        /* Patient Directory View (Split into List + Patient Details Card) */
        <div className="space-y-6">
          {/* Search Bar & Filter Controls */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search input */}
              <div className="relative flex-1 max-w-lg">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, Patient ID (e.g. PAT-101), symptoms, or condition..."
                  className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Summary Badge */}
              <div className="flex items-center gap-2 text-xs text-slate-500 self-end md:self-auto">
                <span className="font-mono tabular-nums font-bold text-slate-800">
                  {filteredPatients.length}
                </span>
                <span>patients matching filters</span>
              </div>
            </div>

            {/* Filter pills & sort row */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
              {/* Gender Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Gender:</span>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none"
                >
                  <option value="All">All Genders</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Age Group Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Age Group:</span>
                <select
                  value={ageFilter}
                  onChange={(e) => setAgeFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none"
                >
                  <option value="All">All Ages</option>
                  <option value="pediatric">Pediatric (&lt;18)</option>
                  <option value="adult">Adult (18-64)</option>
                  <option value="senior">Senior (65+)</option>
                </select>
              </div>

              {/* Conditions / Allergies Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Health Flags:</span>
                <select
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none"
                >
                  <option value="All">All Records</option>
                  <option value="allergies">With Drug Allergies</option>
                  <option value="chronic">With Chronic Conditions</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5 sm:ml-auto">
                <span className="text-slate-400 font-medium">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none"
                >
                  <option value="recent">Recent Intake</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="age">Age (Ascending)</option>
                </select>
              </div>

              {(genderFilter !== 'All' || ageFilter !== 'All' || conditionFilter !== 'All' || searchTerm) && (
                <button
                  onClick={() => {
                    setGenderFilter('All');
                    setAgeFilter('All');
                    setConditionFilter('All');
                    setSearchTerm('');
                  }}
                  className="text-teal-600 hover:text-teal-700 font-semibold"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Dual Column Layout: Left Patient List (5 cols) + Right Selected Patient Details Card (7 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Patient List (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Registered Patients ({filteredPatients.length})
                </h3>
                <span className="text-[11px] text-slate-400">Click to view details</span>
              </div>

              <div className="space-y-2.5 max-h-[820px] overflow-y-auto pr-1">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => {
                    const isSelected = selectedPatient?.id === patient.id;
                    return (
                      <div
                        key={patient.id}
                        onClick={() => handleSelectPatient(patient)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-teal-50/70 border-teal-300 ring-1 ring-teal-400 shadow-sm'
                            : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                              {patient.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-slate-900 truncate">
                                {patient.name}
                              </h4>
                              <p className="text-[11px] text-slate-500 truncate">
                                {patient.gender} · {patient.age}y · ID: <span className="font-mono font-semibold">{patient.id}</span>
                              </p>
                            </div>
                          </div>

                          <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                            isSelected ? 'text-teal-600 translate-x-0.5' : 'text-slate-300'
                          }`} />
                        </div>

                        {/* Symptoms or Condition preview */}
                        {patient.currentSymptoms && (
                          <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-amber-50/80 border border-amber-200/60 text-[11px] text-amber-900 line-clamp-1">
                            <span className="font-bold">Symptoms: </span>
                            {patient.currentSymptoms}
                          </div>
                        )}

                        {/* Allergies or Chronic tags */}
                        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-mono text-slate-500">{patient.phone}</span>
                          {patient.allergies.length > 0 && !patient.allergies[0].includes('No known') && (
                            <span className="font-bold text-rose-600 text-[10px] bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                              ⚠️ {patient.allergies[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-semibold text-slate-600">No matching patients found</p>
                    <p className="text-[11px] text-slate-400 mt-1">Adjust your search query or register a new patient.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Prominent Patient Details Card (7 cols) */}
            <div className="lg:col-span-7">
              {selectedPatient ? (
                <div className="sticky top-20">
                  <PatientDetailsCard
                    patient={selectedPatient}
                    onBookAppointment={(pat) => onOpenBookingForPatient(pat)}
                    onRunTriage={() => onOpenQuickTriage()}
                    isNewlyRegistered={isNewlyRegistered}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <h4 className="text-sm font-bold text-slate-700">No Patient Selected</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Select a patient from the list on the left to inspect their complete clinical record.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
