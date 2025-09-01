const fs = require('fs');
const path = require('path');

async function generatePerformanceData() {
  const version = '0.7.0';
  const metric = 'safrole';
  const baseline = 'polkajam';
  
  const reportsPath = path.join(__dirname, '..', '..', 'fuzz-reports', version, 'reports');
  const teams = fs.readdirSync(reportsPath).filter(team => {
    const perfPath = path.join(reportsPath, team, 'perf');
    return fs.existsSync(perfPath) && fs.statSync(perfPath).isDirectory();
  });
  
  const performanceData = {};
  
  for (const team of teams) {
    const perfPath = path.join(reportsPath, team, 'perf', `${metric}.json`);
    const perfIntPath = path.join(reportsPath, team, 'perf_int', `${metric}.json`);
    
    try {
      // Try perf_int first (for polkajam), then regular perf
      if (fs.existsSync(perfIntPath)) {
        const content = fs.readFileSync(perfIntPath, 'utf-8');
        const data = JSON.parse(content);
        performanceData[`${team}_perf_int`] = data;
      }
      
      if (fs.existsSync(perfPath)) {
        const content = fs.readFileSync(perfPath, 'utf-8');
        const data = JSON.parse(content);
        performanceData[team] = data;
      }
    } catch (error) {
      console.error(`Error loading data for ${team}:`, error);
    }
  }
  
  // Calculate leaderboard
  const baselineData = performanceData[baseline];
  if (!baselineData) {
    throw new Error(`Baseline team ${baseline} not found`);
  }
  
  const teamsList = Object.entries(performanceData)
    .filter(([key, report]) => {
      // Filter out teams with zero or invalid values for critical metrics
      return report.stats.import_mean > 0 && 
             report.stats.import_p50 > 0 && 
             report.stats.import_p90 > 0;
    })
    .map(([key, report]) => {
      const relativeToBaseline = report.stats.import_mean / baselineData.stats.import_mean;
      
      return {
        name: report.info.name,
        metrics: {
          mean: report.stats.import_mean,
          p50: report.stats.import_p50,
          p90: report.stats.import_p90,
          p99: report.stats.import_p99,
          max: report.stats.import_max,
          min: report.stats.import_min,
          stdDev: report.stats.import_std_dev
        },
        relativeToBaseline,
        rank: 0
      };
    });
  
  // Sort by mean performance (lower is better)
  teamsList.sort((a, b) => a.metrics.mean - b.metrics.mean);
  
  // Assign ranks
  teamsList.forEach((team, index) => {
    team.rank = index + 1;
  });
  
  const output = {
    version,
    baseline,
    teams: teamsList,
    timestamp: Date.now()
  };
  
  // Write to data file
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'performance-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  console.log(`Generated performance data for ${teamsList.length} teams`);
  console.log(`Baseline: ${baseline}`);
  console.log(`Output: ${outputPath}`);
}

generatePerformanceData().catch(console.error);