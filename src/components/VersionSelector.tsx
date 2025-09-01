'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface VersionSelectorProps {
  versions: string[];
  currentVersion: string;
  onVersionChange: (version: string) => void;
}

export function VersionSelector({ versions, currentVersion, onVersionChange }: VersionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white hover:bg-white/5 transition-colors"
      >
        <span className="text-sm">Version</span>
        <span className="font-mono font-semibold">{currentVersion}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl overflow-hidden z-50"
        >
          {versions.map((version) => (
            <button
              key={version}
              onClick={() => {
                onVersionChange(version);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-white/10 transition-colors ${
                version === currentVersion
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-white/70'
              }`}
            >
              <span className="font-mono text-sm">{version}</span>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}