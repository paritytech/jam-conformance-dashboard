'use client';

import { TeamPerformance } from '@/types/performance';
import { motion } from 'framer-motion';
import { BarChart3, Zap, Info, Clock, GitCommit } from 'lucide-react';
import { getPerformanceColor } from '@/lib/performance-utils';
import { useState } from 'react';
import { PERFORMANCE_CONFIG, getPerformanceCategory, UI_CONFIG, APP_CONFIG } from '@/config';
import sourceInfo from '@/data/source-info.json';

interface PerformanceChartEnhancedProps {
  teams: TeamPerformance[];
  baseline: string;
  timestamp?: number;
}

export function PerformanceChartEnhanced({ teams, baseline, timestamp }: PerformanceChartEnhancedProps) {
  const maxValue = Math.max(...teams.map(t => t.metrics.mean));
  const minValue = Math.min(...teams.filter(t => t.metrics.mean > 0).map(t => t.metrics.mean));
  const range = maxValue / minValue;
  
  // Auto-enable log scale if range is too high
  const shouldUseLogScale = range > PERFORMANCE_CONFIG.visualization.logScaleThreshold;
  
  const getBarWidth = (value: number) => {
    let width;
    if (shouldUseLogScale) {
      const logMax = Math.log10(maxValue);
      const logMin = Math.log10(minValue || 1);
      const logValue = Math.log10(value || 1);
      width = ((logValue - logMin) / (logMax - logMin)) * 100;
    } else {
      width = (value / maxValue) * 100;
    }
    // Ensure minimum width of 2% so all bars are visible
    return Math.max(2, width);
  };

  const getGradientByPerformance = (relative: number) => {
    // Use the original gradient scheme for the performance chart
    if (relative < 1.2) return 'from-emerald-500 to-emerald-400';
    if (relative < 2) return 'from-cyan-500 to-cyan-400';
    if (relative < 5) return 'from-blue-500 to-blue-400';
    if (relative < 10) return 'from-purple-500 to-purple-400';
    if (relative < 20) return 'from-amber-500 to-amber-400';
    if (relative < 50) return 'from-orange-500 to-orange-400';
    return 'from-red-500 to-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: UI_CONFIG.animation.mediumDuration }}
      className="relative overflow-hidden rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-white/[0.05]" />
      
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-lg border border-white/10">
              <BarChart3 className="w-6 h-6 text-white/60" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Performance Comparison</h3>
              <p className="text-sm text-slate-400 mt-1">All implementations relative to {teams.find(t => t.name === baseline)?.metadata?.displayName || baseline}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1 text-xs text-slate-500">
            {timestamp && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(timestamp).toLocaleString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}</span>
              </div>
            )}
            {sourceInfo.source?.commitHash && sourceInfo.source.commitHash !== 'placeholder' && (
              <a 
                href={sourceInfo.source.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                title={sourceInfo.source.commitMessage}
              >
                <GitCommit className="w-3 h-3" />
                <span>{sourceInfo.source.commitHash.slice(0, 7)}</span>
              </a>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          {teams.map((team, index) => {
            const isBaseline = team.name === baseline;
            const percentage = getBarWidth(team.metrics.mean);
            const gradient = getGradientByPerformance(team.relativeToBaseline);
            
            return (
              <motion.div
                key={`${team.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02, duration: 0.3 }}
                className="group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] font-mono text-slate-600 w-6 text-right">
                      {team.rank}
                    </span>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium text-white truncate">
                        {team.metadata?.displayName || team.name}
                      </span>
                      {isBaseline && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-white/10 text-white/70 border border-white/20">
                          <Zap className="w-3 h-3" />
                          Baseline
                        </span>
                      )}
                      {team.metadata?.language && (
                        <div className="inline-flex items-center">
                          <span 
                            className="w-2 h-2 rounded-full mr-1.5"
                            style={{ backgroundColor: team.metadata.languageColor || '#666' }}
                          />
                          <span className="text-xs text-slate-500">
                            {team.metadata.language}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-xs text-slate-400">
                      {team.relativeToBaseline < 1 
                        ? `${(1 / team.relativeToBaseline).toFixed(1)}x faster`
                        : team.relativeToBaseline > 1.05
                          ? `${team.relativeToBaseline.toFixed(1)}x slower`
                          : 'baseline'
                      }
                    </span>
                    <span className="text-sm font-mono text-slate-300 w-20 text-right">
                      {team.metrics.mean.toFixed(2)}ms
                    </span>
                  </div>
                </div>
                
                <div className="relative h-6 bg-black/30 rounded-lg overflow-hidden ml-10 group-hover:bg-black/50 transition-colors">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ 
                      duration: 0.8, 
                      delay: index * 0.02,
                      ease: "easeOut"
                    }}
                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${gradient} opacity-80 group-hover:opacity-100 transition-opacity`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                  </motion.div>
                  
                  {/* Performance markers */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="flex-1 relative">
                      {/* P50 marker */}
                      {team.metrics.p50 > 0 && team.metrics.p50 <= maxValue && (
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 w-[1px] h-4 bg-white/40"
                          style={{ left: `${Math.min(getBarWidth(team.metrics.p50), 100)}%` }}
                          title={`P50: ${team.metrics.p50.toFixed(2)}ms`}
                        />
                      )}
                      {/* P90 marker */}
                      {team.metrics.p90 > 0 && team.metrics.p90 <= maxValue && (
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 w-[1px] h-3 bg-white/30"
                          style={{ left: `${Math.min(getBarWidth(team.metrics.p90), 100)}%` }}
                          title={`P90: ${team.metrics.p90.toFixed(2)}ms`}
                        />
                      )}
                      {/* P99 marker */}
                      {team.metrics.p99 > 0 && team.metrics.p99 <= maxValue && (
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 w-[1px] h-2 bg-white/20"
                          style={{ left: `${Math.min(getBarWidth(team.metrics.p99), 100)}%` }}
                          title={`P99: ${team.metrics.p99.toFixed(2)}ms`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-800/50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-xs text-slate-500">
              {shouldUseLogScale ? 'Logarithmic scale' : 'Linear scale'} • Lower is better
            </div>
            <div className="flex items-center gap-6 text-xs">
              {/* Percentile markers legend */}
              <div className="flex items-center gap-3 pr-4 border-r border-slate-700/50">
                <span className="text-slate-500">Percentiles:</span>
                <div className="flex items-center gap-1">
                  <div className="w-[1px] h-4 bg-white/40" />
                  <span className="text-slate-400 ml-1">P50</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-[1px] h-3 bg-white/30" />
                  <span className="text-slate-400 ml-1">P90</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-[1px] h-2 bg-white/20" />
                  <span className="text-slate-400 ml-1">P99</span>
                </div>
              </div>
              
              {/* Performance tiers */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-gradient-to-r from-emerald-500 to-emerald-400" />
                  <span className="text-slate-400">&lt;1.2x</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-gradient-to-r from-cyan-500 to-cyan-400" />
                  <span className="text-slate-400">&lt;2x</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-gradient-to-r from-purple-500 to-purple-400" />
                  <span className="text-slate-400">&lt;10x</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-gradient-to-r from-red-500 to-red-400" />
                  <span className="text-slate-400">&gt;50x</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}