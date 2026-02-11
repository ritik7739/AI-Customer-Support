'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agentType?: string;
  reasoning?: string;
  createdAt: string;
}

interface ChatInterfaceProps {
  conversationId: string | null;
  onConversationCreated: () => void;
}

const thinkingPhrases = [
  'Thinking',
  'Analyzing',
  'Searching',
  'Processing',
  'Understanding',
  'Evaluating',
  'Checking',
];

export default function ChatInterface({ conversationId, onConversationCreated }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingPhrase, setThinkingPhrase] = useState('Thinking');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (conversationId) {
      loadConversation();
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  const loadConversation = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/conversations/${conversationId}`);
      const data = await response.json();
      if (data.success && data.conversation.messages) {
        setMessages(data.conversation.messages);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setIsTyping(true);
    
    // Set random thinking phrase
    const randomPhrase = thinkingPhrases[Math.floor(Math.random() * thinkingPhrases.length)];
    setThinkingPhrase(randomPhrase);

    // Add user message optimistically
    const tempUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          message: userMessage,
          userId: 'default-user',
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Remove typing indicator
        setIsTyping(false);

        // Add assistant message
        const assistantMessage: Message = {
          id: data.message.id,
          role: 'assistant',
          content: data.message.content,
          agentType: data.agentType,
          reasoning: data.reasoning,
          createdAt: data.message.createdAt,
        };

        setMessages((prev) => [...prev.slice(0, -1), tempUserMessage, assistantMessage]);

        // Notify parent if new conversation was created
        if (!conversationId && data.conversationId) {
          onConversationCreated();
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      // Remove optimistic user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        {messages.length === 0 && !isTyping && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md animate-fade-in">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Send size={40} className="text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome to AI Customer Support
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Our intelligent multi-agent system is ready to help you with support inquiries,
                order tracking, and billing questions.
              </p>
              <div className="mt-6 flex gap-3 justify-center text-xs text-gray-500">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">Support</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">Orders</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">Billing</span>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isTyping && <TypingIndicator thinkingPhrase={thinkingPhrase} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t-2 border-gray-200 p-6 shadow-lg">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              style={{ color: '#111827' }}
              className="flex-1 px-5 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-base bg-white placeholder:text-gray-400 transition-all shadow-sm font-medium"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 size={22} className="animate-spin" />
                  <span>Sending</span>
                </>
              ) : (
                <>
                  <Send size={22} />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
