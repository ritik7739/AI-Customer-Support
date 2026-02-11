'use client';

import { MessageSquare, Trash2 } from 'lucide-react';

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messages: any[];
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onDelete,
}: ConversationListProps) {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      {conversations.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <MessageSquare size={48} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No conversations yet</p>
          <p className="text-xs mt-1">Start a new chat to begin</p>
        </div>
      ) : (
        <div className="p-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`group relative p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                selectedId === conversation.id
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
              onClick={() => onSelect(conversation.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {conversation.title || 'New Conversation'}
                  </h3>
                  {conversation.messages && conversation.messages.length > 0 && (
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {conversation.messages[0].content}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(conversation.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conversation.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                  title="Delete conversation"
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
