'use client';

import { useState } from 'react';

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex items-center"
      >
        {children}
        <span className="ml-1 text-gray-400 hover:text-gray-600 cursor-help">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
      </div>
      {isVisible && (
        <div className="absolute z-10 w-64 px-4 py-2 mt-2 text-sm text-gray-600 bg-white border rounded shadow-lg">
          {content}
        </div>
      )}
    </div>
  );
}

export function Slider({ 
  label, 
  value, 
  onChange, 
  min, 
  max, 
  step = 1000,
  tooltip
}: { 
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  tooltip?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          {tooltip ? (
            <Tooltip content={tooltip}>{label}</Tooltip>
          ) : (
            label
          )}
        </label>
        <span className="text-sm text-gray-500">
          ${value.toLocaleString()}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
}