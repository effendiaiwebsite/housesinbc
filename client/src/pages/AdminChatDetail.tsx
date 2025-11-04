/**
 * Admin Chat Detail Page
 *
 * View full conversation history for a specific chat session
 */

import { useEffect } from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Navigation from '@/components/Navigation';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminChatDetail() {
  const [match, params] = useRoute('/admin/chatbot/chat/:sessionId');
  const sessionId = params?.sessionId;

  const { data, isLoading, error } = useQuery({
    queryKey: ['chat-detail', sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/chatbot/admin/chat/${sessionId}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load chat');
      return res.json();
    },
    enabled: !!sessionId,
  });

  useEffect(() => {
    document.title = 'Chat Details - Admin';
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Chat Not Found</h1>
          <p className="text-gray-600 mb-4">This chat session could not be loaded.</p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  const { session, messages } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 md:ml-64 transition-all duration-300">
          <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chat Session</h1>
              <p className="text-gray-600 mt-1">
                {session.userPhone || session.userId || 'Anonymous User'}
              </p>
            </div>
            <button
              onClick={() => window.close()}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Messages:</span>
              <span className="ml-2 font-medium">{messages.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Started:</span>
              <span className="ml-2 font-medium">
                {new Date(session.createdAt).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Last Active:</span>
              <span className="ml-2 font-medium">
                {new Date(session.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Conversation History</h2>

          {messages.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No messages in this conversation</p>
          ) : (
            <div className="space-y-4">
              {messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm">
                        {msg.role === 'user' ? 'User' : 'AI Assistant'}
                      </span>
                      <span className={`text-xs ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
        </main>
      </div>
    </div>
  );
}
