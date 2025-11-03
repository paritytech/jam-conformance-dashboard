# JAM Conformance Performance Leaderboard

A performance benchmarking dashboard for JAM protocol implementations.

## Overview

This project provides a visual leaderboard for tracking and comparing the performance of different JAM protocol implementations. It automatically syncs benchmark data from the [jam-conformance](https://github.com/davxy/jam-conformance) repository and presents it in an interactive web interface.

## Features

- **Real-time Performance Tracking**: Displays up-to-date benchmark results across multiple JAM implementations
- **Multiple Benchmark Views**: Compare performance across Safrole, Fallback, Storage, and Storage Light benchmarks
- **Performance Visualization**: Interactive charts with linear/log scale options for large performance ranges
- **Audit Time Calculator**: Estimates audit duration based on implementation performance
- **Weighted Scoring System**: Comprehensive performance evaluation using p50, p90, mean, p99, and standard deviation metrics
- **Language Support**: Shows implementation languages with visual indicators
- **Version Selection**: Compare results across different JAM protocol versions

## Architecture

The project consists of:
- **Next.js 14** frontend with TypeScript
- **Tailwind CSS v4** for styling
- **Static Site Generation** for optimal performance
- **GitHub Actions** for automated data syncing and deployment

## Data Syncing

The performance data is automatically synced from the main jam-conformance repository via GitHub Actions:
- Runs hourly to fetch latest benchmark results
- Reads from both `fuzz-reports` (old versions) and `fuzz-perf` (latest versions) to preserve historical data
- Processes benchmark data into optimized JSON files
- Deploys updates to GitHub Pages

## Local Development

```bash
# Install dependencies
npm install

# Sync data from main repo (requires fuzz-perf and fuzz-reports in parent directory)
# fuzz-reports: contains old version data
# fuzz-perf: contains latest version data
npm run update-all-data

# Start development server
npm run dev
```

## Deployment

This project is designed to be deployed from a fork:

1. Fork this repository
2. Go to Settings > Pages
3. Under "Source", select "GitHub Actions"
4. The workflow will automatically:
   - Sync data from the main jam-conformance repo hourly
   - Build the static site
   - Deploy to GitHub Pages using the native v4 integration

The site will be available at `https://[your-username].github.io/[repo-name]/`

## Scoring Methodology

The leaderboard uses a weighted scoring system to evaluate overall performance:

- **35%** - P50 (Median): Typical performance
- **25%** - P90: Consistency under load
- **20%** - Mean: Average performance
- **10%** - P99: Tail latency handling
- **10%** - Standard Deviation: Performance consistency

Scores are aggregated using geometric mean across all four benchmark types.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project follows the same license as the jam-conformance repository.