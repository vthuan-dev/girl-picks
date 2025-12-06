'use client';

import { useState } from 'react';
import MessageBubble from '@/components/messages/MessageBubble';

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1');
  const [message, setMessage] = useState('');

  const conversations = [
    {
      id: '1',
      name: 'Nguyễn Thị A',
      avatar: null,
      lastMessage: 'Cảm ơn bạn nhiều!',
      time: '10:30',
      unread: 2,
    },
    {
      id: '2',
      name: 'Trần Thị B',
      avatar: null,
      lastMessage: 'Bạn có rảnh tối nay không?',
      time: '09:15',
      unread: 0,
    },
  ];

  const messages = [
    {
      id: '1',
      senderId: 'customer',
      content: 'Xin chào!',
      time: '10:00',
      isRead: true,
    },
    {
      id: '2',
      senderId: 'girl',
      content: 'Chào bạn! Bạn cần tư vấn gì không?',
      time: '10:01',
      isRead: true,
    },
    {
      id: '3',
      senderId: 'customer',
      content: 'Tôi muốn đặt lịch tối nay',
      time: '10:05',
      isRead: true,
    },
    {
      id: '4',
      senderId: 'girl',
      content: 'Cảm ơn bạn nhiều!',
      time: '10:30',
      isRead: false,
    },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // TODO: Send message via WebSocket
      setMessage('');
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Conversations List */}
      <div className="w-full md:w-80 bg-background-light rounded-lg border border-secondary/30 p-4 flex flex-col">
        <h2 className="text-lg font-bold text-text mb-4">Tin nhắn</h2>
        <div className="flex-1 overflow-y-auto space-y-2">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversation(conv.id)}
              className={`
                w-full p-3 rounded-lg text-left transition-colors
                ${
                  selectedConversation === conv.id
                    ? 'bg-primary/20 border border-primary/50'
                    : 'bg-background border border-secondary/30 hover:bg-background-light'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">
                    {conv.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-text truncate">{conv.name}</p>
                    <span className="text-xs text-text-muted">{conv.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-text-muted truncate">{conv.lastMessage}</p>
                    {conv.unread > 0 && (
                      <span className="px-2 py-0.5 bg-primary text-white rounded-full text-xs font-medium">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-background-light rounded-lg border border-secondary/30 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-secondary/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">
                    {conversations.find(c => c.id === selectedConversation)?.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-text">
                    {conversations.find(c => c.id === selectedConversation)?.name}
                  </p>
                  <p className="text-xs text-text-muted">Đang hoạt động</p>
                </div>
              </div>
              <button className="p-2 hover:bg-background rounded-lg transition-colors">
                <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-secondary/30">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-4 py-2 bg-background border border-secondary/50 rounded-lg text-text focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-text-muted">Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

