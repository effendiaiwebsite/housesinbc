/**
 * Lead Capture Hook
 *
 * Manages when and how to trigger the lead capture modal.
 * Prevents showing modal multiple times to same user in one session.
 */

import { useState, useEffect, useCallback } from 'react';

const LEAD_CAPTURED_KEY = 'lead_captured';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface LeadCaptureState {
  isModalOpen: boolean;
  source: string;
  metadata?: Record<string, any>;
}

export function useLeadCapture() {
  const [state, setState] = useState<LeadCaptureState>({
    isModalOpen: false,
    source: '',
    metadata: undefined,
  });

  // Check if lead was already captured in this session
  const hasCapture = (): boolean => {
    const captured = localStorage.getItem(LEAD_CAPTURED_KEY);
    if (!captured) return false;

    try {
      const { timestamp } = JSON.parse(captured);
      const now = Date.now();

      // Check if capture is still valid (within session duration)
      if (now - timestamp < SESSION_DURATION) {
        return true;
      }

      // Expired, remove it
      localStorage.removeItem(LEAD_CAPTURED_KEY);
      return false;
    } catch {
      return false;
    }
  };

  // Trigger the lead capture modal
  const trigger = useCallback((
    source: 'landing' | 'mortgage' | 'incentives' | 'pricing' | 'blog' | 'properties' | 'calculator',
    metadata?: Record<string, any>
  ) => {
    // Don't show if already captured in this session
    if (hasCapture()) {
      return;
    }

    setState({
      isModalOpen: true,
      source,
      metadata,
    });
  }, []);

  // Close the modal
  const close = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isModalOpen: false,
    }));
  }, []);

  // Mark lead as captured
  const markCaptured = useCallback(() => {
    localStorage.setItem(
      LEAD_CAPTURED_KEY,
      JSON.stringify({
        timestamp: Date.now(),
      })
    );
  }, []);

  // Handle successful lead capture
  const onSuccess = useCallback(() => {
    markCaptured();
    close();
  }, [markCaptured, close]);

  return {
    isModalOpen: state.isModalOpen,
    source: state.source as any,
    metadata: state.metadata,
    trigger,
    close,
    onSuccess,
    hasCapture: hasCapture(),
  };
}

// Helper hook for specific trigger scenarios
export function useTriggerOnAction(
  action: () => void,
  source: Parameters<ReturnType<typeof useLeadCapture>['trigger']>[0],
  metadata?: Parameters<ReturnType<typeof useLeadCapture>['trigger']>[1]
) {
  const { trigger, hasCapture } = useLeadCapture();

  const wrappedAction = useCallback(() => {
    if (!hasCapture) {
      // Trigger lead capture first
      trigger(source, metadata);

      // Execute action after a delay (or on modal success)
      setTimeout(() => {
        action();
      }, 500);
    } else {
      // Lead already captured, execute action immediately
      action();
    }
  }, [action, source, metadata, trigger, hasCapture]);

  return wrappedAction;
}
