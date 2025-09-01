'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PerformanceCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  gradient?: string;
  delay?: number;
}

export function PerformanceCard({ 
  title, 
  value, 
  subtitle, 
  icon,
  gradient = "from-cyan-500/20 to-cyan-500/5",
  delay = 0 
}: PerformanceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative overflow-hidden rounded-xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6"
    >
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-20",
        gradient
      )} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-400">{title}</h3>
          {icon && <div className="text-slate-500">{icon}</div>}
        </div>
        
        <div className="space-y-1">
          <p className="text-3xl font-bold text-white font-mono">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}