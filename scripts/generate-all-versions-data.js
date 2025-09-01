const fs = require('fs');
const path = require('path');

async function generateAllVersionsData() {
  const fuzzReportsPath = path.join(__dirname, '..', '..', 'fuzz-reports');
  const versions = fs.readdirSync(fuzzReportsPath).filter(v => v.match(/^\d+\.\d+\.\d+$/));
  
  const allVersionsData = {};
  
  for (const version of versions) {
    console.log(`Processing version ${version}...`);
    
    const reportsPath = path.join(fuzzReportsPath, version, 'reports');
    const benchmark = 'safrole'; // Use safrole as the default benchmark for version comparison
    
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
      const perfPath = path.join(reportsPath, team, 'perf', `${benchmark}.json`);
      const perfIntPath = path.join(reportsPath, team, 'perf_int', `${benchmark}.json`);
      
      try {
        // Try perf_int first (for polkajam), then regular perf
        if (fs.existsSync(perfIntPath)) {
          const content = fs.readFileSync(perfIntPath, 'utf-8');
          const data = JSON.parse(content);
          // Don't rename here - let generate-data.js handle the naming
          performanceData[`${team}_perf_int`] = data;
        } else if (fs.existsSync(perfPath)) {
          const content = fs.readFileSync(perfPath, 'utf-8');
          const data = JSON.parse(content);
          performanceData[team] = data;
        }
      } catch (error) {
        console.error(`  Error loading data for ${team}:`, error.message);
      }
    }
    
    // Sort teams by performance
    const sortedTeams = Object.entries(performanceData).sort(([,a], [,b]) => 
      a.stats.import_mean - b.stats.import_mean
    );
    
    if (sortedTeams.length === 0) {
      console.log(`  No teams with data for version ${version}`);
      continue;
    }
    
    // Use the fastest team as baseline
    const [fastestTeamKey, baselineData] = sortedTeams[0];
    let baseline = baselineData.info.name;
    
    // Special handling for polkajam_perf_int
    if (fastestTeamKey === 'polkajam_perf_int') {
      baseline = 'polkajam';
    }
    
    const teamsList = Object.entries(performanceData).map(([key, report]) => {
      const relativeToBaseline = report.stats.import_mean / baselineData.stats.import_mean;
      
      return {
        name: report.info.name,
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
  
  console.log(`\nGenerated data for ${Object.keys(allVersionsData).length} versions`);
  console.log(`Output: ${outputPath}`);
}

generateAllVersionsData().catch(console.error);