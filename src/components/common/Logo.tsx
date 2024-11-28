import React from 'react';
import { Target } from 'lucide-react';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Target className="h-8 w-8 text-brand-600" />
      <span className="font-bold text-xl text-gray-900">JobTrackerHub</span>
    </div>
  );
}