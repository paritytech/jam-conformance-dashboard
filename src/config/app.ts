export const APP_CONFIG = {
  defaultVersion: '0.7.0',
  
  benchmarks: {
    available: ['safrole', 'fallback', 'storage', 'storage_light'],
    displayNames: {
      safrole: 'Safrole',
      fallback: 'Fallback',
      storage: 'Storage',
      storage_light: 'Storage Light'
    },
    descriptions: {
      safrole: 'Safrole block authoring, no work reports',
      fallback: 'Fallback block authoring, no safrole, no work reports',
      storage: 'No safrole, storage related reports (read/write). At most 5 storage-related work items per report.',
      storage_light: 'No safrole, storage related reports (read/write). At most 1 storage-related work item per report.'
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