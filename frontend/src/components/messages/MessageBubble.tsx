'use client';

import { useAuthStore } from '@/store/auth.store';

interface Message {
  id: string;
  senderId: string;
  content: string;
  time: string;
  isRead: boolean;
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { user } = useAuthStore();
  const isOwn = message.senderId === 'customer'; // TODO: Compare with actual user ID

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[70%] rounded-lg px-4 py-2
          ${
            isOwn
              ? 'bg-primary text-white rounded-br-none'
              : 'bg-background border border-secondary/50 text-text rounded-bl-none'
          }
        `}
      >
        <p className="text-sm">{message.content}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className={`text-xs ${isOwn ? 'text-white/70' : 'text-text-muted'}`}>
            {message.time}
          </span>
          {isOwn && (
            <svg
              className={`w-3 h-3 ${message.isRead ? 'text-blue-300' : 'text-white/50'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

