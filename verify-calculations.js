const fs = require('fs');
const path = require('path');

// Load generated data
const performanceData = JSON.parse(fs.readFileSync('src/data/performance-data.json', 'utf-8'));
const allBenchmarksData = JSON.parse(fs.readFileSync('src/data/all-benchmarks-data.json', 'utf-8'));

console.log('=== Verifying Performance Data Calculations ===\n');

// 1. Verify baseline selection
console.log('1. BASELINE SELECTION CHECK');
console.log(`Current baseline: ${performanceData.baseline}`);
console.log(`Baseline mean: ${performanceData.teams[0].metrics.mean}`);

// Check if baseline is actually the fastest
const sortedByMean = [...performanceData.teams].sort((a, b) => a.metrics.mean - b.metrics.mean);
console.log(`Fastest team by mean: ${sortedByMean[0].name} (${sortedByMean[0].metrics.mean})`);
console.log(`Baseline correct: ${sortedByMean[0].name === performanceData.baseline ? 'YES' : 'NO'}`);
console.log('');

// 2. Verify relative performance calculations
console.log('2. RELATIVE PERFORMANCE CALCULATIONS');
const baselineMean = performanceData.teams.find(t => t.name === performanceData.baseline).metrics.mean;
console.log(`Baseline mean for calculations: ${baselineMean}`);
console.log('');

let calculationErrors = 0;
performanceData.teams.slice(0, 10).forEach(team => {
  const calculated = team.metrics.mean / baselineMean;
  const stored = team.relativeToBaseline;
  const diff = Math.abs(calculated - stored);
  
  console.log(`Team: ${team.name}`);
  console.log(`  Mean: ${team.metrics.mean}`);
  console.log(`  Stored relative: ${stored}`);
  console.log(`  Calculated relative: ${calculated}`);
  console.log(`  Match: ${diff < 0.0001 ? '✓' : '✗ DIFFERENCE: ' + diff}`);
  
  if (diff >= 0.0001) calculationErrors++;
  console.log('');
});

// 3. Verify percentile ordering
console.log('3. PERCENTILE ORDERING CHECK');
let orderingErrors = 0;
performanceData.teams.forEach(team => {
  if (team.metrics.p50 > team.metrics.p90) {
    console.log(`ERROR: ${team.name} has P50 (${team.metrics.p50}) > P90 (${team.metrics.p90})`);
    orderingErrors++;
  }
  if (team.metrics.p90 > team.metrics.p99) {
    console.log(`ERROR: ${team.name} has P90 (${team.metrics.p90}) > P99 (${team.metrics.p99})`);
    orderingErrors++;
  }
  if (team.metrics.min > team.metrics.max) {
    console.log(`ERROR: ${team.name} has min (${team.metrics.min}) > max (${team.metrics.max})`);
    orderingErrors++;
  }
});
console.log(`Percentile ordering errors: ${orderingErrors}`);
console.log('');

// 4. Verify ranking
console.log('4. RANKING VERIFICATION');
let rankingErrors = 0;
for (let i = 0; i < performanceData.teams.length; i++) {
  if (performanceData.teams[i].rank !== i + 1) {
    console.log(`ERROR: ${performanceData.teams[i].name} has rank ${performanceData.teams[i].rank}, expected ${i + 1}`);
    rankingErrors++;
  }
  if (i > 0 && performanceData.teams[i].metrics.mean < performanceData.teams[i-1].metrics.mean) {
    console.log(`ERROR: ${performanceData.teams[i].name} (mean: ${performanceData.teams[i].metrics.mean}) is ranked after ${performanceData.teams[i-1].name} (mean: ${performanceData.teams[i-1].metrics.mean})`);
    rankingErrors++;
  }
}
console.log(`Ranking errors: ${rankingErrors}`);
console.log('');

// 5. Verify audit time calculations
console.log('5. AUDIT TIME CALCULATION VERIFICATION');
const baselineDays = 3;
performanceData.teams.slice(0, 5).forEach(team => {
  const expectedAuditTime = baselineDays * team.relativeToBaseline;
  console.log(`${team.name}: ${expectedAuditTime.toFixed(2)} days (${team.relativeToBaseline.toFixed(2)}x baseline)`);
});
console.log('');

// 6. Cross-check with source data
console.log('6. SOURCE DATA VERIFICATION');
const version = performanceData.version;
const sourceDataPath = path.join(__dirname, '..', '..', 'fuzz-reports', version, 'reports');

// Check a few teams against source
const teamsToCheck = ['jampy', 'turbojam', 'polkajam'];
teamsToCheck.forEach(teamName => {
  try {
    const perfPath = path.join(sourceDataPath, teamName, 'perf', 'safrole.json');
    const perfIntPath = path.join(sourceDataPath, teamName, 'perf_int', 'safrole.json');
    
    let sourceData;
    if (fs.existsSync(perfIntPath) && teamName === 'polkajam') {
      sourceData = JSON.parse(fs.readFileSync(perfIntPath, 'utf-8'));
      console.log(`${teamName} (interpreted):`);
    } else if (fs.existsSync(perfPath)) {
      sourceData = JSON.parse(fs.readFileSync(perfPath, 'utf-8'));
      console.log(`${teamName}:`);
    }
    
    if (sourceData) {
      const generatedTeam = performanceData.teams.find(t => 
        t.originalName === teamName || t.originalName === `${teamName} (interpreted)`
      );
      
      if (generatedTeam) {
        console.log(`  Source mean: ${sourceData.stats.import_mean}`);
        console.log(`  Generated mean: ${generatedTeam.metrics.mean}`);
        console.log(`  Match: ${sourceData.stats.import_mean === generatedTeam.metrics.mean ? '✓' : '✗'}`);
      } else {
        console.log(`  ERROR: Team not found in generated data`);
      }
    }
  } catch (error) {
    console.log(`  Error reading source data: ${error.message}`);
  }
  console.log('');
});

// Summary
console.log('=== SUMMARY ===');
console.log(`Total teams: ${performanceData.teams.length}`);
console.log(`Calculation errors: ${calculationErrors}`);
console.log(`Ordering errors: ${orderingErrors}`);
console.log(`Ranking errors: ${rankingErrors}`);
console.log(`Overall status: ${(calculationErrors + orderingErrors + rankingErrors) === 0 ? '✓ ALL CHECKS PASSED' : '✗ ERRORS FOUND'}`);