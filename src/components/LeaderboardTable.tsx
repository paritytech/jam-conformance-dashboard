'use client';

import { TeamPerformance } from '@/types/performance';
import { formatRelativePerformance, getPerformanceColor, getPerformanceGradient } from '@/lib/performance-utils';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LanguageBadge } from './LanguageBadge';

interface LeaderboardTableProps {
  teams: TeamPerformance[];
  baseline: string;
}

export function LeaderboardTable({ teams, baseline }: LeaderboardTableProps) {
  const baselineTeam = teams.find(t => t.name === baseline);
  
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-white/[0.05]" />
      
      <div className="relative">
        <div className="px-8 py-6 border-b border-neutral-800/50">
          <h2 className="text-2xl font-bold text-white">Performance Rankings</h2>
          <p className="text-sm text-slate-400 mt-1">
            Baseline: {baselineTeam?.metadata?.displayName || baseline} 
            <span className="text-white/60 ml-2">
              (Score: {(baselineTeam as any)?.score?.toFixed(1) || baselineTeam?.metrics.mean.toFixed(2)})
            </span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Team</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Language</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">Score</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">P50 (ms)</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">P90 (ms)</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">Relative Performance</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-slate-400">Trend</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => (
                <motion.tr
                  key={`${team.name}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-neutral-800/50 hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {team.rank === 1 && <Trophy className="w-5 h-5 text-yellow-500" />}
                      {team.rank === 2 && <Trophy className="w-5 h-5 text-slate-400" />}
                      {team.rank === 3 && <Trophy className="w-5 h-5 text-amber-700" />}
                      <span className="font-mono text-lg text-white">{team.rank}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">
                      {team.metadata?.displayName || team.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <LanguageBadge 
                      language={team.metadata?.language} 
                      color={team.metadata?.languageColor}
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-sm text-slate-300">
                      {(team as any).score ? (team as any).score.toFixed(1) : team.metrics.mean.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-sm text-slate-300">
                      {team.metrics.p50 > 0 ? team.metrics.p50.toFixed(2) : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-sm text-slate-300">
                      {team.metrics.p90 > 0 ? team.metrics.p90.toFixed(2) : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap",
                      "bg-gradient-to-r",
                      getPerformanceGradient(team.relativeToBaseline)
                    )}>
                      <span className={cn("font-mono text-xs", getPerformanceColor(team.relativeToBaseline))}>
                        {formatRelativePerformance(team.relativeToBaseline)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {/* Show trend only if we have previous version data */}
                      {team.previousVersionData ? (
                        team.relativeToBaseline < team.previousVersionData.relativeToBaseline * 0.9 ? (
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        ) : team.relativeToBaseline > team.previousVersionData.relativeToBaseline * 1.1 ? (
                          <TrendingDown className="w-5 h-5 text-red-500" />
                        ) : (
                          <Minus className="w-5 h-5 text-slate-500" />
                        )
                      ) : (
                        <Minus className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}