/**
 * Chatbot Widget Component
 *
 * Floating chatbot button and chat window for the web app
 */

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => {
    // Try to get existing session ID from localStorage or create new one
    const stored = localStorage.getItem('chatbot_session_id');

    // Validate stored session ID (must be alphanumeric with hyphens only)
    const isValidFormat = stored && /^[a-zA-Z0-9-]{10,50}$/.test(stored);

    if (isValidFormat) {
      return stored;
    }

    // Create new valid session ID
    const newId = `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chatbot_session_id', newId);
    return newId;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when opening
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    try {
      const response = await fetch(`/api/chatbot/history/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        const loadedMessages: Message[] = data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          userId: 'web-user',
          sessionId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: data.messageId || Date.now().toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(data.timestamp || Date.now()),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || 'Failed to send message';
        console.error('API Error:', response.status, errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please refresh the page and try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-96 md:h-[600px] w-full h-full bg-white md:rounded-lg shadow-2xl flex flex-col z-50 border-0 md:border md:border-gray-200">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 md:rounded-t-lg flex justify-between items-center safe-area-top">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              <div>
                <h3 className="font-semibold text-base sm:text-lg">BC Real Estate Assistant</h3>
                <p className="text-xs text-blue-100">Powered by AI</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 p-2 sm:p-1 rounded transition-colors min-w-touch min-h-touch flex items-center justify-center"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 mobile-scroll">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Welcome! Ask me anything about BC real estate.</p>
                <p className="text-xs mt-2">Try asking about:</p>
                <ul className="text-xs mt-2 space-y-1">
                  <li>• First-time buyer programs</li>
                  <li>• Mortgage rates</li>
                  <li>• Neighborhoods in Vancouver</li>
                  <li>• Property transfer tax</li>
                </ul>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 sm:p-4 border-t border-gray-200 safe-area-bottom">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 px-3 sm:px-4 py-3 sm:py-2 min-h-[48px] sm:min-h-[40px] text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim() || isLoading}
                className="bg-blue-600 text-white min-w-touch min-h-touch p-3 sm:p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-blue-600 text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-50 flex items-center justify-center touch-manipulation"
        aria-label="Open chat"
      >
        {isOpen ? (
          <X className="w-6 h-6 sm:w-7 sm:h-7" />
        ) : (
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
        )}
      </button>
    </>
  );
}
