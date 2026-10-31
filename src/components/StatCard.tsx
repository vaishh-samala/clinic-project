import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  variant?: 'blue' | 'teal' | 'emerald' | 'amber' | 'indigo';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon: Icon,
  variant = 'blue',
  onClick
}) => {
  const variantStyles = {
    blue: {
      iconBg: 'bg-blue-50 text-blue-600',
      accent: 'text-blue-600'
    },
    teal: {
      iconBg: 'bg-teal-50 text-teal-600',
      accent: 'text-teal-600'
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600',
      accent: 'text-emerald-600'
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600',
      accent: 'text-amber-600'
    },
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-600',
      accent: 'text-indigo-600'
    }
  }[variant];

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.06)] hover:border-slate-300 ${
        onClick ? 'cursor-pointer group' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500 group-hover:text-slate-800 transition-colors">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${variantStyles.iconBg} transition-transform group-hover:scale-105`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">{value}</span>
        {change && (
          <span className={`text-xs font-medium tabular-nums ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? '↑' : '↓'} {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-slate-500">{subtitle}</p>
      )}
    </div>
  );
};
