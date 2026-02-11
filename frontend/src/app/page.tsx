'use client';

import { useState, useEffect, useRef } from 'react';
import ChatInterface from '@/components/ChatInterface';
import ConversationList from '@/components/ConversationList';
import { MessageSquare, Plus } from 'lucide-react';

export default function Home() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);

  const loadConversations = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/conversations?userId=default-user`);
      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleNewConversation = () => {
    setConversationId(null);
  };

  const handleSelectConversation = (id: string) => {
    setConversationId(id);
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/conversations/${id}`, {
        method: 'DELETE',
      });
      setConversations(conversations.filter((c) => c.id !== id));
      if (conversationId === id) {
        setConversationId(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleConversationCreated = () => {
    loadConversations();
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <button
              onClick={handleNewConversation}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <Plus size={20} />
              <span className="font-semibold">New Conversation</span>
            </button>
          </div>

          <ConversationList
            conversations={conversations}
            selectedId={conversationId}
            onSelect={handleSelectConversation}
            onDelete={handleDeleteConversation}
          />
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-blue-50 rounded-xl transition-all hover:scale-110"
            >
              <MessageSquare size={24} className="text-blue-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Customer Support
              </h1>
              <p className="text-sm text-gray-600 font-medium">Multi-agent assistance system</p>
            </div>
          </div>
        </header>

        {/* Chat Interface */}
        <ChatInterface
          conversationId={conversationId}
          onConversationCreated={handleConversationCreated}
        />
      </div>
    </div>
  );
}
