export interface AppVersion {
  major: number;
  minor: number;
  patch: number;
}

export interface TeamInfo {
  name: string;
  app_version: AppVersion;
  jam_version: AppVersion;
}

export interface PerformanceStats {
  steps: number;
  imported: number;
  import_max_step: number;
  import_min: number;
  import_max: number;
  import_mean: number;
  import_p50: number;
  import_p75: number;
  import_p90: number;
  import_p99: number;
  import_std_dev: number;
}

export interface PerformanceReport {
  info: TeamInfo;
  stats: PerformanceStats;
}

export interface ClientMetadata {
  displayName?: string;
  description?: string;
  language?: string;
  languageColor?: string;
  author?: string;
  license?: string;
  url?: string;
}

export interface TeamPerformance {
  name: string;
  originalName?: string;
  metrics: {
    mean: number;
    p50: number;
    p90: number;
    p99: number;
    max: number;
    min: number;
    stdDev: number;
  };
  relativeToBaseline: number;
  rank: number;
  metadata?: ClientMetadata;
  previousVersionData?: {
    relativeToBaseline: number;
    rank: number;
  };
}

export interface LeaderboardData {
  version: string;
  baseline: string;
  teams: TeamPerformance[];
  timestamp: number;
}