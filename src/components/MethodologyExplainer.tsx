'use client';

import { motion } from 'framer-motion';
import { Info, BarChart3, TrendingUp, Activity } from 'lucide-react';

interface MethodologyExplainerProps {
  methodology?: {
    description: string;
    weights: {
      p50: number;
      p90: number;
      mean: number;
      p99: number;
      stdDev: number;
    };
    aggregation: string;
  };
}

export function MethodologyExplainer({ methodology }: MethodologyExplainerProps) {
  if (!methodology) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-white/[0.05]" />
      
      <div className="relative p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/5 rounded-lg border border-white/10">
            <BarChart3 className="w-5 h-5 text-white/60" />
          </div>
          <h3 className="text-xl font-bold text-white">Scoring Methodology</h3>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {methodology.description}. Our scoring system prioritizes consistent, predictable performance
              by weighing multiple statistical metrics:
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(methodology.weights).map(([metric, weight]) => {
              const metricInfo = {
                p50: { name: 'Median (P50)', icon: TrendingUp, color: 'from-emerald-500 to-emerald-600', description: 'Typical performance' },
                p90: { name: '90th Percentile', icon: Activity, color: 'from-cyan-500 to-cyan-600', description: 'Consistency' },
                mean: { name: 'Mean', icon: BarChart3, color: 'from-blue-500 to-blue-600', description: 'Average' },
                p99: { name: '99th Percentile', icon: Activity, color: 'from-purple-500 to-purple-600', description: 'Worst case' },
                stdDev: { name: 'Consistency', icon: Info, color: 'from-amber-500 to-amber-600', description: 'Lower variance' }
              }[metric];

              const Icon = metricInfo?.icon || Info;

              return (
                <motion.div
                  key={metric}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="relative group"
                >
                  <div className="p-3 rounded-lg bg-black/30 border border-white/5 hover:border-white/10 transition-all">
                    <div className={`inline-flex p-1.5 rounded bg-gradient-to-r ${metricInfo?.color} mb-2`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <div className="text-xs font-medium text-slate-300">{metricInfo?.name}</div>
                    <div className="text-lg font-bold text-white">{(weight * 100).toFixed(0)}%</div>
                    <div className="text-[10px] text-slate-500 mt-1">{metricInfo?.description}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-4 p-3 bg-black/20 rounded-lg border border-white/5">
            <h4 className="text-sm font-semibold text-slate-300 mb-2">How it works:</h4>
            <ol className="space-y-1 text-xs text-slate-400">
              <li>1. For each benchmark, we calculate a weighted score using the metrics above</li>
              <li>2. We use geometric mean across all benchmarks to aggregate metrics</li>
              <li>3. Teams are ranked by their final weighted score (lower is better)</li>
              <li>4. The fastest team becomes the baseline (1.0x) for relative comparisons</li>
            </ol>
          </div>

          <div className="text-xs text-slate-500 italic">
            Note: Only teams with data for all four benchmarks (Safrole, Fallback, Storage, Storage Light) are included in the overview.
            Zero values are excluded from calculations as they likely represent measurement errors.
          </div>
        </div>
      </div>
    </motion.div>
  );
}