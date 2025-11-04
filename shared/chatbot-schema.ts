/**
 * Chatbot Schema and Types
 *
 * Shared types for chatbot functionality across client and server
 */

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    tokens?: number;
    model?: string;
  };
}

export interface ChatSession {
  id: string;
  userId: string;
  userPhone?: string;
  userName?: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date; // 90 days from creation
  isActive: boolean;
}

export interface KnowledgeBase {
  id: string;
  type: 'market_data' | 'custom' | 'incentives' | 'faq';
  title: string;
  content: string;
  category?: string;
  lastUpdated: Date;
  nextUpdate?: Date;
  autoUpdate: boolean;
  metadata?: {
    source?: string;
    version?: string;
    [key: string]: any;
  };
}

export interface ChatbotSettings {
  id: string;
  welcomeMessage: string;
  responseStyle: 'friendly' | 'professional' | 'casual';
  maxMessageLength: number;
  rateLimitPerHour: number;
  rateLimitPerDay: number;
  enabledFeatures: {
    autoUpdate: boolean;
    contextAwareness: boolean;
    propertyRecommendations: boolean;
  };
  updatedAt: Date;
  updatedBy: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  message: string;
  sessionId: string;
  messageId: string;
  timestamp: Date;
}

export interface KnowledgeUpdateRequest {
  type: KnowledgeBase['type'];
  title: string;
  content: string;
  category?: string;
  autoUpdate?: boolean;
}
