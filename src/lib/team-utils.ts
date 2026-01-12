import clientMetadata from '@/data/client-metadata.json';

// Map of team name variations to canonical names
const TEAM_NAME_MAPPINGS: Record<string, string> = {
  // PolkaJam variations - polkajam (interpreted) becomes the main polkajam
  'polkajam (interpreted)': 'polkajam',
  'polkajam_interpreted': 'polkajam',
  // The recompiler version maps to polkajam_recompiler
  'polkajam': 'polkajam_recompiler',
  'polkajam (recompiler)': 'polkajam_recompiler',
  
  // Team names with suffixes
  'jamzig-target': 'jamzig',
  'tsjam-0.7.0-tiny': 'tsjam',
  'boka-fuzzing-target': 'boka',
  'vinwolf-target': 'vinwolf',
  'duna-target': 'jamduna',
  'pbnj-fuzzer-target': 'pbnjam',

  // Hyphenated variations
  'jam-duna': 'jamduna',
  'jam-duna-target-0.7.0.3': 'jamduna',

  // Scala variations (Jam4s)
  'jam-scala': 'jam-scala',

  // JAMneration variations
  'new_jamneration': 'new_jamneration',
  'new-jamneration': 'new_jamneration',

  // Package-style names
  '@typeberry/jam': 'typeberry',
};

/**
 * Normalizes a team name to its canonical form for metadata lookup
 */
export function normalizeTeamName(teamName: string): string {
  // First check if there's a direct mapping
  const mapped = TEAM_NAME_MAPPINGS[teamName.toLowerCase()];
  if (mapped) {
    return mapped;
  }
  
  // If no mapping found, return the lowercase version
  return teamName.toLowerCase();
}

/**
 * Gets team metadata with fallback for name variations
 */
export function getTeamMetadata(teamName: string): any {
  const metadata = clientMetadata as any;
  
  // Try direct lookup first
  if (metadata[teamName]) {
    return metadata[teamName];
  }
  
  // Try normalized name
  const normalizedName = normalizeTeamName(teamName);
  if (metadata[normalizedName]) {
    return metadata[normalizedName];
  }
  
  // Try lowercase
  const lowerName = teamName.toLowerCase();
  if (metadata[lowerName]) {
    return metadata[lowerName];
  }
  
  // Try removing common suffixes
  const nameWithoutSuffix = teamName
    .replace(/-fuzzing-target.*$/, '')
    .replace(/-fuzzer-target.*$/, '')
    .replace(/-target.*$/, '')
    .replace(/-\d+\.\d+\.\d+.*$/, '');
  if (metadata[nameWithoutSuffix]) {
    return metadata[nameWithoutSuffix];
  }
  if (metadata[nameWithoutSuffix.toLowerCase()]) {
    return metadata[nameWithoutSuffix.toLowerCase()];
  }
  
  // Return empty object if no match found
  return {};
}

/**
 * Enriches team data with metadata
 */
export function enrichTeamWithMetadata(team: any): any {
  return {
    ...team,
    metadata: getTeamMetadata(team.name) || getTeamMetadata(team.originalName || '')
  };
}