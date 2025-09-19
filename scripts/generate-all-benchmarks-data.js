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
            // Special handling for polkajam: perf version is the recompiler
            if (team === 'polkajam') {
              // Handle both old and new format
              if (data.info.app_name !== undefined) {
                data.info.app_name = 'polkajam (recompiler)';
              } else if (data.info.name !== undefined) {
                data.info.name = 'polkajam (recompiler)';
              }
            }
            performanceData[team] = data;
          }
          
          // Load interpreted version separately
          if (fs.existsSync(perfIntPath)) {
            const content = fs.readFileSync(perfIntPath, 'utf-8');
            const data = JSON.parse(content);
            // For polkajam, the interpreted version is the main one
            if (team === 'polkajam') {
              // Don't add (interpreted) suffix for polkajam
              performanceData[`${team}_interpreted`] = data;
            } else {
              // Handle both old and new format
              const teamName = data.info.app_name || data.info.name || team;
              if (data.info.app_name !== undefined) {
                data.info.app_name = `${teamName} (interpreted)`;
              } else if (data.info.name !== undefined) {
                data.info.name = `${teamName} (interpreted)`;
              }
              performanceData[`${team}_interpreted`] = data;
            }
          }
        } catch (error) {
          console.error(`    Error loading data for ${team}:`, error.message);
        }
      }
      
      // Sort teams by performance to find the fastest (excluding zero values)
      const sortedTeams = Object.entries(performanceData)
        .filter(([,report]) => 
          report.stats.import_mean > 0 && 
          report.stats.import_p50 > 0 && 
          report.stats.import_p90 > 0
        )
        .sort(([,a], [,b]) => 
          a.stats.import_mean - b.stats.import_mean
        );
      
      if (sortedTeams.length === 0) {
        console.log(`    No teams with complete data for ${benchmark}`);
        continue;
      }
      
      // Find polkajam (interpreted) to use as baseline
      let baselineData = null;
      let baseline = 'polkajam';
      
      // Look for polkajam_interpreted first
      const polkajamInterpreted = Object.entries(performanceData).find(([key, data]) => 
        key === 'polkajam_interpreted'
      );
      
      if (polkajamInterpreted) {
        baselineData = polkajamInterpreted[1];
        baseline = 'polkajam';
      } else {
        // Fallback to fastest team if polkajam not found
        console.warn(`    Warning: polkajam not found for ${benchmark}, using fastest team as baseline`);
        const [fastestTeamKey, fastestData] = sortedTeams[0];
        baselineData = fastestData;
        baseline = fastestData.info.app_name || fastestData.info.name;
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
          
          // Use the name we already set (which includes our polkajam naming)
          let displayName = report.info.app_name || report.info.name || 'unknown';
          
          // Only clean up non-polkajam team names
          if (!displayName.includes('polkajam')) {
            if (displayName.includes('-fuzzing-target')) {
              displayName = displayName.replace('-fuzzing-target', '');
            }
            if (displayName.includes('-target')) {
              displayName = displayName.replace('-target', '');
            }
            if (displayName.match(/-\d+\.\d+\.\d+/)) {
              displayName = displayName.replace(/-\d+\.\d+\.\d+.*$/, '');
            }
          }
          
          return {
            name: displayName,
            originalName: report.info.app_name || report.info.name || 'unknown',
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