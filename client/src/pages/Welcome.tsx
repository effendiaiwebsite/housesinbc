/**
 * Welcome Screen
 *
 * Beautiful post-webinar entry screen with animated Surrey skyline
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Home, TrendingUp, MapPin } from 'lucide-react';

export default function Welcome() {
  const [, setLocation] = useLocation();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show content after brief delay
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleStartQuiz = () => {
    setLocation('/client/quiz');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Floating circles */}
        <motion.div
          className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ top: '10%', left: '10%' }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ bottom: '10%', right: '10%' }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Icon trio */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Home className="w-8 h-8 text-white" />
              </div>
              <div className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <MapPin className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Your Surrey Home
              <br />
              <span className="text-green-300">Starts Here</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl md:text-2xl text-white/90 mb-4 max-w-2xl mx-auto"
            >
              Rida's step-by-step guide — now in your pocket
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-lg text-white/80 mb-12 max-w-2xl mx-auto"
            >
              From tonight's webinar to your dream home in 8 simple steps
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <Button
                onClick={handleStartQuiz}
                size="lg"
                className="bg-white text-blue-700 hover:bg-gray-100 text-lg px-12 py-6 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200"
              >
                <Home className="w-6 h-6 mr-2" />
                Let's Build Your Plan
              </Button>
            </motion.div>

            {/* Features preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
                <div className="text-4xl font-bold mb-2">2 min</div>
                <div className="text-white/80">Quick assessment</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
                <div className="text-4xl font-bold mb-2">$18K+</div>
                <div className="text-white/80">Avg. savings unlock</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white">
                <div className="text-4xl font-bold mb-2">8 steps</div>
                <div className="text-white/80">To homeownership</div>
              </div>
            </motion.div>

            {/* Footer hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.8 }}
              className="mt-12 text-white/60 text-sm"
            >
              Powered by Rida's expert guidance
            </motion.p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
