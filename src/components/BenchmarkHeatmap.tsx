'use client';

import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

interface BenchmarkData {
  [benchmark: string]: {
    teams: Array<{
      name: string;
      originalName?: string;
      metrics: { mean: number };
      relativeToBaseline: number;
      rank: number;
      metadata?: any;
    }>;
    baseline: string;
  };
}

interface BenchmarkHeatmapProps {
  benchmarkData: BenchmarkData;
  version: string;
}

const benchmarkNames = {
  safrole: 'Safrole',
  fallback: 'Fallback', 
  storage: 'Storage',
  storage_light: 'Storage Light'
} as const;

export function BenchmarkHeatmap({ benchmarkData, version }: BenchmarkHeatmapProps) {
  const benchmarks = ['safrole', 'fallback', 'storage', 'storage_light'];
  const allTeams = new Set<string>();
  
  // Collect all unique team names
  benchmarks.forEach(benchmark => {
    if (benchmarkData[benchmark]) {
      benchmarkData[benchmark].teams.forEach(team => {
        allTeams.add(team.name);
      });
    }
  });
  
  const teamList = Array.from(allTeams).sort();
  
  // Get color based on relative performance
  const getColor = (relative: number) => {
    if (!relative) return 'bg-black/30';
    if (relative < 1.2) return 'bg-emerald-600';
    if (relative < 2) return 'bg-cyan-600';
    if (relative < 5) return 'bg-blue-600';
    if (relative < 10) return 'bg-purple-600';
    if (relative < 20) return 'bg-amber-600';
    if (relative < 50) return 'bg-orange-600';
    return 'bg-red-600';
  };
  
  const getOpacity = (relative: number) => {
    if (!relative) return '';
    const normalized = Math.min(relative / 50, 1);
    return `opacity-${Math.round(normalized * 100)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-white/[0.05]" />
      
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">Benchmark Performance Heatmap</h3>
            <p className="text-sm text-slate-400 mt-1">Comparing performance across all benchmark types</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-4 h-4" />
            <span>Performance relative to baseline</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-sm font-medium text-slate-400 pb-4 pr-4 sticky left-0 bg-gradient-to-r from-black/40 via-black/30 to-transparent z-10">
                  Team
                </th>
                {benchmarks.map(benchmark => (
                  <th key={benchmark} className="text-center text-sm font-medium text-slate-400 pb-4 px-4 min-w-[120px]">
                    {benchmarkNames[benchmark as keyof typeof benchmarkNames]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teamList.map((teamName, index) => (
                <motion.tr
                  key={teamName}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="group"
                >
                  <td className="py-2 pr-4 sticky left-0 bg-gradient-to-r from-black/40 via-black/30 to-transparent z-10">
                    <span className="text-sm font-medium text-white">
                      {teamName}
                    </span>
                  </td>
                  {benchmarks.map(benchmark => {
                    const benchData = benchmarkData[benchmark];
                    const team = benchData?.teams.find(t => t.name === teamName);
                    const isBaseline = team && benchData.baseline === team.originalName;
                    
                    return (
                      <td key={benchmark} className="p-2 text-center">
                        {team ? (
                          <div className="relative group/cell">
                            <div
                              className={`
                                relative h-16 rounded-lg overflow-hidden transition-all duration-200
                                ${getColor(team.relativeToBaseline || 0)}
                                ${isBaseline ? 'ring-2 ring-cyan-400' : ''}
                                group-hover/cell:scale-105
                              `}
                              style={{
                                opacity: team.relativeToBaseline && team.relativeToBaseline > 1 
                                  ? Math.min(0.2 + (team.relativeToBaseline / 50) * 0.8, 1)
                                  : 0.8
                              }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xs font-mono text-white/90 font-medium">
                                  {team.relativeToBaseline?.toFixed(1) || 'N/A'}x
                                </span>
                                <span className="text-[10px] text-white/70">
                                  {team.metrics?.mean?.toFixed(1) || 'N/A'}ms
                                </span>
                              </div>
                            </div>
                            {isBaseline && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full" />
                            )}
                          </div>
                        ) : (
                          <div className="h-16 rounded-lg bg-black/20" />
                        )}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500">Performance Scale:</span>
            <div className="flex items-center gap-2">
              {[
                { color: 'bg-emerald-600', label: '1-1.2x' },
                { color: 'bg-cyan-600', label: '1.2-2x' },
                { color: 'bg-blue-600', label: '2-5x' },
                { color: 'bg-purple-600', label: '5-10x' },
                { color: 'bg-amber-600', label: '10-20x' },
                { color: 'bg-orange-600', label: '20-50x' },
                { color: 'bg-red-600', label: '>50x' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1">
                  <div className={`w-4 h-4 rounded ${color}`} />
                  <span className="text-[10px] text-slate-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded ring-2 ring-cyan-400" />
            <span className="text-xs text-slate-400">Baseline</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}