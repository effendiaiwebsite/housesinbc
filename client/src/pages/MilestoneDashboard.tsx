/**
 * Milestone Dashboard
 *
 * 8-step gamified home-buying journey with progress tracking
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import MilestoneCard from '@/components/MilestoneCard';
import ProgressRing from '@/components/ProgressRing';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  CreditCard,
  PiggyBank,
  FileCheck,
  Gift,
  MapPin,
  Home,
  Calendar,
  FileText,
  Trophy,
  Sparkles,
} from 'lucide-react';

// Milestone configuration
const MILESTONES = [
  {
    id: 'step1_creditScore',
    stepNumber: 1,
    title: 'Check Your Credit Score',
    description: 'Get your free credit report and understand your borrowing power',
    icon: CreditCard,
    estimatedTime: '5 min',
    badge: '🎯 Foundation',
    route: '/milestone/credit-score',
  },
  {
    id: 'step2_fhsa',
    stepNumber: 2,
    title: 'Open FHSA Account',
    description: 'Tax-free savings for your down payment (save up to $8K/year)',
    icon: PiggyBank,
    estimatedTime: '10 min',
    badge: '💰 Savings Pro',
    route: '/milestone/fhsa',
  },
  {
    id: 'step3_preApproval',
    stepNumber: 3,
    title: 'Get Pre-Approved',
    description: 'Compare personalized rates from 10+ lenders without credit hits',
    icon: FileCheck,
    estimatedTime: '15 min',
    badge: '🏅 Pre-Approved',
    route: '/milestone/pre-approval',
  },
  {
    id: 'step4_incentives',
    stepNumber: 4,
    title: 'Unlock BC Incentives',
    description: 'PTT exemption, GST rebate, FHSA benefits (avg. $18K savings)',
    icon: Gift,
    estimatedTime: 'Auto-complete',
    badge: '🎁 Savings Expert',
    route: '/milestone/incentives',
  },
  {
    id: 'step5_neighborhoods',
    stepNumber: 5,
    title: 'Explore Neighborhoods',
    description: 'Discover Surrey hotspots: Whalley, Fleetwood, Cloverdale',
    icon: MapPin,
    estimatedTime: '20 min',
    badge: '🗺️ Explorer',
    route: '/milestone/neighborhoods',
  },
  {
    id: 'step6_searchProperties',
    stepNumber: 6,
    title: 'Search Properties',
    description: 'Browse live MLS listings filtered to your budget',
    icon: Home,
    estimatedTime: '30 min',
    badge: '🔍 House Hunter',
    route: '/milestone/properties',
  },
  {
    id: 'step7_bookViewing',
    stepNumber: 7,
    title: 'Book Viewings',
    description: 'Schedule tours with Rida for your top 3-5 properties',
    icon: Calendar,
    estimatedTime: '10 min',
    badge: '👀 Tour Master',
    route: '/milestone/viewings',
  },
  {
    id: 'step8_makeOffer',
    stepNumber: 8,
    title: 'Make an Offer',
    description: 'Use our offer builder and submit to Rida for review',
    icon: FileText,
    estimatedTime: '20 min',
    badge: '🏆 Homeowner',
    route: '/milestone/offer',
  },
];

type MilestoneStatus = 'locked' | 'available' | 'in_progress' | 'completed';

interface UserProgress {
  userId: string;
  quizResponseId: string;
  milestones: {
    [key: string]: {
      status: MilestoneStatus;
      data: Record<string, unknown>;
      completedAt?: { _seconds: number };
    };
  };
  overallProgress: number;
  updatedAt: string;
}

export default function MilestoneDashboard() {
  const [, setLocation] = useLocation();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      // Get session ID from storage (set during quiz)
      const sessionId = sessionStorage.getItem('sessionId');
      if (!sessionId) {
        setLocation('/welcome');
        return;
      }

      const response = await fetch(`/api/progress/${sessionId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load progress');
      }

      const data = await response.json();
      if (data.success) {
        setProgress(data.data);

        // Show confetti if user just completed a milestone
        const completedCount = Object.values(data.data.milestones).filter(
          (m: any) => m.status === 'completed'
        ).length;
        if (completedCount > 0) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      } else {
        throw new Error(data.error || 'Failed to load progress');
      }
    } catch (err: any) {
      console.error('Load progress error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMilestoneStatus = (milestoneId: string): MilestoneStatus => {
    if (!progress) return 'locked';
    const milestone = progress.milestones[milestoneId];
    if (!milestone) return 'locked';

    // Return actual status if completed or in_progress
    if (milestone.status === 'completed' || milestone.status === 'in_progress') {
      return milestone.status;
    }

    // For pending milestones, check if they should be available or locked
    const milestoneIndex = MILESTONES.findIndex((m) => m.id === milestoneId);

    // Step 1 is always available
    if (milestoneIndex === 0) {
      return 'available';
    }

    // Other steps: available only if previous step is completed
    const previousMilestone = MILESTONES[milestoneIndex - 1];
    if (previousMilestone) {
      const prevStatus = progress.milestones[previousMilestone.id]?.status;
      if (prevStatus === 'completed') {
        return 'available';
      }
    }

    return 'locked';
  };

  const handleMilestoneClick = (milestoneId: string, route: string) => {
    const status = getMilestoneStatus(milestoneId);
    if (status !== 'locked') {
      setLocation(route);
    }
  };

  const completedMilestones = progress
    ? Object.values(progress.milestones).filter((m) => m.status === 'completed').length
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mb-4"
          />
          <p className="text-lg text-gray-600">Loading your journey...</p>
        </div>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-red-600 mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Dashboard</h3>
            <p className="text-gray-600 mb-6">{error || 'Please complete the quiz first'}</p>
            <Button onClick={() => setLocation('/quiz')}>Start Quiz</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Confetti overlay */}
      {showConfetti && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
        >
          <div className="text-9xl animate-bounce">🎉</div>
        </motion.div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="w-8 h-8" />
              <h1 className="text-4xl md:text-5xl font-bold">Your Home-Buying Journey</h1>
            </div>
            <p className="text-xl text-blue-100 mb-6">
              {completedMilestones} of 8 milestones completed
            </p>
            <div className="flex items-center justify-center gap-8">
              <ProgressRing progress={progress.overallProgress} size={160} strokeWidth={10} />
              {progress.overallProgress === 100 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                  className="text-left"
                >
                  <div className="text-6xl mb-2">🏆</div>
                  <div className="text-2xl font-bold">Journey Complete!</div>
                  <div className="text-blue-100">You're ready to own your home</div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Motivational Banner */}
        {progress.overallProgress < 100 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl p-6 text-white"
          >
            <div className="flex items-center gap-4">
              <Sparkles className="w-8 h-8 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold mb-1">
                  {progress.overallProgress === 0
                    ? "Let's get started!"
                    : progress.overallProgress < 50
                    ? "Great progress! Keep going!"
                    : "You're more than halfway there!"}
                </h3>
                <p className="text-blue-100">
                  {progress.overallProgress === 0
                    ? 'Start with checking your credit score - it only takes 5 minutes!'
                    : progress.overallProgress < 50
                    ? 'Every step brings you closer to homeownership in Surrey.'
                    : 'Your dream home is within reach. Complete the remaining steps!'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Milestone Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MILESTONES.map((milestone) => {
            const status = getMilestoneStatus(milestone.id);
            return (
              <MilestoneCard
                key={milestone.id}
                stepNumber={milestone.stepNumber}
                title={milestone.title}
                description={milestone.description}
                icon={milestone.icon}
                status={status}
                estimatedTime={milestone.estimatedTime}
                badge={status === 'completed' ? milestone.badge : undefined}
                onStart={() => handleMilestoneClick(milestone.id, milestone.route)}
              />
            );
          })}
        </div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Rida is here to guide you every step of the way. Have questions about any milestone?
                Chat with our AI assistant or book a free consultation.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="outline" size="lg">
                  💬 Chat with AI
                </Button>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600">
                  📅 Book Free Consultation
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
