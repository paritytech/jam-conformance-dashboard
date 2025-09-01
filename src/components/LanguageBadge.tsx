interface LanguageBadgeProps {
  language?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LanguageBadge({ language, color, size = 'sm' }: LanguageBadgeProps) {
  if (!language) return null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-slate-800/50 border border-slate-700/50 ${sizeClasses[size]}`}
    >
      {color && (
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      <span className="text-slate-300">{language}</span>
    </span>
  );
}