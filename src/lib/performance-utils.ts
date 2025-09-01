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
  if (relative < 0.8) return 'text-cyan-500';
  if (relative < 1.5) return 'text-purple-500';
  if (relative < 3) return 'text-amber-500';
  return 'text-coral-500';
}

export function getPerformanceGradient(relative: number): string {
  if (relative < 0.8) return 'from-cyan-500/20 to-cyan-500/5';
  if (relative < 1.5) return 'from-purple-500/20 to-purple-500/5';
  if (relative < 3) return 'from-amber-500/20 to-amber-500/5';
  return 'from-coral-500/20 to-coral-500/5';
}