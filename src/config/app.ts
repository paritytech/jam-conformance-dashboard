export const APP_CONFIG = {
  defaultVersion: '0.7.0',
  
  benchmarks: {
    available: ['safrole', 'fallback', 'storage', 'storage_light'],
    displayNames: {
      safrole: 'Safrole',
      fallback: 'Fallback',
      storage: 'Storage',
      storage_light: 'Storage Light'
    }
  },
  
  externalLinks: {
    jamConformance: 'https://github.com/davxy/jam-conformance',
    graypaperClients: 'https://graypaper.com/clients/'
  },
  
  paths: {
    basePath: process.env.NODE_ENV === 'production' ? '/jam-conformance-dashboard' : '',
    backgroundImage: '/background.webp'
  },
  
  data: {
    fileReadLimit: 2000,
    maxCharactersPerLine: 2000
  }
};