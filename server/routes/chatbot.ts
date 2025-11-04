/**
 * Chatbot API Routes
 *
 * Handles chatbot interactions, knowledge base management, and admin functions
 */

import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import { collections } from '../db';
import { claudeService } from '../services/claudeService';
import { MessageSanitizer } from '../services/messageSanitizer';
import { knowledgeUpdateService } from '../services/knowledgeUpdateService';
import type { ChatMessage, ChatRequest, ChatResponse } from '../../shared/chatbot-schema';

const router = express.Router();

// Rate limiting for chat messages
const chatRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 messages per hour per IP
  message: 'Too many messages. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// More strict rate limit for knowledge updates
const updateRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 updates per hour
  message: 'Too many update requests. Please try again later.',
});

/**
 * POST /api/chatbot/message
 * Send a message to the chatbot
 */
router.post('/message', chatRateLimiter, async (req: Request, res: Response) => {
  try {
    const { message, sessionId } = req.body as ChatRequest;

    // Validate and sanitize message
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let sanitizedMessage: string;
    try {
      sanitizedMessage = MessageSanitizer.sanitize(message);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }

    // Check for spam
    if (MessageSanitizer.isSpam(sanitizedMessage)) {
      return res.status(400).json({ error: 'Message flagged as spam' });
    }

    // Get or create session
    let currentSessionId = sessionId;
    let conversationHistory: ChatMessage[] = [];

    if (currentSessionId) {
      // Validate session ID format
      if (!MessageSanitizer.validateSessionId(currentSessionId)) {
        return res.status(400).json({ error: 'Invalid session ID' });
      }

      // Get existing session
      const sessionDoc = await collections.chatSessions.doc(currentSessionId).get();

      if (sessionDoc.exists) {
        const sessionData = sessionDoc.data();

        // Check if session is expired
        const expiresAt = sessionData?.expiresAt.toDate();
        if (expiresAt && expiresAt < new Date()) {
          return res.status(400).json({ error: 'Session expired. Please start a new conversation.' });
        }

        // Get conversation history
        const messagesSnapshot = await collections.chatMessages
          .where('sessionId', '==', currentSessionId)
          .orderBy('timestamp', 'asc')
          .limit(10)
          .get();

        conversationHistory = messagesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as ChatMessage));
      } else {
        // Session ID provided but doesn't exist
        currentSessionId = null;
      }
    }

    // Create new session if needed
    if (!currentSessionId) {
      currentSessionId = uuidv4();

      const userId = (req.session as any)?.userId || 'anonymous';
      const userPhone = (req.session as any)?.phoneNumber;

      const sessionData: any = {
        id: currentSessionId,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        isActive: true,
      };

      // Only add userPhone if it exists
      if (userPhone) {
        sessionData.userPhone = userPhone;
      }

      await collections.chatSessions.doc(currentSessionId).set(sessionData);
    }

    // Save user message
    const userMessageId = uuidv4();
    await collections.chatMessages.doc(userMessageId).set({
      id: userMessageId,
      sessionId: currentSessionId,
      role: 'user',
      content: sanitizedMessage,
      timestamp: new Date(),
    });

    // Get response from Claude
    const botResponse = await claudeService.getChatResponse(
      sanitizedMessage,
      conversationHistory
    );

    // Sanitize Claude's response (extra safety)
    const sanitizedResponse = MessageSanitizer.sanitizeResponse(botResponse);

    // Save bot response
    const botMessageId = uuidv4();
    await collections.chatMessages.doc(botMessageId).set({
      id: botMessageId,
      sessionId: currentSessionId,
      role: 'assistant',
      content: sanitizedResponse,
      timestamp: new Date(),
      metadata: {
        model: 'claude-sonnet-4-5-20250929',
      },
    });

    // Update session timestamp
    await collections.chatSessions.doc(currentSessionId).update({
      updatedAt: new Date(),
    });

    const response: ChatResponse = {
      message: sanitizedResponse,
      sessionId: currentSessionId,
      messageId: botMessageId,
      timestamp: new Date(),
    };

    res.json(response);

  } catch (error: any) {
    console.error('❌ Chat error:', error);
    res.status(500).json({
      error: error.message || 'Failed to process message',
    });
  }
});

/**
 * GET /api/chatbot/history/:sessionId
 * Get chat history for a session
 */
router.get('/history/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    if (!MessageSanitizer.validateSessionId(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    const messagesSnapshot = await collections.chatMessages
      .where('sessionId', '==', sessionId)
      .orderBy('timestamp', 'asc')
      .get();

    const messages = messagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ messages });

  } catch (error: any) {
    console.error('❌ History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

/**
 * DELETE /api/chatbot/session/:sessionId
 * Delete a chat session
 */
router.delete('/session/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    if (!MessageSanitizer.validateSessionId(sessionId)) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    // Delete session
    await collections.chatSessions.doc(sessionId).delete();

    // Delete associated messages
    const messagesSnapshot = await collections.chatMessages
      .where('sessionId', '==', sessionId)
      .get();

    const deletePromises = messagesSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    res.json({ message: 'Session deleted successfully' });

  } catch (error: any) {
    console.error('❌ Session deletion error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

/**
 * GET /api/chatbot/admin/chats
 * Get all chat sessions (admin only)
 */
router.get('/admin/chats', async (req: Request, res: Response) => {
  try {
    // Check admin authentication
    if (!(req.session as any)?.isAuthenticated || (req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { limit = 50, startAfter } = req.query;

    let query = collections.chatSessions
      .orderBy('updatedAt', 'desc')
      .limit(Number(limit));

    if (startAfter) {
      const startDoc = await collections.chatSessions.doc(startAfter as string).get();
      if (startDoc.exists) {
        query = query.startAfter(startDoc);
      }
    }

    const snapshot = await query.get();

    const sessions = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const sessionData = doc.data();

        // Get message count
        const messagesSnapshot = await collections.chatMessages
          .where('sessionId', '==', doc.id)
          .get();

        // Get last message
        const lastMessageSnapshot = await collections.chatMessages
          .where('sessionId', '==', doc.id)
          .orderBy('timestamp', 'desc')
          .limit(1)
          .get();

        const lastMessage = lastMessageSnapshot.empty
          ? null
          : lastMessageSnapshot.docs[0].data();

        return {
          id: doc.id,
          ...sessionData,
          messageCount: messagesSnapshot.size,
          lastMessage: lastMessage?.content || null,
        };
      })
    );

    res.json({ sessions });

  } catch (error: any) {
    console.error('❌ Admin chats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
});

/**
 * GET /api/chatbot/admin/chat/:sessionId
 * Get specific chat session with full history (admin only)
 */
router.get('/admin/chat/:sessionId', async (req: Request, res: Response) => {
  try {
    // Check admin authentication
    if (!(req.session as any)?.isAuthenticated || (req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { sessionId } = req.params;

    const sessionDoc = await collections.chatSessions.doc(sessionId).get();
    if (!sessionDoc.exists) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const messagesSnapshot = await collections.chatMessages
      .where('sessionId', '==', sessionId)
      .orderBy('timestamp', 'asc')
      .get();

    const messages = messagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      session: { id: sessionDoc.id, ...sessionDoc.data() },
      messages,
    });

  } catch (error: any) {
    console.error('❌ Admin chat fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch chat session' });
  }
});

/**
 * GET /api/chatbot/admin/knowledge
 * Get all knowledge base entries (admin only)
 */
router.get('/admin/knowledge', async (req: Request, res: Response) => {
  try {
    // Check admin authentication
    if (!(req.session as any)?.isAuthenticated || (req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const snapshot = await collections.chatKnowledge
      .orderBy('lastUpdated', 'desc')
      .get();

    const knowledge = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ knowledge });

  } catch (error: any) {
    console.error('❌ Knowledge fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch knowledge base' });
  }
});

/**
 * POST /api/chatbot/admin/knowledge
 * Add custom knowledge entry (admin only)
 */
router.post('/admin/knowledge', async (req: Request, res: Response) => {
  try {
    // Check admin authentication
    if (!(req.session as any)?.isAuthenticated || (req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { title, content, category, type = 'custom' } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const sanitizedContent = MessageSanitizer.sanitizeKnowledgeContent(content);

    const knowledgeId = uuidv4();
    await collections.chatKnowledge.doc(knowledgeId).set({
      id: knowledgeId,
      type,
      title,
      content: sanitizedContent,
      category: category || 'general',
      lastUpdated: new Date(),
      autoUpdate: false,
      metadata: {
        addedBy: (req.session as any)?.userId || 'admin',
      },
    });

    res.json({ message: 'Knowledge added successfully', id: knowledgeId });

  } catch (error: any) {
    console.error('❌ Knowledge add error:', error);
    res.status(500).json({ error: 'Failed to add knowledge' });
  }
});

/**
 * PUT /api/chatbot/admin/knowledge/:id
 * Update knowledge entry (admin only)
 */
router.put('/admin/knowledge/:id', async (req: Request, res: Response) => {
  try {
    // Check admin authentication
    if (!(req.session as any)?.isAuthenticated || (req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { title, content, category } = req.body;

    const sanitizedContent = MessageSanitizer.sanitizeKnowledgeContent(content);

    await collections.chatKnowledge.doc(id).update({
      title,
      content: sanitizedContent,
      category,
      lastUpdated: new Date(),
    });

    res.json({ message: 'Knowledge updated successfully' });

  } catch (error: any) {
    console.error('❌ Knowledge update error:', error);
    res.status(500).json({ error: 'Failed to update knowledge' });
  }
});

/**
 * DELETE /api/chatbot/admin/knowledge/:id
 * Delete knowledge entry (admin only)
 */
router.delete('/admin/knowledge/:id', async (req: Request, res: Response) => {
  try {
    // Check admin authentication
    if (!(req.session as any)?.isAuthenticated || (req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    await collections.chatKnowledge.doc(id).delete();

    res.json({ message: 'Knowledge deleted successfully' });

  } catch (error: any) {
    console.error('❌ Knowledge delete error:', error);
    res.status(500).json({ error: 'Failed to delete knowledge' });
  }
});

/**
 * POST /api/chatbot/admin/knowledge/update
 * Trigger manual knowledge update (admin only)
 */
router.post('/admin/knowledge/update', updateRateLimiter, async (req: Request, res: Response) => {
  try {
    // Check admin authentication
    if (!(req.session as any)?.isAuthenticated || (req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    await knowledgeUpdateService.updateKnowledge();

    res.json({ message: 'Knowledge base updated successfully' });

  } catch (error: any) {
    console.error('❌ Knowledge update error:', error);
    res.status(500).json({ error: 'Failed to update knowledge base' });
  }
});

/**
 * GET /api/chatbot/admin/settings
 * Get chatbot settings (admin only)
 */
router.get('/admin/settings', async (req: Request, res: Response) => {
  try {
    // Check admin authentication
    if (!(req.session as any)?.isAuthenticated || (req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const snapshot = await collections.chatbotSettings.limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    const settings = {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    };

    res.json({ settings });

  } catch (error: any) {
    console.error('❌ Settings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * PUT /api/chatbot/admin/settings
 * Update chatbot settings (admin only)
 */
router.put('/admin/settings', async (req: Request, res: Response) => {
  try {
    // Check admin authentication
    if (!(req.session as any)?.isAuthenticated || (req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { welcomeMessage, responseStyle, maxMessageLength, rateLimitPerHour, enabledFeatures } = req.body;

    const snapshot = await collections.chatbotSettings.limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    const settingsDoc = snapshot.docs[0];

    await settingsDoc.ref.update({
      welcomeMessage,
      responseStyle,
      maxMessageLength,
      rateLimitPerHour,
      enabledFeatures,
      updatedAt: new Date(),
      updatedBy: (req.session as any)?.userId || 'admin',
    });

    res.json({ message: 'Settings updated successfully' });

  } catch (error: any) {
    console.error('❌ Settings update error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
