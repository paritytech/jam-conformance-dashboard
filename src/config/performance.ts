export const PERFORMANCE_CONFIG = {
  thresholds: {
    excellent: 1.0,
    good: 1.5,
    fair: 2.0,
    moderate: 3.0,
    poor: 5.0,
    veryPoor: 10.0,
    critical: 20.0
  },
  
  // Chart-specific thresholds for finer granularity
  chartThresholds: {
    excellent: 1.2,
    good: 2.0,
    fair: 5.0,
    moderate: 10.0,
    poor: 20.0,
    veryPoor: 50.0
  },
  
  colors: {
    excellent: {
      gradient: 'from-emerald-500 to-emerald-400',
      text: 'text-emerald-500',
      bg: 'bg-emerald-500'
    },
    good: {
      gradient: 'from-cyan-500 to-cyan-400',
      text: 'text-cyan-500',
      bg: 'bg-green-500'
    },
    fair: {
      gradient: 'from-purple-500 to-purple-400',
      text: 'text-purple-500',
      bg: 'bg-lime-500'
    },
    moderate: {
      gradient: 'from-amber-500 to-amber-400',
      text: 'text-amber-500',
      bg: 'bg-yellow-500'
    },
    poor: {
      gradient: 'from-orange-500 to-orange-400',
      text: 'text-orange-500',
      bg: 'bg-amber-500'
    },
    veryPoor: {
      gradient: 'from-red-500 to-red-400',
      text: 'text-red-500',
      bg: 'bg-orange-500'
    },
    critical: {
      gradient: 'from-rose-600 to-rose-500',
      text: 'text-red-500',
      bg: 'bg-red-500'
    }
  },
  
  scoring: {
    weights: {
      p50: 0.35,
      p90: 0.25,
      mean: 0.20,
      p99: 0.10,
      stdDev: 0.10
    }
  },
  
  visualization: {
    logScaleThreshold: 50,
    trendThreshold: 0.1, // 10% change threshold for trend arrows
  },
  
  auditTime: {
    defaultBaselineDays: 3,
    minDays: 1,
    maxDays: 365,
    displayThresholds: {
      hours: 1,    // Less than 1 day shows hours
      days: 365,   // Less than 365 days shows days
    }
  }
};

export function getPerformanceCategory(relative: number): keyof typeof PERFORMANCE_CONFIG.colors {
  const { thresholds } = PERFORMANCE_CONFIG;
  
  if (relative <= thresholds.excellent) return 'excellent';
  if (relative < thresholds.good) return 'good';
  if (relative < thresholds.fair) return 'fair';
  if (relative < thresholds.moderate) return 'moderate';
  if (relative < thresholds.poor) return 'poor';
  if (relative < thresholds.veryPoor) return 'veryPoor';
  return 'critical';
}