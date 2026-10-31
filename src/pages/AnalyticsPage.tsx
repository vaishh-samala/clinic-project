import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Activity,
  HeartPulse
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { clinicService } from '../services/clinicService';

export const AnalyticsPage: React.FC = () => {
  const metrics = clinicService.getMetrics();

  const triageBreakdown = [
    { level: 'Level 1: Emergency', pct: 8, count: 2, color: 'bg-rose-500' },
    { level: 'Level 2: Urgent', pct: 25, count: 6, color: 'bg-amber-500' },
    { level: 'Level 3: Standard', pct: 50, count: 12, color: 'bg-teal-500' },
    { level: 'Level 4: Routine', pct: 17, count: 4, color: 'bg-slate-400' }
  ];

  const departmentUtilization = [
    { name: 'Cardiovascular Care', load: 82, visits: 9, max: 14, color: 'bg-blue-600' },
    { name: 'Primary Care (Internal Med)', load: 66, visits: 12, max: 18, color: 'bg-teal-600' },
    { name: 'Pediatric Center', load: 46, visits: 7, max: 15, color: 'bg-cyan-600' },
    { name: 'Musculoskeletal / Ortho', load: 50, visits: 4, max: 8, color: 'bg-indigo-600' },
    { name: 'Neurosciences', load: 60, visits: 6, max: 10, color: 'bg-slate-700' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Clinical Operations & Quality Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Throughput metrics, wait time trends, Emergency Severity Index distribution, and AI concordance.
        </p>
      </div>

      {/* Primary KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Daily Patient Volume"
          value={metrics.totalAppointmentsToday}
          subtitle="94% clinic room occupancy"
          change="12% vs last Friday"
          isPositive={true}
          icon={Users}
          variant="blue"
        />

        <StatCard
          title="Triage Concordance"
          value={`${metrics.agentTriageAccuracy}%`}
          subtitle="Agent match with MD assessment"
          change="+0.5% vs benchmark"
          isPositive={true}
          icon={Sparkles}
          variant="teal"
        />

        <StatCard
          title="Mean Waiting Interval"
          value={`${metrics.avgWaitTimeMinutes}m`}
          subtitle="From check-in to exam room"
          change="Down from 18m"
          isPositive={true}
          icon={Clock}
          variant="emerald"
        />

        <StatCard
          title="Priority Cases Flagged"
          value={metrics.urgentCasesCount}
          subtitle="Zero adverse delays reported"
          icon={ShieldCheck}
          variant="amber"
        />
      </div>

      {/* Main Charts & Breakdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Triage Urgency Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Triage Urgency Stratification</h2>
              <p className="text-xs text-slate-500">Breakdown of patient cases by Emergency Severity Index</p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-400">Today's Cohort</span>
          </div>

          {/* Bar representation */}
          <div className="w-full h-3 rounded-full flex overflow-hidden bg-slate-100 gap-1">
            {triageBreakdown.map((item, idx) => (
              <div 
                key={idx} 
                className={`${item.color} h-full rounded-xs`} 
                style={{ width: `${item.pct}%` }}
                title={`${item.level}: ${item.pct}%`}
              />
            ))}
          </div>

          {/* Detailed item list */}
          <div className="space-y-3 pt-2">
            {triageBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className={`w-3 h-3 rounded-md ${item.color}`}></span>
                  <span className="font-semibold text-slate-800">{item.level}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-slate-400 font-mono tabular-nums">{item.count} patients</span>
                  <strong className="text-slate-900 font-mono tabular-nums w-12 text-right">{item.pct}%</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Utilization */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Specialty Department Utilization</h2>
              <p className="text-xs text-slate-500">Current patient load vs. maximum daily capacity</p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-400">Live Slots</span>
          </div>

          <div className="space-y-4 pt-1">
            {departmentUtilization.map((dept, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{dept.name}</span>
                  <span className="text-slate-500 font-mono tabular-nums">
                    {dept.visits} / {dept.max} visits ({dept.load}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${dept.color} h-full rounded-full`}
                    style={{ width: `${dept.load}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Clinic Agent Operations Impact */}
      <div className="bg-gradient-to-r from-teal-500/10 via-cyan-500/5 to-blue-500/10 border border-teal-200/80 rounded-3xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-500/20">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Clinical Impact & Protocol Compliance</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Automated pre-triage reduced front-desk intake latency from 6.4 minutes to under 1.2 minutes per patient. Contraindication screening prevented 2 potential drug-allergy prescription errors this week.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
