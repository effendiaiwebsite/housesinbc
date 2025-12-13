/**
 * Slider Component
 *
 * Custom slider component for quiz inputs
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onValueChange?: (value: number) => void;
  formatValue?: (value: number) => string;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min = 0, max = 100, step = 1, value = 50, onValueChange, formatValue, ...props }, ref) => {
    const percentage = ((value - min) / (max - min)) * 100;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      onValueChange?.(newValue);
    };

    return (
      <div className="w-full space-y-2">
        {/* Value display */}
        <div className="text-center">
          <span className="text-2xl font-bold text-blue-600">
            {formatValue ? formatValue(value) : value.toLocaleString()}
          </span>
        </div>

        {/* Slider track */}
        <div className="relative w-full">
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleChange}
            className={cn(
              'w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer',
              '[&::-webkit-slider-thumb]:appearance-none',
              '[&::-webkit-slider-thumb]:w-6',
              '[&::-webkit-slider-thumb]:h-6',
              '[&::-webkit-slider-thumb]:rounded-full',
              '[&::-webkit-slider-thumb]:bg-blue-600',
              '[&::-webkit-slider-thumb]:cursor-pointer',
              '[&::-webkit-slider-thumb]:shadow-lg',
              '[&::-webkit-slider-thumb]:hover:bg-blue-700',
              '[&::-moz-range-thumb]:w-6',
              '[&::-moz-range-thumb]:h-6',
              '[&::-moz-range-thumb]:rounded-full',
              '[&::-moz-range-thumb]:bg-blue-600',
              '[&::-moz-range-thumb]:border-0',
              '[&::-moz-range-thumb]:cursor-pointer',
              '[&::-moz-range-thumb]:shadow-lg',
              '[&::-moz-range-thumb]:hover:bg-blue-700',
              className
            )}
            style={{
              background: `linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${percentage}%, rgb(229, 231, 235) ${percentage}%, rgb(229, 231, 235) 100%)`,
            }}
            {...props}
          />
        </div>

        {/* Min/Max labels */}
        <div className="flex justify-between text-sm text-gray-500">
          <span>{formatValue ? formatValue(min) : min.toLocaleString()}</span>
          <span>{formatValue ? formatValue(max) : max.toLocaleString()}</span>
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };
