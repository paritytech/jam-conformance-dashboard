'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Box, Database, Layers, Grid3x3 } from 'lucide-react';

interface BenchmarkTabsProps {
  currentBenchmark: string;
  onBenchmarkChange: (benchmark: string) => void;
}

const benchmarks = [
  { id: '', name: 'Overview', icon: Activity, description: 'Overall performance' },
  { id: 'heatmap', name: 'Heatmap', icon: Grid3x3, description: 'Benchmark comparison' },
  { id: 'safrole', name: 'Safrole', icon: Box, description: 'Core protocol operations' },
  { id: 'fallback', name: 'Fallback', icon: Layers, description: 'Fallback mechanism' },
  { id: 'storage', name: 'Storage', icon: Database, description: 'Storage operations' },
  { id: 'storage_light', name: 'Storage Light', icon: Database, description: 'Light storage mode' },
];

export function BenchmarkTabs({ currentBenchmark, onBenchmarkChange }: BenchmarkTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 p-1 bg-black/30 rounded-xl border border-white/5">
      {benchmarks.map((benchmark) => {
        const Icon = benchmark.icon;
        const isActive = currentBenchmark === benchmark.id;
        
        return (
          <button
            key={benchmark.id}
            onClick={() => onBenchmarkChange(benchmark.id)}
            className={`
              relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
              transition-all duration-200
              ${isActive 
                ? 'bg-white/10 text-white border border-white/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span>{benchmark.name}</span>
            {isActive && (
              <motion.div
                layoutId="benchmark-tab"
                className="absolute inset-0 bg-white/5 rounded-lg -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}