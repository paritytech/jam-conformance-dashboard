'use client';

import { Info } from 'lucide-react';
import { APP_CONFIG } from '@/config';

interface BenchmarkInfoProps {
  benchmark: string;
}

export function BenchmarkInfo({ benchmark }: BenchmarkInfoProps) {
  if (!benchmark || benchmark === 'heatmap') return null;
  
  const description = APP_CONFIG.benchmarks.descriptions[benchmark as keyof typeof APP_CONFIG.benchmarks.descriptions];
  if (!description) return null;
  
  return (
    <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
        <div className="space-y-2">
          <p className="text-sm text-slate-300">
            <span className="font-semibold text-white">{APP_CONFIG.benchmarks.displayNames[benchmark as keyof typeof APP_CONFIG.benchmarks.displayNames]} Benchmark:</span> {description}
          </p>
          <p className="text-xs text-slate-400">
            Performance measurements are based on the public W3F test vector traces.
          </p>
        </div>
      </div>
    </div>
  );
}