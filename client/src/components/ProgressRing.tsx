/**
 * Progress Ring Component
 *
 * Circular progress indicator with percentage display
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export default function ProgressRing({
  progress,
  size = 200,
  strokeWidth = 12,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  // Color based on progress
  const getColor = () => {
    if (progress >= 75) return '#10b981'; // green
    if (progress >= 50) return '#3b82f6'; // blue
    if (progress >= 25) return '#f59e0b'; // orange
    return '#6b7280'; // gray
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="text-center"
        >
          <div className="text-4xl font-bold" style={{ color: getColor() }}>
            {Math.round(progress)}%
          </div>
          <div className="text-sm text-gray-600 mt-1">Complete</div>
        </motion.div>
      </div>
    </div>
  );
}
