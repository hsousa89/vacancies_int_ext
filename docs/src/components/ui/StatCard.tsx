import { type ReactNode } from 'react';

export interface StatCardProps {
  label: string;
  value: string | number;
  sub: ReactNode;
  color: string;
  bgColor?: string;
  isSmallText?: boolean;
}

export function StatCard({ 
  label, 
  value, 
  sub, 
  color, 
  bgColor = "bg-white", 
  isSmallText = false 
}: StatCardProps) {
  return (
    <div className={`${bgColor} p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between`}>
      <span className="text-[9px] font-bold uppercase text-slate-400 block mb-1">
        {label}
      </span>
      <p 
        className={`${isSmallText ? 'text-xs' : 'text-sm'} font-bold text-slate-900 mb-2 line-clamp-2 leading-tight flex-1`} 
        title={String(value)}
      >
        {value}
      </p>
      <div className={`${color} font-bold text-xs`}>
        {sub}
      </div>
    </div>
  );
}