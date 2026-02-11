'use client';

import { Bot, User, Info } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agentType?: string;
  reasoning?: string;
  createdAt: string;
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  const getAgentBadge = (agentType?: string) => {
    const badges: { [key: string]: { label: string; color: string } } = {
      support: { label: 'Support Agent', color: 'bg-green-100 text-green-800' },
      order: { label: 'Order Agent', color: 'bg-blue-100 text-blue-800' },
      billing: { label: 'Billing Agent', color: 'bg-purple-100 text-purple-800' },
    };

    return badges[agentType || ''] || null;
  };

  const badge = !isUser ? getAgentBadge(message.agentType) : null;

  return (
    <div className={`flex gap-2 sm:gap-3 ${isUser ? 'justify-end animate-slide-in-right' : 'justify-start animate-slide-in-left'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
          <Bot size={16} className="text-white sm:w-5 sm:h-5" />
        </div>
      )}

      <div className={`max-w-[85%] sm:max-w-xl md:max-w-2xl ${isUser ? 'order-1' : ''}`}>
        <div
          className={`px-3 py-2 sm:px-5 sm:py-3 rounded-2xl shadow-md transition-all hover:shadow-lg ${
            isUser
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
              : 'bg-white border-2 border-gray-200 text-gray-900'
          }`}
        >
          {badge && (
            <div className="mb-2">
              <span className={`inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-semibold shadow-sm ${badge.color}`}>
                {badge.label}
              </span>
            </div>
          )}
          <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base break-words">{message.content}</p>
          
          {message.reasoning && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-start gap-2 text-xs text-gray-600">
                <Info size={14} className="flex-shrink-0 mt-0.5 text-blue-500" />
                <span className="italic font-medium">{message.reasoning}</span>
              </div>
            </div>
          )}
        </div>
        <div className={`mt-1.5 text-xs text-gray-500 font-medium ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.createdAt).toLocaleTimeString()}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center order-2 shadow-lg">
          <User size={16} className="text-white sm:w-5 sm:h-5" />
        </div>
      )}
    </div>
  );
}
