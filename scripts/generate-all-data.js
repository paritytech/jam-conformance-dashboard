const fs = require('fs');
const path = require('path');

async function generateAllVersionsData() {
  const fuzzReportsPath = path.join(__dirname, '..', '..', 'fuzz-reports');
  const versions = fs.readdirSync(fuzzReportsPath).filter(v => v.match(/^\d+\.\d+\.\d+$/));
  
  const allVersionsData = {};
  
  for (const version of versions) {
    console.log(`Processing version ${version}...`);
    
    const metric = 'safrole';
    let baseline = 'polkajam';
    
    const reportsPath = path.join(fuzzReportsPath, version, 'reports');
    
    if (!fs.existsSync(reportsPath)) {
      console.log(`  No reports directory for version ${version}`);
      continue;
    }
    
    const teams = fs.readdirSync(reportsPath).filter(team => {
      const perfPath = path.join(reportsPath, team, 'perf');
      return fs.existsSync(perfPath) && fs.statSync(perfPath).isDirectory();
    });
    
    const performanceData = {};
    
    for (const team of teams) {
      const perfPath = path.join(reportsPath, team, 'perf', `${metric}.json`);
      const perfIntPath = path.join(reportsPath, team, 'perf_int', `${metric}.json`);
      
      try {
        // Check for all required perf files
        const requiredMetrics = ['safrole', 'fallback', 'storage', 'storage_light'];
        let hasAllMetrics = true;
        let teamData = {};
        
        // Try perf_int first (for polkajam), then regular perf
        if (fs.existsSync(perfIntPath)) {
          // Check if perf_int has all required metrics
          hasAllMetrics = requiredMetrics.every(m => 
            fs.existsSync(path.join(reportsPath, team, 'perf_int', `${m}.json`))
          );
          
          if (hasAllMetrics) {
            const content = fs.readFileSync(perfIntPath, 'utf-8');
            const data = JSON.parse(content);
            // Mark this as interpreted version, not performance
            data.info.name = `${data.info.name} (interpreted)`;
            performanceData[`${team}_interpreted`] = data;
          }
        }
        
        // Check regular perf
        hasAllMetrics = requiredMetrics.every(m => 
          fs.existsSync(path.join(reportsPath, team, 'perf', `${m}.json`))
        );
        
        if (hasAllMetrics && fs.existsSync(perfPath)) {
          const content = fs.readFileSync(perfPath, 'utf-8');
          const data = JSON.parse(content);
          performanceData[team] = data;
        }
      } catch (error) {
        console.error(`  Error loading data for ${team}:`, error.message);
      }
    }
    
    // Sort teams by performance to find the fastest
    const sortedTeams = Object.entries(performanceData).sort(([,a], [,b]) => 
      a.stats.import_mean - b.stats.import_mean
    );
    
    if (sortedTeams.length === 0) {
      console.log(`  No teams with complete data for version ${version}`);
      continue;
    }
    
    // Use the fastest team as baseline
    const [fastestTeamKey, baselineData] = sortedTeams[0];
    baseline = baselineData.info.name;
    
    const teamsList = Object.entries(performanceData).map(([key, report]) => {
      // Calculate relative performance (how many times slower than baseline)
      // If baseline mean is 5ms and this team is 10ms, they are 2x slower
      const relativeToBaseline = report.stats.import_mean / baselineData.stats.import_mean;
      
      // Validate the stats make sense
      if (report.stats.import_p50 > report.stats.import_p90) {
        console.warn(`  Warning: ${report.info.name} has P50 > P90`);
      }
      if (report.stats.import_p90 > report.stats.import_p99) {
        console.warn(`  Warning: ${report.info.name} has P90 > P99`);
      }
      
      // Clean up the name for display
      let displayName = report.info.name;
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
        originalName: report.info.name,
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
    
    allVersionsData[version] = {
      version,
      baseline,
      teams: teamsList,
      timestamp: Date.now()
    };
    
    console.log(`  Generated data for ${teamsList.length} teams`);
  }
  
  // Write all versions data
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'all-versions-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(allVersionsData, null, 2));
  
  // Also update the current performance-data.json with the latest version
  const latestVersion = versions.sort().reverse()[0];
  if (allVersionsData[latestVersion]) {
    const performanceDataPath = path.join(__dirname, '..', 'src', 'data', 'performance-data.json');
    fs.writeFileSync(performanceDataPath, JSON.stringify(allVersionsData[latestVersion], null, 2));
  }
  
  console.log(`\nGenerated data for ${Object.keys(allVersionsData).length} versions`);
  console.log(`Versions: ${Object.keys(allVersionsData).join(', ')}`);
  console.log(`Output: ${outputPath}`);
}

generateAllVersionsData().catch(console.error);