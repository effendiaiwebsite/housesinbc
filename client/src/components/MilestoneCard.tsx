/**
 * Milestone Card Component
 *
 * Displays individual milestone progress with gamification elements
 */

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Lock, PlayCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

type MilestoneStatus = 'locked' | 'available' | 'in_progress' | 'completed';

interface MilestoneCardProps {
  stepNumber: number;
  title: string;
  description: string;
  icon: LucideIcon;
  status: MilestoneStatus;
  estimatedTime?: string;
  badge?: string;
  onStart?: () => void;
  className?: string;
}

const statusConfig = {
  locked: {
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    iconColor: 'text-gray-400',
    textColor: 'text-gray-500',
    icon: Lock,
    buttonText: 'Locked',
    buttonDisabled: true,
  },
  available: {
    bgColor: 'bg-white',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    textColor: 'text-gray-900',
    icon: PlayCircle,
    buttonText: 'Start',
    buttonDisabled: false,
  },
  in_progress: {
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    iconColor: 'text-orange-600',
    textColor: 'text-gray-900',
    icon: Clock,
    buttonText: 'Continue',
    buttonDisabled: false,
  },
  completed: {
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    iconColor: 'text-green-600',
    textColor: 'text-gray-900',
    icon: CheckCircle2,
    buttonText: 'Review',
    buttonDisabled: false,
  },
};

export default function MilestoneCard({
  stepNumber,
  title,
  description,
  icon: Icon,
  status,
  estimatedTime = '5-10 min',
  badge,
  onStart,
  className,
}: MilestoneCardProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: stepNumber * 0.1 }}
      whileHover={status !== 'locked' ? { scale: 1.02 } : {}}
      className={className}
    >
      <Card
        className={cn(
          'relative overflow-hidden border-2 transition-all duration-300',
          config.bgColor,
          config.borderColor,
          status === 'in_progress' && 'shadow-lg animate-pulse'
        )}
      >
        {/* Badge */}
        {badge && status === 'completed' && (
          <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
            {badge}
          </div>
        )}

        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            {/* Step Number Badge */}
            <div
              className={cn(
                'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm',
                status === 'completed'
                  ? 'bg-green-600 text-white'
                  : status === 'in_progress'
                  ? 'bg-orange-600 text-white'
                  : status === 'available'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              )}
            >
              {stepNumber}
            </div>

            {/* Icon */}
            <div
              className={cn(
                'flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center',
                status === 'completed'
                  ? 'bg-green-100'
                  : status === 'in_progress'
                  ? 'bg-orange-100'
                  : status === 'available'
                  ? 'bg-blue-100'
                  : 'bg-gray-200'
              )}
            >
              <Icon className={cn('w-7 h-7', config.iconColor)} />
            </div>

            {/* Status Icon */}
            <div className="ml-auto">
              <StatusIcon className={cn('w-6 h-6', config.iconColor)} />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2 mb-4">
            <h3 className={cn('text-lg font-bold', config.textColor)}>{title}</h3>
            <p className={cn('text-sm', status === 'locked' ? 'text-gray-400' : 'text-gray-600')}>
              {description}
            </p>
            {estimatedTime && status !== 'locked' && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{estimatedTime}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <Button
            onClick={onStart}
            disabled={config.buttonDisabled}
            className={cn(
              'w-full',
              status === 'completed'
                ? 'bg-green-600 hover:bg-green-700'
                : status === 'in_progress'
                ? 'bg-orange-600 hover:bg-orange-700'
                : status === 'available'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            )}
          >
            {status === 'completed' && <CheckCircle2 className="w-4 h-4 mr-2" />}
            {config.buttonText}
          </Button>
        </CardContent>

        {/* Progress indicator for in_progress */}
        {status === 'in_progress' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-200">
            <motion.div
              className="h-full bg-orange-600"
              initial={{ width: '0%' }}
              animate={{ width: '60%' }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        )}
      </Card>
    </motion.div>
  );
}
