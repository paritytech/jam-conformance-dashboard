const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to get git commit info from a directory
function getGitInfo(repoPath) {
  try {
    const commitHash = execSync('git rev-parse HEAD', { cwd: repoPath, encoding: 'utf8' }).trim();
    const commitDate = execSync('git log -1 --format=%cI', { cwd: repoPath, encoding: 'utf8' }).trim();
    const commitMessage = execSync('git log -1 --format=%s', { cwd: repoPath, encoding: 'utf8' }).trim();
    const commitAuthor = execSync('git log -1 --format=%an', { cwd: repoPath, encoding: 'utf8' }).trim();
    
    return {
      commitHash,
      commitDate,
      commitMessage,
      commitAuthor,
      sourceUrl: `https://github.com/davxy/jam-conformance/commit/${commitHash}`
    };
  } catch (error) {
    console.error('Error getting git info:', error);
    return null;
  }
}

// Main function
function captureSourceInfo() {
  const tempRepoPath = path.join(process.cwd(), 'temp-jam-conformance');
  const outputPath = path.join(process.cwd(), 'src', 'data', 'source-info.json');
  
  let sourceInfo = {
    lastUpdated: new Date().toISOString(),
    source: null
  };
  
  // Check if temp repo exists (should be cloned by workflow)
  if (fs.existsSync(tempRepoPath)) {
    const gitInfo = getGitInfo(tempRepoPath);
    if (gitInfo) {
      sourceInfo.source = gitInfo;
      console.log('Captured source info:', gitInfo);
    }
  } else {
    console.warn('temp-jam-conformance directory not found. Running locally?');
    // Try to get info from parent directory if fuzz-perf or fuzz-reports exists
    const fuzzPerfPath = path.join(process.cwd(), '..', 'fuzz-perf');
    const fuzzReportsPath = path.join(process.cwd(), '..', 'fuzz-reports');
    if (fs.existsSync(fuzzPerfPath) || fs.existsSync(fuzzReportsPath)) {
      const parentGitInfo = getGitInfo(path.join(process.cwd(), '..'));
      if (parentGitInfo) {
        sourceInfo.source = parentGitInfo;
        console.log('Captured source info from parent directory:', parentGitInfo);
      }
    }
  }
  
  // Ensure we always have some source info (use placeholder if nothing found)
  if (!sourceInfo.source) {
    sourceInfo.source = {
      commitHash: 'placeholder',
      commitDate: new Date().toISOString(),
      commitMessage: 'Local development - no source info available',
      commitAuthor: 'Unknown',
      sourceUrl: 'https://github.com/davxy/jam-conformance'
    };
  }
  
  // Write source info
  fs.writeFileSync(outputPath, JSON.stringify(sourceInfo, null, 2) + '\n');
  console.log('Source info written to:', outputPath);
}

// Run the script
captureSourceInfo();