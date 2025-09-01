import { PERFORMANCE_CONFIG, getPerformanceCategory } from '@/config';

export function formatRelativePerformance(relative: number): string {
  if (relative < 1) {
    return `${(1 / relative).toFixed(1)}x faster`;
  } else if (relative > 1) {
    return `${relative.toFixed(1)}x slower`;
  }
  return 'baseline';
}

export function calculateAuditTime(baselineDays: number, relativePerformance: number): number {
  return baselineDays * relativePerformance;
}

export function getPerformanceColor(relative: number): string {
  const category = getPerformanceCategory(relative);
  return PERFORMANCE_CONFIG.colors[category].text;
}

export function getPerformanceGradient(relative: number): string {
  // Use custom subtle gradients for better readability in pills
  if (relative < 0.8) return 'from-cyan-500/20 to-cyan-500/5';
  if (relative < 1.5) return 'from-purple-500/20 to-purple-500/5';
  if (relative < 3) return 'from-amber-500/20 to-amber-500/5';
  if (relative < 10) return 'from-orange-500/20 to-orange-500/5';
  // For very poor performance, use a dark gradient for better contrast
  return 'from-slate-800/50 to-slate-700/30';
}