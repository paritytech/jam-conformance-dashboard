export const UI_CONFIG = {
  animation: {
    stagger: 0.02,
    shortDuration: 0.3,
    mediumDuration: 0.5,
    longDuration: 0.8,
    spring: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  
  layout: {
    containerPadding: 'px-4',
    sectionSpacing: 'mb-12',
    gridGap: 'gap-8',
    mainGridCols: {
      mobile: 'grid-cols-1',
      desktop: 'lg:grid-cols-3'
    },
    mainContentCols: 'lg:col-span-2',
    sidebarCols: 'lg:col-span-1'
  },
  
  typography: {
    mainTitle: 'text-5xl md:text-6xl font-black',
    subtitle: 'text-lg md:text-xl font-light tracking-wide uppercase',
    sectionTitle: 'text-2xl font-bold',
    tableHeader: 'text-xs font-medium uppercase tracking-wider',
    monospace: 'font-mono text-sm'
  },
  
  colors: {
    background: '#000000',
    cardBg: 'bg-slate-900/80',
    border: 'border-slate-700',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-400',
    textTertiary: 'text-slate-500',
    link: 'text-cyan-400',
    linkHover: 'text-cyan-300'
  }
};