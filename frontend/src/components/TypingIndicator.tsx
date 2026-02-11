'use client';

interface TypingIndicatorProps {
  thinkingPhrase?: string;
}

export default function TypingIndicator({ thinkingPhrase = 'Thinking' }: TypingIndicatorProps) {
  return (
    <div className="flex gap-3 justify-start animate-fade-in">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md">
        <span className="text-white text-sm font-semibold">AI</span>
      </div>
      <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-300 px-5 py-3 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 font-medium">{thinkingPhrase}...</span>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full typing-dot"></div>
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full typing-dot"></div>
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full typing-dot"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
