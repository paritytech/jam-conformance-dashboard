const fs = require('fs');
const path = require('path');

async function generateAllBenchmarksData() {
  const fuzzReportsPath = path.join(__dirname, '..', '..', 'fuzz-reports');
  const versions = fs.readdirSync(fuzzReportsPath).filter(v => v.match(/^\d+\.\d+\.\d+$/));
  const benchmarks = ['safrole', 'fallback', 'storage', 'storage_light'];
  
  const allBenchmarksData = {};
  
  for (const version of versions) {
    console.log(`Processing version ${version}...`);
    allBenchmarksData[version] = {};
    
    for (const benchmark of benchmarks) {
      console.log(`  Processing benchmark ${benchmark}...`);
      
      const reportsPath = path.join(fuzzReportsPath, version, 'reports');
      
      if (!fs.existsSync(reportsPath)) {
        console.log(`    No reports directory for version ${version}`);
        continue;
      }
      
      const teams = fs.readdirSync(reportsPath).filter(team => {
        const perfPath = path.join(reportsPath, team, 'perf');
        return fs.existsSync(perfPath) && fs.statSync(perfPath).isDirectory();
      });
      
      const performanceData = {};
      
      for (const team of teams) {
        const perfPath = path.join(reportsPath, team, 'perf', `${benchmark}.json`);
        const perfIntPath = path.join(reportsPath, team, 'perf_int', `${benchmark}.json`);
        
        try {
          // Check if this team has all required metrics
          const requiredMetrics = ['safrole', 'fallback', 'storage', 'storage_light'];
          const hasAllMetrics = requiredMetrics.every(m => 
            fs.existsSync(path.join(reportsPath, team, 'perf', `${m}.json`)) ||
            fs.existsSync(path.join(reportsPath, team, 'perf_int', `${m}.json`))
          );
          
          if (!hasAllMetrics) {
            continue; // Skip teams without all benchmarks
          }
          
          // Load both perf and perf_int versions if they exist
          if (fs.existsSync(perfPath)) {
            const content = fs.readFileSync(perfPath, 'utf-8');
            const data = JSON.parse(content);
            performanceData[team] = data;
          }
          
          // Load interpreted version separately
          if (fs.existsSync(perfIntPath)) {
            const content = fs.readFileSync(perfIntPath, 'utf-8');
            const data = JSON.parse(content);
            data.info.name = `${data.info.name} (interpreted)`;
            performanceData[`${team}_interpreted`] = data;
          }
        } catch (error) {
          console.error(`    Error loading data for ${team}:`, error.message);
        }
      }
      
      // Sort teams by performance to find the fastest
      const sortedTeams = Object.entries(performanceData).sort(([,a], [,b]) => 
        a.stats.import_mean - b.stats.import_mean
      );
      
      if (sortedTeams.length === 0) {
        console.log(`    No teams with complete data for ${benchmark}`);
        continue;
      }
      
      // Use the fastest team as baseline
      const [fastestTeamKey, baselineData] = sortedTeams[0];
      const baseline = baselineData.info.name;
      
      const teamsList = Object.entries(performanceData).map(([key, report]) => {
        const relativeToBaseline = report.stats.import_mean / baselineData.stats.import_mean;
        
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
      
      allBenchmarksData[version][benchmark] = {
        version,
        benchmark,
        baseline,
        teams: teamsList,
        timestamp: Date.now()
      };
      
      console.log(`    Generated data for ${teamsList.length} teams`);
    }
  }
  
  // Write all benchmarks data
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'all-benchmarks-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(allBenchmarksData, null, 2));
  
  console.log(`\nGenerated data for ${Object.keys(allBenchmarksData).length} versions`);
  console.log(`Output: ${outputPath}`);
}

generateAllBenchmarksData().catch(console.error);