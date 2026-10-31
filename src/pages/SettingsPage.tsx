import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  Sparkles, 
  Bell, 
  RotateCcw, 
  Check, 
  ShieldCheck, 
  Clock, 
  Sliders 
} from 'lucide-react';
import { clinicService } from '../services/clinicService';

export const SettingsPage: React.FC = () => {
  const [clinicName, setClinicName] = useState('St. Jude Outpatient Center · Annex East');
  const [operatingHours, setOperatingHours] = useState('07:30 AM - 07:00 PM');
  const [triageSensitivity, setTriageSensitivity] = useState<'Standard' | 'High Sensitivity'>('High Sensitivity');
  const [autoDispatch, setAutoDispatch] = useState(true);
  const [alertSound, setAlertSound] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetData = () => {
    if (confirm('Reset all appointments, patients, and triage logs back to default clinical mock data?')) {
      clinicService.resetToDefault();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Clinic & AI Agent Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure facility parameters, autonomous triage thresholds, and operational rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Clinic Profile */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-900">Facility Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Facility Display Name
              </label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Daily Operating Hours
              </label>
              <input
                type="text"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>
        </div>

        {/* AI Agent Triage Engine Configuration */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-900">Autonomous Clinic Agent Controls</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Emergency Triage Sensitivity
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTriageSensitivity('High Sensitivity')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    triageSensitivity === 'High Sensitivity'
                      ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <strong className="block text-slate-900 font-bold mb-0.5">High Sensitivity (Recommended)</strong>
                  <span className="text-[11px] text-slate-500">
                    Aggressively flags borderline cardiopulmonary symptoms as Level 1/2 for physician review.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTriageSensitivity('Standard')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    triageSensitivity === 'Standard'
                      ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <strong className="block text-slate-900 font-bold mb-0.5">Standard Thresholds</strong>
                  <span className="text-[11px] text-slate-500">
                    Applies conservative ESI clinical scoring criteria.
                  </span>
                </button>
              </div>
            </div>

            {/* Toggle checkboxes */}
            <div className="pt-2 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoDispatch}
                  onChange={(e) => setAutoDispatch(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-slate-800 block">Automated Room Queue Dispatching</span>
                  <span className="text-[11px] text-slate-500">
                    Allows the AI agent to assign patient directly to physician waiting list upon completed intake.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertSound}
                  onChange={(e) => setAlertSound(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-slate-800 block">Immediate Red Flag Notifications</span>
                  <span className="text-[11px] text-slate-500">
                    Broadcast audio & screen banners for Level 1 emergency arrivals.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Demo Data Management */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Restore Mock Clinical Data</h3>
              <p className="text-xs text-slate-500">Reset patient queue, doctor appointments, and triage log state.</p>
            </div>
            <button
              type="button"
              onClick={handleResetData}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{resetSuccess ? 'Restored Defaults!' : 'Reset Data'}</span>
            </button>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-xs font-semibold text-teal-700 flex items-center gap-1">
              <Check className="w-4 h-4" />
              Settings saved successfully!
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-all"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
