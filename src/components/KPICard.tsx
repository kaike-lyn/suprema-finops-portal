import React from 'react';
import * as LucideIcons from 'lucide-react';
import { motion } from 'motion/react';

interface KPICardProps {
  title: string;
  value: string;
  subtext: string;
  iconName: keyof typeof LucideIcons;
  colorType: 'green' | 'red' | 'blue' | 'yellow';
  idAttribute: string;
  isDarkMode?: boolean;
  onClick?: () => void;
  isActive?: boolean;
}

export default function KPICard({ 
  title, 
  value, 
  subtext, 
  iconName, 
  colorType, 
  idAttribute, 
  isDarkMode = true,
  onClick,
  isActive = false
}: KPICardProps) {
  const IconComponent = LucideIcons[iconName] as React.ComponentType<{ className?: string }>;

  const colorStyles = {
    green: {
      bg: isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200',
      icon: isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700',
      text: isDarkMode ? 'text-emerald-400' : 'text-emerald-700',
      borderLine: 'border-l-4 border-emerald-500',
      activeRing: 'ring-2 ring-emerald-500/60 shadow-lg shadow-emerald-500/10 scale-[1.02] border-emerald-500/40'
    },
    red: {
      bg: isDarkMode ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-200',
      icon: isDarkMode ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-750',
      text: isDarkMode ? 'text-rose-400' : 'text-rose-700',
      borderLine: 'border-l-4 border-rose-500',
      activeRing: 'ring-2 ring-rose-500/60 shadow-lg shadow-rose-500/10 scale-[1.02] border-rose-500/40'
    },
    blue: {
      bg: isDarkMode ? 'bg-brand/10 border-brand/20' : 'bg-brand-bg border-brand-border',
      icon: isDarkMode ? 'bg-brand/20 text-brand' : 'bg-brand-bg text-brand-text',
      text: isDarkMode ? 'text-brand' : 'text-brand-text',
      borderLine: 'border-l-4 border-brand',
      activeRing: 'ring-2 ring-brand/60 shadow-lg shadow-brand/10 scale-[1.02] border-brand/40'
    },
    yellow: {
      bg: isDarkMode ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200',
      icon: isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-705',
      text: isDarkMode ? 'text-amber-400' : 'text-amber-700',
      borderLine: 'border-l-4 border-amber-500',
      activeRing: 'ring-2 ring-amber-500/60 shadow-lg shadow-amber-500/10 scale-[1.02] border-amber-500/40'
    }
  };

  const style = colorStyles[colorType] || colorStyles.blue;
  const activeClass = isActive ? style.activeRing : '';
  const pointerClass = onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all' : '';

  return (
    <motion.div
      id={idAttribute}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`relative overflow-hidden p-5 rounded-xl border ${style.bg} ${style.borderLine} ${activeClass} ${pointerClass} flex items-center justify-between shadow-lg backdrop-blur-md`}
    >
      <div className="space-y-1">
        <p className={`text-xs uppercase tracking-wider font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {title}
        </p>
        <h3 className={`text-2xl md:text-3xl font-mono font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          {value}
        </h3>
        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {subtext}
        </p>
      </div>
      <div className={`p-3 rounded-lg ${style.icon} flex items-center justify-center`}>
        {IconComponent && <IconComponent className="w-6 h-6" />}
      </div>
    </motion.div>
  );
}
