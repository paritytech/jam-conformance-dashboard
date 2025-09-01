const fs = require('fs');
const path = require('path');

async function fetchClientMetadata() {
  try {
    console.log('Fetching client metadata from graypaper.com...');
    
    // Fetch the HTML page
    const response = await fetch('https://graypaper.com/clients/');
    const html = await response.text();
    
    // Parse client information from the HTML
    // This is a basic parser - adjust based on the actual HTML structure
    const clientData = {};
    
    // Look for client information patterns in the HTML
    const clientPattern = /<div[^>]*class="[^"]*client[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    const matches = html.matchAll(clientPattern);
    
    // Common client names we're looking for
    const knownClients = [
      'polkajam', 'turbojam', 'jamzig', 'tsjam', 'jamzilla', 'boka',
      'spacejam', 'jamduna', 'fastroll', 'javajam', 'pyjamaz', 'vinwolf',
      'jampy', 'jamixir'
    ];
    
    // Extract information for each client
    for (const clientName of knownClients) {
      // Look for client-specific information in the HTML
      const clientRegex = new RegExp(`(${clientName}[^<]*)<[^>]*>([^<]+)`, 'gi');
      const clientMatch = clientRegex.exec(html);
      
      if (clientMatch) {
        clientData[clientName] = {
          displayName: clientMatch[1].trim(),
          description: clientMatch[2]?.trim() || '',
          url: `https://graypaper.com/clients/#${clientName}`,
          // Add placeholder data - update based on actual HTML structure
          language: 'Unknown',
          author: 'Unknown',
          license: 'Unknown'
        };
      }
    }
    
    // Add some default metadata for known clients
    const defaultMetadata = {
      polkajam: {
        displayName: 'PolkaJam',
        description: 'Reference implementation',
        language: 'Rust',
        languageColor: '#dea584',
        author: 'Parity Technologies',
        license: 'GPL-3.0'
      },
      polkajam_interpreted: {
        displayName: 'PolkaJam (Interpreted)',
        description: 'Reference implementation (interpreted mode)',
        language: 'Rust',
        languageColor: '#dea584',
        author: 'Parity Technologies',
        license: 'GPL-3.0'
      },
      'polkajam (interpreted)': {
        displayName: 'PolkaJam (Interpreted)',
        description: 'Reference implementation (interpreted mode)',
        language: 'Rust',
        languageColor: '#dea584',
        author: 'Parity Technologies',
        license: 'GPL-3.0'
      },
      turbojam: {
        displayName: 'TurboJam',
        description: 'High-performance implementation',
        language: 'Rust',
        languageColor: '#dea584',
        author: 'Community',
        license: 'MIT'
      },
      jamzig: {
        displayName: 'JamZig',
        description: 'Zig-based implementation',
        language: 'Zig',
        languageColor: '#ec915c',
        author: 'Community',
        license: 'MIT'
      },
      tsjam: {
        displayName: 'TSJam',
        description: 'TypeScript implementation',
        language: 'TypeScript',
        languageColor: '#3178c6',
        author: 'Community',
        license: 'MIT'
      },
      boka: {
        displayName: 'Boka',
        description: 'Alternative implementation',
        language: 'Rust',
        languageColor: '#dea584',
        author: 'Community',
        license: 'MIT'
      },
      spacejam: {
        displayName: 'SpaceJam',
        description: 'Optimized implementation',
        language: 'C++',
        languageColor: '#f34b7d',
        author: 'Community',
        license: 'MIT'
      },
      jamduna: {
        displayName: 'JamDuna',
        description: 'Focus on correctness',
        language: 'Go',
        languageColor: '#00add8',
        author: 'Community',
        license: 'MIT'
      },
      'jam-duna': {
        displayName: 'JamDuna',
        description: 'Focus on correctness',
        language: 'Go',
        languageColor: '#00add8',
        author: 'Community',
        license: 'MIT'
      },
      fastroll: {
        displayName: 'FastRoll',
        description: 'Performance-focused',
        language: 'C',
        languageColor: '#555555',
        author: 'Community',
        license: 'MIT'
      },
      javajam: {
        displayName: 'JavaJAM',
        description: 'Java implementation',
        language: 'Java',
        languageColor: '#b07219',
        author: 'Community',
        license: 'Apache-2.0'
      },
      pyjamaz: {
        displayName: 'PyJAMaz',
        description: 'Python implementation',
        language: 'Python',
        languageColor: '#3572a5',
        author: 'Community',
        license: 'MIT'
      },
      vinwolf: {
        displayName: 'VinWolf',
        description: 'V language implementation',
        language: 'V',
        languageColor: '#5d87bf',
        author: 'Community',
        license: 'MIT'
      },
      jampy: {
        displayName: 'JamPy',
        description: 'Another Python implementation',
        language: 'Python',
        languageColor: '#3572a5',
        author: 'Community',
        license: 'MIT'
      },
      jamixir: {
        displayName: 'Jamixir',
        description: 'Elixir implementation',
        language: 'Elixir',
        languageColor: '#6e4a7e',
        author: 'Community',
        license: 'MIT'
      },
      jamzilla: {
        displayName: 'Jamzilla',
        description: 'Mozilla-inspired implementation',
        language: 'Rust',
        languageColor: '#dea584',
        author: 'Community',
        license: 'MPL-2.0'
      }
    };
    
    // Merge with defaults
    for (const [client, metadata] of Object.entries(defaultMetadata)) {
      clientData[client] = {
        ...metadata,
        ...clientData[client],
        url: clientData[client]?.url || `https://graypaper.com/clients/#${client}`
      };
    }
    
    // Write to data file
    const outputPath = path.join(__dirname, '..', 'src', 'data', 'client-metadata.json');
    fs.writeFileSync(outputPath, JSON.stringify(clientData, null, 2));
    
    console.log(`Fetched metadata for ${Object.keys(clientData).length} clients`);
    console.log(`Output: ${outputPath}`);
    
  } catch (error) {
    console.error('Error fetching client metadata:', error);
    // Create a default file if fetch fails
    const defaultPath = path.join(__dirname, '..', 'src', 'data', 'client-metadata.json');
    fs.writeFileSync(defaultPath, JSON.stringify({}, null, 2));
  }
}

fetchClientMetadata().catch(console.error);