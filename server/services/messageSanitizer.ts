/**
 * Message Sanitization Service
 *
 * Provides security for chatbot messages by sanitizing and validating user input
 * to prevent XSS, injection attacks, and other malicious content
 */

import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create a DOM window for server-side DOMPurify
const window = new JSDOM('').window;
const purify = DOMPurify(window as unknown as Window);

/**
 * Malicious patterns that should be blocked
 */
const MALICIOUS_PATTERNS = [
  // Code execution patterns
  /(?:require|import|eval|exec|system|spawn|child_process)\s*\(/gi,

  // Script tags and JavaScript
  /<script|javascript:|onerror=|onload=|onclick=/gi,

  // Template literals and code injection
  /(\$\{|\$\(|`)/g,

  // SQL injection patterns
  /(drop|delete|insert|update|select|union|from|where|or|and)\s+(table|database|column|--|;)/gi,

  // Path traversal
  /\.\.\/|~\/|\.\.\\/g,

  // Command injection
  /[;&|`$]/g,

  // HTML event handlers
  /on\w+\s*=/gi,

  // Data URIs (potential XSS vector)
  /data:text\/html/gi,
];

/**
 * Patterns that are suspicious but might be legitimate in real estate context
 */
const SUSPICIOUS_PATTERNS = [
  // Excessive special characters
  /[!@#$%^&*()]{5,}/,

  // Repeated characters (spam detection)
  /(.)\1{10,}/,
];

export class MessageSanitizer {
  /**
   * Sanitize and validate a message
   * @throws Error if message contains malicious content
   */
  static sanitize(message: string, maxLength: number = 2000): string {
    // 1. Basic validation
    if (!message || typeof message !== 'string') {
      throw new Error('Invalid message format');
    }

    // 2. Length validation
    if (message.length > maxLength) {
      throw new Error(`Message too long. Maximum ${maxLength} characters allowed.`);
    }

    if (message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    // 3. Strip HTML and scripts using DOMPurify
    const cleaned = purify.sanitize(message, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [], // No attributes allowed
      KEEP_CONTENT: true, // Keep text content
    });

    // 4. Check for malicious patterns
    for (const pattern of MALICIOUS_PATTERNS) {
      if (pattern.test(cleaned)) {
        console.warn('⚠️ Malicious pattern detected:', {
          pattern: pattern.toString(),
          message: cleaned.substring(0, 100),
        });
        throw new Error('Message contains invalid content');
      }
    }

    // 5. Check for suspicious patterns (warn but allow)
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(cleaned)) {
        console.warn('⚠️ Suspicious pattern detected:', {
          pattern: pattern.toString(),
          message: cleaned.substring(0, 100),
        });
      }
    }

    // 6. Trim and normalize whitespace
    return cleaned.trim().replace(/\s+/g, ' ');
  }

  /**
   * Sanitize a response from Claude before sending to client
   * This prevents Claude from inadvertently including harmful content
   */
  static sanitizeResponse(response: string): string {
    // Remove potential script tags if Claude somehow includes them
    const cleaned = purify.sanitize(response, {
      ALLOWED_TAGS: [], // No HTML in responses
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });

    return cleaned.trim();
  }

  /**
   * Validate session ID format to prevent injection
   */
  static validateSessionId(sessionId: string): boolean {
    // Session IDs should be alphanumeric with hyphens (UUID format)
    const sessionIdPattern = /^[a-zA-Z0-9-]{10,50}$/;
    return sessionIdPattern.test(sessionId);
  }

  /**
   * Sanitize knowledge base content for admin uploads
   * More permissive than message sanitization
   */
  static sanitizeKnowledgeContent(content: string): string {
    // Allow basic formatting but remove scripts
    const cleaned = purify.sanitize(content, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: [],
    });

    return cleaned.trim();
  }

  /**
   * Check if a message is likely spam
   */
  static isSpam(message: string): boolean {
    const lowerMessage = message.toLowerCase();

    const spamKeywords = [
      'click here',
      'buy now',
      'limited time',
      'act now',
      'free money',
      'winner',
      'congratulations you',
    ];

    return spamKeywords.some(keyword => lowerMessage.includes(keyword));
  }
}
