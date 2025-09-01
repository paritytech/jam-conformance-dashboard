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
    if (!relative) return 'bg-neutral-800/50';
    if (relative <= 1.0) return 'bg-emerald-500';
    if (relative < 1.5) return 'bg-green-500';
    if (relative < 2) return 'bg-lime-500';
    if (relative < 3) return 'bg-yellow-500';
    if (relative < 5) return 'bg-amber-500';
    if (relative < 10) return 'bg-orange-500';
    if (relative < 20) return 'bg-red-500';
    return 'bg-red-700';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 shadow-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/20 via-transparent to-neutral-800/20" />
      
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
                <th className="text-left text-sm font-medium text-slate-400 pb-4 pr-3 pl-2 sticky left-0 bg-neutral-900/90 backdrop-blur-sm z-10 min-w-[120px]">
                  Team
                </th>
                {benchmarks.map(benchmark => (
                  <th key={benchmark} className="text-center text-sm font-medium text-slate-400 pb-4 px-3 w-1/4">
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
                  className="group hover:bg-white/5 transition-colors"
                >
                  <td className="py-1.5 pr-3 pl-2 sticky left-0 bg-neutral-900/90 group-hover:bg-neutral-800/90 backdrop-blur-sm z-10 border-r border-neutral-800 transition-colors">
                    <span className="text-sm font-medium text-white">
                      {teamName}
                    </span>
                  </td>
                  {benchmarks.map(benchmark => {
                    const benchData = benchmarkData[benchmark];
                    const team = benchData?.teams.find(t => t.name === teamName);
                    const isBaseline = team && benchData.baseline === team.originalName;
                    
                    return (
                      <td key={benchmark} className="px-3 py-1.5 text-center">
                        {team ? (
                          <div className="relative">
                            <div
                              className={`
                                relative h-14 rounded-md overflow-hidden transition-all duration-300
                                ${getColor(team.relativeToBaseline || 0)}
                                ${isBaseline ? 'ring-2 ring-white' : ''}
                                group-hover:ring-1 group-hover:ring-white/30
                              `}
                            >
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-sm font-bold text-white">
                                  {team.relativeToBaseline?.toFixed(1) || 'N/A'}x
                                </span>
                                <span className="text-[10px] text-white/80 font-medium">
                                  {team.metrics?.mean?.toFixed(0) || 'N/A'}ms
                                </span>
                              </div>
                              {isBaseline && (
                                <div className="absolute top-0.5 right-0.5 bg-white/90 rounded px-1 py-0.5">
                                  <span className="text-[8px] text-black font-bold">BASE</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="h-14 rounded-md bg-neutral-800/30 border border-neutral-800" />
                        )}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-neutral-800/30 rounded-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-400 font-medium">Performance Scale:</span>
              <div className="flex flex-wrap items-center gap-3">
                {[
                  { color: 'bg-emerald-500', label: 'Baseline (1x)' },
                  { color: 'bg-green-500', label: '1-1.5x' },
                  { color: 'bg-lime-500', label: '1.5-2x' },
                  { color: 'bg-yellow-500', label: '2-3x' },
                  { color: 'bg-amber-500', label: '3-5x' },
                  { color: 'bg-orange-500', label: '5-10x' },
                  { color: 'bg-red-500', label: '10-20x' },
                  { color: 'bg-red-700', label: '>20x' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className={`w-5 h-5 rounded ${color} shadow-sm`} />
                    <span className="text-[11px] text-slate-300">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-xs text-slate-400">
              <span className="font-medium">Lower is better</span> • Times shown relative to fastest implementation
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}