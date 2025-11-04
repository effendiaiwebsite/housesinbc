/**
 * Knowledge Base Auto-Update Service
 *
 * Handles automatic updates of chatbot knowledge base using cron jobs
 */

import cron from 'node-cron';
import { claudeService } from './claudeService';
import { collections } from '../db';

export class KnowledgeUpdateService {
  private cronJob: cron.ScheduledTask | null = null;

  /**
   * Start the auto-update cron job
   * Runs daily at 2:00 AM
   */
  start() {
    // Schedule for 2:00 AM daily
    this.cronJob = cron.schedule('0 2 * * *', async () => {
      console.log('⏰ Starting scheduled knowledge base update...');
      await this.updateKnowledge();
    });

    console.log('✅ Knowledge base auto-update service started (runs daily at 2:00 AM)');

    // Also run on app startup if knowledge is old
    this.checkAndUpdateOnStartup();
  }

  /**
   * Stop the auto-update service
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('🛑 Knowledge base auto-update service stopped');
    }
  }

  /**
   * Manually trigger knowledge update
   */
  async updateKnowledge(): Promise<void> {
    try {
      console.log('🔄 Updating knowledge base...');

      // Delete old market data (older than 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const oldKnowledge = await collections.chatKnowledge
        .where('type', '==', 'market_data')
        .where('lastUpdated', '<', sevenDaysAgo)
        .get();

      const deletePromises = oldKnowledge.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);

      if (deletePromises.length > 0) {
        console.log(`🗑️  Deleted ${deletePromises.length} old knowledge entries`);
      }

      // Update with fresh data
      await claudeService.updateMarketKnowledge();

      // Update settings with last update time
      const settingsSnapshot = await collections.chatbotSettings
        .limit(1)
        .get();

      if (!settingsSnapshot.empty) {
        const settingsDoc = settingsSnapshot.docs[0];
        await settingsDoc.ref.update({
          'metadata.lastKnowledgeUpdate': new Date(),
          'metadata.nextKnowledgeUpdate': new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
      }

      console.log('✅ Knowledge base update completed successfully');

    } catch (error) {
      console.error('❌ Knowledge base update failed:', error);
      throw error;
    }
  }

  /**
   * Check if knowledge needs update on startup
   */
  private async checkAndUpdateOnStartup() {
    try {
      const settingsSnapshot = await collections.chatbotSettings
        .limit(1)
        .get();

      let shouldUpdate = false;

      if (settingsSnapshot.empty) {
        // No settings exist, create default and update
        await this.createDefaultSettings();
        shouldUpdate = true;
      } else {
        const settings = settingsSnapshot.docs[0].data();
        const lastUpdate = settings.metadata?.lastKnowledgeUpdate;

        if (!lastUpdate) {
          shouldUpdate = true;
        } else {
          const lastUpdateTime = lastUpdate.toDate ? lastUpdate.toDate() : new Date(lastUpdate);
          const hoursSinceUpdate = (Date.now() - lastUpdateTime.getTime()) / (1000 * 60 * 60);

          // Update if more than 24 hours old
          if (hoursSinceUpdate > 24) {
            shouldUpdate = true;
            console.log(`ℹ️  Knowledge is ${hoursSinceUpdate.toFixed(1)} hours old, updating...`);
          }
        }
      }

      if (shouldUpdate) {
        console.log('🔄 Knowledge base needs update, starting...');
        await this.updateKnowledge();
      } else {
        console.log('✅ Knowledge base is up to date');
      }

    } catch (error) {
      console.error('⚠️ Error checking knowledge status:', error);
    }
  }

  /**
   * Create default chatbot settings
   */
  private async createDefaultSettings() {
    await collections.chatbotSettings.add({
      welcomeMessage: "Hi! I'm your Houses BC assistant. I can help you with questions about buying a home in British Columbia, mortgage options, first-time buyer incentives, and property searches. How can I assist you today?",
      responseStyle: 'friendly',
      maxMessageLength: 2000,
      rateLimitPerHour: 20,
      rateLimitPerDay: 100,
      enabledFeatures: {
        autoUpdate: true,
        contextAwareness: true,
        propertyRecommendations: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: 'system',
      metadata: {
        lastKnowledgeUpdate: null,
        nextKnowledgeUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    console.log('✅ Default chatbot settings created');
  }

  /**
   * Clean up old chat sessions (older than 90 days)
   */
  async cleanupOldSessions() {
    try {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

      const oldSessions = await collections.chatSessions
        .where('expiresAt', '<', ninetyDaysAgo)
        .get();

      const deletePromises = oldSessions.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);

      if (deletePromises.length > 0) {
        console.log(`🗑️  Cleaned up ${deletePromises.length} old chat sessions`);
      }

    } catch (error) {
      console.error('❌ Session cleanup failed:', error);
    }
  }
}

// Singleton instance
export const knowledgeUpdateService = new KnowledgeUpdateService();
