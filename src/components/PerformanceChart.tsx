'use client';

import { TeamPerformance } from '@/types/performance';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { getPerformanceColor } from '@/lib/performance-utils';

interface PerformanceChartProps {
  teams: TeamPerformance[];
  baseline: string;
}

export function PerformanceChart({ teams, baseline }: PerformanceChartProps) {
  // Show all teams
  const maxValue = Math.max(...teams.map(t => t.metrics.mean));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5" />
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-purple-500" />
          <h3 className="text-xl font-bold text-white">Performance Comparison</h3>
        </div>

        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {teams.map((team, index) => {
            const percentage = (team.metrics.mean / maxValue) * 100;
            const isBaseline = team.name === baseline;
            
            return (
              <motion.div
                key={`${team.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="relative"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {team.metadata?.displayName || team.name}
                      {isBaseline && (
                        <span className="ml-2 text-xs text-cyan-400">(baseline)</span>
                      )}
                    </span>
                    {team.metadata?.language && (
                      <span 
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded bg-slate-800/50"
                        style={{ 
                          borderLeft: `3px solid ${team.metadata.languageColor || '#666'}` 
                        }}
                      >
                        {team.metadata.language}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-mono text-slate-400">
                    {team.metrics.mean.toFixed(2)}ms
                  </span>
                </div>
                
                <div className="relative h-6 bg-slate-800/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ 
                      duration: 0.8, 
                      delay: 0.5 + index * 0.05,
                      ease: "easeOut"
                    }}
                    className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${
                      isBaseline 
                        ? 'from-cyan-500 to-cyan-400' 
                        : getPerformanceColor(team.relativeToBaseline).includes('cyan')
                          ? 'from-green-500 to-green-400'
                          : getPerformanceColor(team.relativeToBaseline).includes('purple')
                            ? 'from-purple-500 to-purple-400'
                            : getPerformanceColor(team.relativeToBaseline).includes('amber')
                              ? 'from-amber-500 to-amber-400'
                              : 'from-red-500 to-red-400'
                    }`}
                  />
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="text-xs font-medium text-white drop-shadow-lg">
                      {team.relativeToBaseline < 1 
                        ? `${(1 / team.relativeToBaseline).toFixed(1)}x faster`
                        : team.relativeToBaseline > 1
                          ? `${team.relativeToBaseline.toFixed(1)}x slower`
                          : 'baseline'
                      }
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Lower is better</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-400" />
                <span className="text-slate-400">Faster</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400" />
                <span className="text-slate-400">Baseline</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-red-400" />
                <span className="text-slate-400">Slower</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}