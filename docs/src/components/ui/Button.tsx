import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  icon?: string;
  children: ReactNode;
}

export function Button({ variant = 'primary', icon, children, className = '', ...props }: ButtonProps) {
  const baseStyles = "px-6 py-2.5 rounded-full font-label font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none transform";
  
  const variants = {
    primary: "bg-primary text-white shadow-lg shadow-primary/20 hover:opacity-90 hover:-translate-y-0.5",
    secondary: "bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:opacity-90 hover:-translate-y-0.5",
    gradient: "bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-lg shadow-primary/20 hover:scale-105",
    outline: "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-primary",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {icon && (
        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}