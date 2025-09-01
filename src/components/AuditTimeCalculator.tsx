'use client';

import { useState } from 'react';
import { TeamPerformance } from '@/types/performance';
import { calculateAuditTime } from '@/lib/performance-utils';
import { cn } from '@/lib/utils';
import { Calculator, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuditTimeCalculatorProps {
  teams: TeamPerformance[];
  baseline: string;
}

export function AuditTimeCalculator({ teams, baseline }: AuditTimeCalculatorProps) {
  const [baselineDays, setBaselineDays] = useState(3);
  const baselineTeam = teams.find(t => t.name === baseline);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative overflow-hidden rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 p-6 shadow-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-white/[0.05]" />
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="w-6 h-6 text-white/60" />
          <h3 className="text-xl font-bold text-white">Audit Time Calculator</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Baseline Audit Time (days)
            </label>
            <input
              type="number"
              value={baselineDays}
              onChange={(e) => setBaselineDays(Number(e.target.value))}
              className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              min="1"
              max="365"
            />
            <p className="text-xs text-slate-500 mt-1">
              Time required for {baseline} to complete audit
            </p>
          </div>

          <div className="grid gap-2 mt-6">
            {teams.map((team) => {
              const auditTime = calculateAuditTime(baselineDays, team.relativeToBaseline);
              const days = Math.floor(auditTime);
              const hours = Math.floor((auditTime - days) * 24);
              
              return (
                <div
                  key={`${team.name}-${team.rank}`}
                  className="flex items-center justify-between p-2 bg-black/20 rounded-lg border border-white/5 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono text-slate-600 w-4 text-right">
                      {team.rank}
                    </span>
                    <span className="text-xs font-medium text-white truncate">
                      {team.metadata?.displayName || team.name}
                    </span>
                  </div>
                  <div className="text-right ml-2">
                    <span className="text-xs font-mono text-slate-300 whitespace-nowrap">
                      {auditTime < 1 
                        ? `${Math.round(auditTime * 24)}h`
                        : auditTime < 365 
                          ? `${auditTime.toFixed(1)}d`
                          : `${(auditTime / 365).toFixed(1)}y`
                      }
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-sm text-slate-300">
              <strong>Note:</strong> These calculations show the real-world impact of performance differences on audit requirements.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}