'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface Props {
  value?: number;
  onChange?: (rating: number) => void;
  label?: string;
  disabled?: boolean;
}

export default function RatingStars({ value = 0, onChange, label, disabled = false }: Props) {
  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-slate-700">{label}</p>}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => !disabled && onChange?.(rating)}
            disabled={disabled}
            className={`rounded-lg p-1 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            aria-label={`${label || 'Rating'} ${rating}`}
          >
            <Star
              className={`h-5 w-5 ${rating <= Number(value || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
