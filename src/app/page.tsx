'use client';

import { useState, useEffect } from 'react';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { AuditTimeCalculator } from '@/components/AuditTimeCalculator';
import { PerformanceChartEnhanced } from '@/components/PerformanceChartEnhanced';
import { VersionSelector } from '@/components/VersionSelector';
import { BenchmarkTabs } from '@/components/BenchmarkTabs';
import { BenchmarkHeatmap } from '@/components/BenchmarkHeatmap';
import { BenchmarkInfo } from '@/components/BenchmarkInfo';
import { MethodologyExplainer } from '@/components/MethodologyExplainer';
import { Info } from 'lucide-react';
import allBenchmarksData from '@/data/all-benchmarks-data.json';
import aggregatedData from '@/data/aggregated-data.json';
import clientMetadata from '@/data/client-metadata.json';
import sourceInfo from '@/data/source-info.json';
import { APP_CONFIG } from '@/config';
import { enrichTeamWithMetadata } from '@/lib/team-utils';

export default function Home() {
  const versions = Object.keys(aggregatedData).sort().reverse();
  const [currentVersion, setCurrentVersion] = useState(versions[0] || APP_CONFIG.defaultVersion);
  const [currentBenchmark, setCurrentBenchmark] = useState(''); // No benchmark selected by default - show main leaderboard

  // Get the base path for assets
  const basePath = APP_CONFIG.paths.basePath;

  useEffect(() => {
    // Reset to overview when version changes
    setCurrentBenchmark('');
  }, [currentVersion]);
  
  // Use aggregated data for overview
  const overviewData = aggregatedData[currentVersion as keyof typeof aggregatedData] || aggregatedData[APP_CONFIG.defaultVersion as keyof typeof aggregatedData];
  const fastestTeam = overviewData.teams[0];
  const baselineTeam = overviewData.teams.find(t => t.name === overviewData.baseline);
  const slowestTeam = overviewData.teams[overviewData.teams.length - 1];
  
  // Enrich team data with metadata
  const enrichedTeams = overviewData.teams.map((team: any) => enrichTeamWithMetadata(team));
  
  // Check if we have benchmark data for current version
  const hasBenchmarkData = (allBenchmarksData as any)[currentVersion] && Object.keys((allBenchmarksData as any)[currentVersion]).length > 0;
  
  return (
    <main className="min-h-screen" style={{ backgroundImage: `url(${basePath}${APP_CONFIG.paths.backgroundImage})`, backgroundRepeat: 'repeat', backgroundSize: '1024px 1059px', backgroundColor: '#000000' }}>
      {/* Background effects */}
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12">
          {/* Header with Version Selector */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-12">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <h1 className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tighter">
                JAM
              </h1>
              <p className="text-lg md:text-xl text-slate-400 font-light tracking-wide uppercase">
                Conformance Performance
              </p>
            </div>
            <div className="flex-shrink-0">
              <VersionSelector
                versions={versions}
                currentVersion={currentVersion}
                onVersionChange={setCurrentVersion}
              />
            </div>
          </div>

          {/* Only show benchmark tabs if we have benchmark data */}
          {hasBenchmarkData && (
            <div className="mb-8">
              <BenchmarkTabs 
                currentBenchmark={currentBenchmark} 
                onBenchmarkChange={setCurrentBenchmark} 
              />
            </div>
          )}

          {/* Conditional Content based on selected benchmark */}
          {!currentBenchmark || !hasBenchmarkData ? (
            /* Regular Overview - Default main leaderboard view */
            <>
              {/* Info Box */}
              <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-100">
                    <p className="font-semibold mb-1">Important Note</p>
                    <p>This leaderboard highlights performance discrepancies between JAM implementations. 
                    All implementations are works in progress and none are fully conformant yet. 
                    The rankings serve to track relative performance improvements over time.</p>
                  </div>
                </div>
              </div>

              {/* Performance Chart at the top */}
              <div className="mb-12">
                <PerformanceChartEnhanced teams={enrichedTeams} baseline={overviewData.baseline} timestamp={overviewData.timestamp} />
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2">
                  <LeaderboardTable teams={enrichedTeams} baseline={overviewData.baseline} />
                </div>
                
                <div className="lg:col-span-1">
                  <AuditTimeCalculator teams={enrichedTeams} baseline={overviewData.baseline} />
                </div>
              </div>

              {/* Methodology Explainer - Full Width */}
              <div className="w-full">
                <MethodologyExplainer methodology={overviewData.methodology} />
              </div>
            </>
          ) : currentBenchmark === 'heatmap' ? (
            /* Benchmark Heatmap View */
            <div className="mb-12">
              <BenchmarkHeatmap 
                benchmarkData={(allBenchmarksData as any)[currentVersion]} 
                version={currentVersion}
              />
            </div>
          ) : (allBenchmarksData as any)[currentVersion]?.[currentBenchmark] ? (
            /* Individual Benchmark View */
            <>
              {/* Benchmark Description */}
              <BenchmarkInfo benchmark={currentBenchmark} />
              
              {/* Performance Chart for specific benchmark */}
              <div className="mb-12">
                <PerformanceChartEnhanced 
                  teams={(allBenchmarksData as any)[currentVersion][currentBenchmark].teams.map((team: any) => enrichTeamWithMetadata(team))} 
                  baseline={(allBenchmarksData as any)[currentVersion][currentBenchmark].baseline}
                  timestamp={(allBenchmarksData as any)[currentVersion][currentBenchmark].timestamp} 
                />
              </div>
              
              {/* Main Content for specific benchmark */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <LeaderboardTable 
                    teams={(allBenchmarksData as any)[currentVersion][currentBenchmark].teams.map((team: any) => enrichTeamWithMetadata(team))} 
                    baseline={(allBenchmarksData as any)[currentVersion][currentBenchmark].baseline} 
                  />
                </div>
                
                <div className="lg:col-span-1">
                  <AuditTimeCalculator 
                    teams={(allBenchmarksData as any)[currentVersion][currentBenchmark].teams.map((team: any) => enrichTeamWithMetadata(team))} 
                    baseline={(allBenchmarksData as any)[currentVersion][currentBenchmark].baseline} 
                  />
                </div>
              </div>
            </>
          ) : null}

          {/* Footer */}
          <div className="mt-16 text-center text-sm text-slate-500">
            <p>
              Performance data updated regularly. Version: {currentVersion}
              {overviewData.timestamp && (
                <span className="ml-2">
                  | Last updated: {new Date(overviewData.timestamp).toLocaleString('en-US', { 
                    dateStyle: 'medium', 
                    timeStyle: 'short' 
                  })}
                </span>
              )}
              {sourceInfo.source?.commitDate && sourceInfo.source.commitHash !== 'placeholder' && (
                <span className="ml-2">
                  | Source data from: {new Date(sourceInfo.source.commitDate).toLocaleString('en-US', { 
                    dateStyle: 'medium' 
                  })}
                </span>
              )}
            </p>
            <p className="mt-2">
              Testing protocol conformance at scale. Learn more at{' '}
              <a 
                href={APP_CONFIG.externalLinks.jamConformance} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                jam-conformance
              </a>
              {' '}|{' '}
              <a 
                href={sourceInfo.source?.sourceUrl || `${APP_CONFIG.externalLinks.jamConformance}/commits/main`} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
                title={sourceInfo.source?.commitMessage || 'View latest commits'}
              >
                {sourceInfo.source?.commitHash ? `Commit ${sourceInfo.source.commitHash.slice(0, 7)}` : 'Latest commits'}
              </a>
              {' '}|{' '}
              <a 
                href={APP_CONFIG.externalLinks.graypaperClients} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                View all clients
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}