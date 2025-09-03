const fs = require('fs');
const path = require('path');

async function generateAggregatedData() {
  const fuzzReportsPath = path.join(__dirname, '..', '..', 'fuzz-reports');
  const versions = fs.readdirSync(fuzzReportsPath).filter(v => v.match(/^\d+\.\d+\.\d+$/));
  
  const aggregatedData = {};
  
  for (const version of versions) {
    console.log(`Processing version ${version}...`);
    
    const reportsPath = path.join(fuzzReportsPath, version, 'reports');
    
    if (!fs.existsSync(reportsPath)) {
      console.log(`  No reports directory for version ${version}`);
      continue;
    }
    
    const teams = fs.readdirSync(reportsPath).filter(team => {
      const perfPath = path.join(reportsPath, team, 'perf');
      const perfIntPath = path.join(reportsPath, team, 'perf_int');
      return (fs.existsSync(perfPath) && fs.statSync(perfPath).isDirectory()) ||
             (fs.existsSync(perfIntPath) && fs.statSync(perfIntPath).isDirectory());
    });
    
    const teamAggregates = {};
    const benchmarks = ['safrole', 'fallback', 'storage', 'storage_light'];
    
    // Process each team, including both perf and perf_int versions if they exist
    for (const team of teams) {
      // Process regular perf version
      const perfTeamData = {
        benchmarks: {},
        hasAllBenchmarks: true
      };
      
      // Process interpreted perf_int version
      const perfIntTeamData = {
        benchmarks: {},
        hasAllBenchmarks: true
      };
      
      // Check each benchmark for both versions
      for (const benchmark of benchmarks) {
        const perfPath = path.join(reportsPath, team, 'perf', `${benchmark}.json`);
        const perfIntPath = path.join(reportsPath, team, 'perf_int', `${benchmark}.json`);
        
        // Load regular perf data
        if (fs.existsSync(perfPath)) {
          try {
            const content = fs.readFileSync(perfPath, 'utf-8');
            const data = JSON.parse(content);
            perfTeamData.benchmarks[benchmark] = {
              ...data.stats,
              info: data.info
            };
          } catch (error) {
            perfTeamData.hasAllBenchmarks = false;
          }
        } else {
          perfTeamData.hasAllBenchmarks = false;
        }
        
        // Load perf_int data
        if (fs.existsSync(perfIntPath)) {
          try {
            const content = fs.readFileSync(perfIntPath, 'utf-8');
            const data = JSON.parse(content);
            perfIntTeamData.benchmarks[benchmark] = {
              ...data.stats,
              info: data.info
            };
          } catch (error) {
            perfIntTeamData.hasAllBenchmarks = false;
          }
        } else {
          perfIntTeamData.hasAllBenchmarks = false;
        }
      }
      
      // Add regular version if it has all benchmarks
      if (perfTeamData.hasAllBenchmarks && Object.keys(perfTeamData.benchmarks).length === benchmarks.length) {
        const weightedScore = calculateWeightedScore(perfTeamData.benchmarks, benchmarks);
        const firstBenchmark = Object.values(perfTeamData.benchmarks)[0];
        const teamName = firstBenchmark.info.name;
        
        teamAggregates[team] = {
          info: {
            ...firstBenchmark.info,
            name: teamName
          },
          metrics: weightedScore.metrics,
          score: weightedScore.score,
          benchmarkScores: weightedScore.benchmarkScores
        };
      }
      
      // Add interpreted version if it has all benchmarks
      if (perfIntTeamData.hasAllBenchmarks && Object.keys(perfIntTeamData.benchmarks).length === benchmarks.length) {
        const weightedScore = calculateWeightedScore(perfIntTeamData.benchmarks, benchmarks);
        const firstBenchmark = Object.values(perfIntTeamData.benchmarks)[0];
        const teamName = firstBenchmark.info.name;
        
        teamAggregates[`${team}_interpreted`] = {
          info: {
            ...firstBenchmark.info,
            name: `${teamName} (interpreted)`
          },
          metrics: weightedScore.metrics,
          score: weightedScore.score,
          benchmarkScores: weightedScore.benchmarkScores
        };
      }
    }
    
    // Sort teams by weighted score (lower is better)
    const sortedTeams = Object.entries(teamAggregates).sort(([,a], [,b]) => 
      a.score - b.score
    );
    
    if (sortedTeams.length === 0) {
      console.log(`  No teams with complete data for version ${version}`);
      continue;
    }
    
    // Find polkajam (interpreted) to use as baseline
    let baselineData = null;
    let baseline = 'polkajam';
    
    // Look for polkajam_interpreted first
    const polkajamInterpreted = sortedTeams.find(([key, data]) => 
      key === 'polkajam_interpreted'
    );
    
    if (polkajamInterpreted) {
      baselineData = polkajamInterpreted[1];
      baseline = 'polkajam';
    } else {
      // Fallback to fastest team if polkajam not found
      console.warn(`  Warning: polkajam not found, using fastest team as baseline`);
      const [fastestTeamKey, fastestData] = sortedTeams[0];
      baselineData = fastestData;
      baseline = fastestData.info.name;
    }
    
    // Create the final aggregated data
    const teamsList = sortedTeams.map(([key, data], index) => {
      // Calculate relative performance based on mean execution time, not score
      let relativeToBaseline = data.metrics.mean / baselineData.metrics.mean;
      
      // Clean up the display name
      let displayName = data.info.name;
      
      // Special handling for polkajam teams
      if (key === 'polkajam') {
        displayName = 'polkajam (recompiler)';
      } else if (key === 'polkajam_interpreted') {
        displayName = 'polkajam';
      }
      
      // Clean up other team names
      if (displayName.includes('-fuzzing-target')) {
        displayName = displayName.replace('-fuzzing-target', '');
      }
      if (displayName.includes('-target')) {
        displayName = displayName.replace('-target', '');
      }
      if (displayName.match(/-\d+\.\d+\.\d+/)) {
        displayName = displayName.replace(/-\d+\.\d+\.\d+.*$/, '');
      }
      
      return {
        name: displayName,
        originalName: data.info.name,
        metrics: data.metrics,
        score: data.score,
        relativeToBaseline,
        rank: index + 1,
        benchmarkScores: data.benchmarkScores
      };
    });
    
    aggregatedData[version] = {
      version,
      baseline: 'polkajam', // Always use 'polkajam' as baseline after renaming
      teams: teamsList,
      timestamp: Date.now(),
      methodology: {
        description: 'Weighted scoring system that considers full performance distribution',
        weights: {
          p50: 0.35,  // Median is most important (typical performance)
          p90: 0.25,  // 90th percentile shows consistency
          mean: 0.20, // Average performance
          p99: 0.10,  // Tail latency
          stdDev: 0.10 // Consistency (normalized)
        },
        aggregation: 'Geometric mean across benchmarks for each metric, then weighted sum'
      }
    };
    
    console.log(`  Generated aggregated data for ${teamsList.length} teams`);
  }
  
  // Write aggregated data
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'aggregated-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(aggregatedData, null, 2));
  
  console.log(`\nGenerated aggregated data for ${Object.keys(aggregatedData).length} versions`);
  console.log(`Output: ${outputPath}`);
}

function calculateWeightedScore(benchmarks, benchmarkNames) {
  // Extract all metrics for each benchmark
  const allMetrics = {
    mean: [],
    p50: [],
    p90: [],
    p99: [],
    stdDev: [],
    min: [],
    max: []
  };
  
  const benchmarkScores = {};
  
  benchmarkNames.forEach(benchmark => {
    const stats = benchmarks[benchmark];
    allMetrics.mean.push(stats.import_mean);
    allMetrics.p50.push(stats.import_p50);
    allMetrics.p90.push(stats.import_p90);
    allMetrics.p99.push(stats.import_p99);
    allMetrics.stdDev.push(stats.import_std_dev);
    allMetrics.min.push(stats.import_min);
    allMetrics.max.push(stats.import_max);
    
    // Calculate individual benchmark score
    const normalizedStdDev = stats.import_std_dev / stats.import_mean; // Coefficient of variation
    benchmarkScores[benchmark] = {
      score: (0.35 * stats.import_p50) + 
             (0.25 * stats.import_p90) + 
             (0.20 * stats.import_mean) + 
             (0.10 * stats.import_p99) + 
             (0.10 * normalizedStdDev * stats.import_mean), // Penalize high variance
      metrics: {
        mean: stats.import_mean,
        p50: stats.import_p50,
        p90: stats.import_p90,
        p99: stats.import_p99,
        stdDev: stats.import_std_dev,
        min: stats.import_min,
        max: stats.import_max
      }
    };
  });
  
  // Calculate geometric means for each metric
  // Filter out zero values completely - they're likely incorrect measurements
  const geometricMean = (arr) => {
    const filtered = arr.filter(v => v > 0);
    if (filtered.length === 0) return 0;
    const product = filtered.reduce((a, b) => a * b, 1);
    return Math.pow(product, 1 / filtered.length);
  };
  const arithmeticMean = (arr) => {
    const filtered = arr.filter(v => v > 0);
    if (filtered.length === 0) return 0;
    return filtered.reduce((a, b) => a + b, 0) / filtered.length;
  };
  
  const aggregatedMetrics = {
    mean: geometricMean(allMetrics.mean),
    p50: geometricMean(allMetrics.p50),
    p90: geometricMean(allMetrics.p90),
    p99: geometricMean(allMetrics.p99),
    stdDev: arithmeticMean(allMetrics.stdDev), // Use arithmetic mean for std dev
    min: geometricMean(allMetrics.min),
    max: geometricMean(allMetrics.max)
  };
  
  // Calculate normalized standard deviation (coefficient of variation)
  const normalizedStdDev = aggregatedMetrics.stdDev / aggregatedMetrics.mean;
  
  // Calculate weighted score
  // Lower score is better
  // If any critical metric is 0 (all values were filtered), use the mean as fallback
  const weightedScore = 
    (0.35 * (aggregatedMetrics.p50 || aggregatedMetrics.mean)) +     // 35% weight on median (typical performance)
    (0.25 * (aggregatedMetrics.p90 || aggregatedMetrics.mean)) +     // 25% weight on 90th percentile
    (0.20 * aggregatedMetrics.mean) +    // 20% weight on mean
    (0.10 * (aggregatedMetrics.p99 || aggregatedMetrics.mean)) +     // 10% weight on 99th percentile
    (0.10 * normalizedStdDev * aggregatedMetrics.mean); // 10% weight on consistency
  
  return {
    score: weightedScore,
    metrics: aggregatedMetrics,
    benchmarkScores
  };
}

generateAggregatedData().catch(console.error);