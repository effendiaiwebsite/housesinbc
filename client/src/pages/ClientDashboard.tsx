/**
 * Client Dashboard Page
 *
 * Main dashboard for authenticated clients - shows milestone journey or welcome prompt
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Trophy, Sparkles, Home, TrendingUp, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import MilestoneCard from '../components/MilestoneCard';
import ProgressRing from '../components/ProgressRing';
import Navigation from '../components/Navigation';
import {
  CreditCard,
  PiggyBank,
  FileCheck,
  Gift,
  Calendar,
  FileText,
} from 'lucide-react';

const MILESTONES = [
  {
    id: 'step1_creditScore',
    step: 1,
    title: 'Check Your Credit Score',
    description: 'Get your free credit report and understand your borrowing power',
    icon: CreditCard,
    estimatedTime: '5 min',
    badge: '🎯 Foundation',
    route: '/client/milestone/credit-score',
  },
  {
    id: 'step2_fhsa',
    step: 2,
    title: 'Open FHSA Account',
    description: 'Tax-free savings for your down payment (save up to $8K/year)',
    icon: PiggyBank,
    estimatedTime: '10 min',
    badge: '💰 Savings Pro',
    route: '/client/milestone/fhsa',
  },
  {
    id: 'step3_preApproval',
    step: 3,
    title: 'Get Pre-Approved',
    description: 'Compare personalized rates from 10+ lenders without credit hits',
    icon: FileCheck,
    estimatedTime: '15 min',
    badge: '🏅 Pre-Approved',
    route: '/client/milestone/pre-approval',
  },
  {
    id: 'step4_incentives',
    step: 4,
    title: 'Unlock BC Incentives',
    description: 'PTT exemption, GST rebate, FHSA benefits (avg. $18K savings)',
    icon: Gift,
    estimatedTime: 'Auto',
    badge: '🎁 Savings Expert',
    route: '/client/milestone/incentives',
  },
  {
    id: 'step5_neighborhoods',
    step: 5,
    title: 'Explore Neighborhoods',
    description: 'Discover Surrey hotspots: Whalley, Fleetwood, Cloverdale',
    icon: MapPin,
    estimatedTime: '20 min',
    badge: '🗺️ Explorer',
    route: '/client/milestone/neighborhoods',
  },
  {
    id: 'step6_searchProperties',
    step: 6,
    title: 'Search Properties',
    description: 'Browse live MLS listings filtered to your budget',
    icon: Home,
    estimatedTime: '30 min',
    badge: '🔍 House Hunter',
    route: '/properties',
  },
  {
    id: 'step7_bookViewing',
    step: 7,
    title: 'Book Viewings',
    description: 'Schedule tours with Rida for your top 3-5 properties',
    icon: Calendar,
    estimatedTime: '10 min',
    badge: '👀 Tour Master',
    route: '/client/milestone/viewings',
  },
  {
    id: 'step8_makeOffer',
    step: 8,
    title: 'Make an Offer',
    description: 'Use our offer builder and submit to Rida for review',
    icon: FileText,
    estimatedTime: '20 min',
    badge: '🏆 Homeowner',
    route: '/client/milestone/offer',
  },
];

export default function ClientDashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [hasQuizData, setHasQuizData] = useState(false);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      setLocation('/client/login');
      return;
    }

    if (isAuthenticated && user) {
      loadUserData();
    }
  }, [isAuthenticated, user, authLoading]);

  const loadUserData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Use user ID (works for both phone and email-based users)
      const userId = user.id;

      // Check if user has completed quiz
      const quizResponse = await fetch(`/api/quiz/response/${userId}`);
      const quizResult = await quizResponse.json();

      if (quizResult.success && quizResult.data) {
        setHasQuizData(true);

        // Load progress data
        const progressResponse = await fetch(`/api/progress/${userId}`);
        const progressResult = await progressResponse.json();

        if (progressResult.success && progressResult.data) {
          setProgress(progressResult.data);
        }
      } else {
        setHasQuizData(false);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setHasQuizData(false);
    } finally {
      setLoading(false);
    }
  };

  const getMilestoneStatus = (milestoneId: string): 'locked' | 'available' | 'in_progress' | 'completed' => {
    if (!progress || !progress.milestones) return 'locked';

    const milestone = progress.milestones[milestoneId];
    if (!milestone) {
      // Property search steps (6, 7, 8) are always available after quiz
      // They can be done in any order from the properties page
      if (['step6_searchProperties', 'step7_bookViewing', 'step8_makeOffer'].includes(milestoneId)) {
        return 'available';
      }
      return 'locked';
    }

    // Return actual status if completed or in_progress
    if (milestone.status === 'completed' || milestone.status === 'in_progress') {
      return milestone.status;
    }

    // Check if milestone is unlocked
    const milestoneIndex = MILESTONES.findIndex(m => m.id === milestoneId);

    // First milestone is always available
    if (milestoneIndex === 0) {
      return 'available';
    }

    // Property search steps are always available
    if (['step6_searchProperties', 'step7_bookViewing', 'step8_makeOffer'].includes(milestoneId)) {
      return 'available';
    }

    // Check if previous milestone is completed
    const previousMilestone = MILESTONES[milestoneIndex - 1];
    if (previousMilestone && progress.milestones[previousMilestone.id]?.status === 'completed') {
      return 'available';
    }

    return 'locked';
  };

  const handleMilestoneClick = (milestone: typeof MILESTONES[0]) => {
    const status = getMilestoneStatus(milestone.id);
    if (status !== 'locked') {
      setLocation(milestone.route);
    }
  };

  const completedCount = progress?.milestones
    ? Object.values(progress.milestones).filter((m: any) => m.status === 'completed').length
    : 0;

  const overallProgress = progress?.overallProgress || 0;

  const getMotivationalMessage = () => {
    if (overallProgress === 0) {
      return "Let's get started! Start with checking your credit score - it only takes 5 minutes!";
    } else if (overallProgress < 50) {
      return 'Great progress! Keep going! Every step brings you closer to homeownership.';
    } else if (overallProgress < 100) {
      return "You're more than halfway there! Your dream home is within reach.";
    }
    return '';
  };

  if (authLoading || loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  // Show welcome prompt if no quiz data
  if (!hasQuizData) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 flex items-center justify-center px-4">
          <Card className="max-w-2xl w-full p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 rounded-full mb-4">
              <Home className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome to Your Home-Buying Journey!
            </h1>
            <p className="text-xl text-gray-600">
              Let's find your dream home in Surrey, BC
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl mb-2">⏱️</div>
              <div className="font-semibold">2-Minute Quiz</div>
              <div className="text-sm text-gray-600">Quick & easy</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-3xl mb-2">💰</div>
              <div className="font-semibold">$18K+ Savings</div>
              <div className="text-sm text-gray-600">BC Incentives</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl mb-2">🎯</div>
              <div className="font-semibold">8-Step Journey</div>
              <div className="text-sm text-gray-600">Guided process</div>
            </div>
          </div>

          <Button
            onClick={() => setLocation('/client/welcome')}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-lg px-8 py-6"
          >
            Start Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <p className="mt-4 text-sm text-gray-500">
            Logged in as {user?.email || user?.phoneNumber}
          </p>
        </Card>
      </div>
      </>
    );
  }

  // Show milestone dashboard
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-blue-600 to-green-600 rounded-full mb-4">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Home-Buying Journey</h1>
          <p className="text-xl text-gray-600">
            {completedCount} of 8 milestones completed
          </p>
        </div>

        {/* Progress Ring */}
        <div className="flex justify-center mb-8">
          <ProgressRing progress={overallProgress} size={200} />
        </div>

        {/* Completion Celebration */}
        {overallProgress === 100 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-center text-white">
            <Trophy className="h-12 w-12 mx-auto mb-2" />
            <h2 className="text-2xl font-bold">Journey Complete!</h2>
            <p className="text-lg">Rida will contact you soon to finalize your offer!</p>
          </div>
        )}

        {/* Motivational Banner */}
        {overallProgress < 100 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-center text-white">
            <Sparkles className="h-8 w-8 mx-auto mb-2" />
            <p className="text-lg font-medium">{getMotivationalMessage()}</p>
          </div>
        )}

        {/* Milestone Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {MILESTONES.map((milestone, index) => (
            <div
              key={milestone.id}
              style={{ animationDelay: `${index * 0.1}s` }}
              className="animate-fade-in"
            >
              <MilestoneCard
                stepNumber={milestone.step}
                title={milestone.title}
                description={milestone.description}
                icon={milestone.icon}
                status={getMilestoneStatus(milestone.id)}
                estimatedTime={milestone.estimatedTime}
                badge={milestone.badge}
                onStart={() => handleMilestoneClick(milestone)}
              />
            </div>
          ))}
        </div>

        {/* Help Section */}
        <Card className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
          <h3 className="text-xl font-semibold mb-2">Need Help?</h3>
          <p className="mb-4">Rida is here to guide you through every step</p>
          <div className="flex justify-center gap-4">
            <Button variant="secondary">
              💬 Chat with AI
            </Button>
            <Button variant="secondary">
              📅 Book Free Consultation
            </Button>
          </div>
        </Card>

        {/* Confetti Animation */}
        {showConfetti && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="text-9xl animate-bounce">🎉</div>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
