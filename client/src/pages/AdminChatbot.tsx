/**
 * Admin Chatbot Management Page
 *
 * Allows admins to view chats, manage knowledge base, and configure chatbot settings
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Book, Settings, RefreshCw, Trash2, Plus } from 'lucide-react';
import Navigation from '@/components/Navigation';
import AdminSidebar from '@/components/AdminSidebar';

interface ChatSession {
  id: string;
  userId: string;
  userPhone?: string;
  userName?: string;
  messageCount: number;
  lastMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface KnowledgeEntry {
  id: string;
  type: string;
  title: string;
  content: string;
  category: string;
  lastUpdated: Date;
  autoUpdate: boolean;
}

interface ChatbotSettings {
  id: string;
  welcomeMessage: string;
  responseStyle: string;
  maxMessageLength: number;
  rateLimitPerHour: number;
  enabledFeatures: {
    autoUpdate: boolean;
    contextAwareness: boolean;
    propertyRecommendations: boolean;
  };
}

export default function AdminChatbot() {
  const [selectedTab, setSelectedTab] = useState<'chats' | 'knowledge' | 'settings'>('chats');
  const queryClient = useQueryClient();

  const showToast = (title: string, description: string, isError = false) => {
    const message = `${title}: ${description}`;
    if (isError) {
      console.error(message);
      alert(message);
    } else {
      console.log(message);
    }
  };

  // Fetch chat sessions
  const { data: chats, isLoading: chatsLoading } = useQuery({
    queryKey: ['admin-chats'],
    queryFn: async () => {
      const res = await fetch('/api/chatbot/admin/chats', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch chats');
      const data = await res.json();
      return data.sessions as ChatSession[];
    },
  });

  // Fetch knowledge base
  const { data: knowledge, isLoading: knowledgeLoading } = useQuery({
    queryKey: ['admin-knowledge'],
    queryFn: async () => {
      const res = await fetch('/api/chatbot/admin/knowledge', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch knowledge');
      const data = await res.json();
      return data.knowledge as KnowledgeEntry[];
    },
  });

  // Fetch settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['chatbot-settings'],
    queryFn: async () => {
      const res = await fetch('/api/chatbot/admin/settings', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      return data.settings as ChatbotSettings;
    },
  });

  // Update knowledge mutation
  const updateKnowledge = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/chatbot/admin/knowledge/update', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to update knowledge');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-knowledge'] });
      showToast('Success', 'Knowledge base updated successfully');
    },
    onError: () => {
      showToast('Error', 'Failed to update knowledge base', true);
    },
  });

  // Delete knowledge entry
  const deleteKnowledge = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/chatbot/admin/knowledge/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete knowledge');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-knowledge'] });
      showToast('Success', 'Knowledge entry deleted');
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 md:ml-64 transition-all duration-300">
          <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Chatbot Management</h1>
        <p className="text-gray-600 mt-2">
          Manage chatbot conversations, knowledge base, and settings
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedTab('chats')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              selectedTab === 'chats'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chats
          </button>
          <button
            onClick={() => setSelectedTab('knowledge')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              selectedTab === 'knowledge'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <Book className="w-4 h-4" />
            Knowledge Base
          </button>
          <button
            onClick={() => setSelectedTab('settings')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              selectedTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      {/* Chats Tab */}
      {selectedTab === 'chats' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Chat Sessions</h2>
            <p className="text-sm text-gray-600">
              View and manage all chatbot conversations
            </p>
          </div>
          <hr className="my-4" />

          {chatsLoading ? (
            <div className="text-center py-8">Loading chats...</div>
          ) : chats && chats.length > 0 ? (
            <div className="space-y-4">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">
                          {chat.userPhone || chat.userId || 'Anonymous'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {chat.messageCount} messages
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {chat.lastMessage || 'No messages yet'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Last active:{' '}
                        {new Date(chat.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        window.open(
                          `/admin/chatbot/chat/${chat.id}`,
                          '_blank'
                        );
                      }}
                      className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 text-sm"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No chat sessions yet
            </div>
          )}
        </div>
      )}

      {/* Knowledge Base Tab */}
      {selectedTab === 'knowledge' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">Knowledge Base</h2>
              <p className="text-sm text-gray-600">
                Manage chatbot knowledge and auto-updates
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateKnowledge.mutate()}
                disabled={updateKnowledge.isPending}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-4 h-4" />
                Update Now
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                Add Entry
              </button>
            </div>
          </div>
          <hr className="my-4" />

          {knowledgeLoading ? (
            <div className="text-center py-8">Loading knowledge base...</div>
          ) : knowledge && knowledge.length > 0 ? (
            <div className="space-y-4">
              {knowledge.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Book className="w-4 h-4 text-green-600" />
                        <span className="font-medium">{entry.title}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {entry.category}
                        </span>
                        {entry.autoUpdate && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Auto-update
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                        {entry.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Last updated:{' '}
                        {new Date(entry.lastUpdated).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 text-sm">
                        Edit
                      </button>
                      <button
                        onClick={() => deleteKnowledge.mutate(entry.id)}
                        disabled={
                          entry.autoUpdate || deleteKnowledge.isPending
                        }
                        className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No knowledge entries yet
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {selectedTab === 'settings' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Chatbot Settings</h2>
            <p className="text-sm text-gray-600">
              Configure chatbot behavior and features
            </p>
          </div>
          <hr className="my-4" />

          {settingsLoading ? (
            <div className="text-center py-8">Loading settings...</div>
          ) : settings ? (
            <div className="space-y-6">
              <div>
                <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700">
                  Welcome Message
                </label>
                <input
                  id="welcomeMessage"
                  type="text"
                  defaultValue={settings.welcomeMessage}
                  className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="responseStyle" className="block text-sm font-medium text-gray-700">
                  Response Style
                </label>
                <select
                  id="responseStyle"
                  defaultValue={settings.responseStyle}
                  className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="friendly">Friendly</option>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                </select>
              </div>

              <div>
                <label htmlFor="maxLength" className="block text-sm font-medium text-gray-700">
                  Max Message Length
                </label>
                <input
                  id="maxLength"
                  type="number"
                  defaultValue={settings.maxMessageLength}
                  className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="rateLimit" className="block text-sm font-medium text-gray-700">
                  Rate Limit (per hour)
                </label>
                <input
                  id="rateLimit"
                  type="number"
                  defaultValue={settings.rateLimitPerHour}
                  className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Enabled Features</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked={settings.enabledFeatures.autoUpdate}
                      className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm">Auto-update knowledge base</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked={
                        settings.enabledFeatures.contextAwareness
                      }
                      className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm">Context awareness</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked={
                        settings.enabledFeatures.propertyRecommendations
                      }
                      className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm">Property recommendations</span>
                  </label>
                </div>
              </div>

              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Save Settings
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Failed to load settings
            </div>
          )}
        </div>
      )}
          </div>
        </main>
      </div>
    </div>
  );
}
