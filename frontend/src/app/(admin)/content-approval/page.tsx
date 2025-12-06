'use client';

import { useState } from 'react';

type ApprovalType = 'post' | 'review' | 'verification';

export default function ContentApprovalPage() {
  const [selectedType, setSelectedType] = useState<ApprovalType>('post');

  const posts = [
    {
      id: '1',
      title: 'Bài viết mới từ Nguyễn Thị A',
      content: 'Nội dung bài viết...',
      author: 'Nguyễn Thị A',
      createdAt: '2024-12-06 10:30',
      status: 'pending',
    },
    {
      id: '2',
      title: 'Chia sẻ trải nghiệm',
      content: 'Nội dung bài viết...',
      author: 'Trần Thị B',
      createdAt: '2024-12-06 09:15',
      status: 'pending',
    },
  ];

  const reviews = [
    {
      id: '1',
      title: 'Đánh giá từ Trần Văn B',
      content: 'Dịch vụ rất tốt!',
      author: 'Trần Văn B',
      target: 'Nguyễn Thị A',
      rating: 5,
      createdAt: '2024-12-06 11:00',
      status: 'pending',
    },
  ];

  const verifications = [
    {
      id: '1',
      name: 'Lê Thị C',
      documents: ['cccd_front.jpg', 'cccd_back.jpg'],
      createdAt: '2024-12-06 08:00',
      status: 'pending',
    },
  ];

  const getItems = () => {
    switch (selectedType) {
      case 'post':
        return posts;
      case 'review':
        return reviews;
      case 'verification':
        return verifications;
      default:
        return [];
    }
  };

  const handleApprove = (id: string) => {
    // TODO: Call API to approve
    console.log('Approve', id);
  };

  const handleReject = (id: string) => {
    // TODO: Call API to reject
    console.log('Reject', id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Duyệt nội dung</h1>
        <p className="text-text-muted">Duyệt bài viết, đánh giá và yêu cầu xác thực</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-secondary/30">
        <button
          onClick={() => setSelectedType('post')}
          className={`
            px-4 py-2 font-medium transition-colors border-b-2
            ${
              selectedType === 'post'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text'
            }
          `}
        >
          Bài viết ({posts.length})
        </button>
        <button
          onClick={() => setSelectedType('review')}
          className={`
            px-4 py-2 font-medium transition-colors border-b-2
            ${
              selectedType === 'review'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text'
            }
          `}
        >
          Đánh giá ({reviews.length})
        </button>
        <button
          onClick={() => setSelectedType('verification')}
          className={`
            px-4 py-2 font-medium transition-colors border-b-2
            ${
              selectedType === 'verification'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text'
            }
          `}
        >
          Xác thực ({verifications.length})
        </button>
      </div>

      {/* Content List */}
      <div className="space-y-4">
        {getItems().length === 0 ? (
          <div className="bg-background-light rounded-lg border border-secondary/30 p-12 text-center">
            <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-text-muted">Không có nội dung nào chờ duyệt</p>
          </div>
        ) : (
          getItems().map((item: any) => (
            <div
              key={item.id}
              className="bg-background-light rounded-lg border border-secondary/30 p-6"
            >
              {selectedType === 'post' && (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-text mb-2">{item.title}</h3>
                      <p className="text-sm text-text-muted mb-1">Tác giả: {item.author}</p>
                      <p className="text-xs text-text-muted">{item.createdAt}</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded text-xs font-medium">
                      Chờ duyệt
                    </span>
                  </div>
                  <p className="text-text mb-4">{item.content}</p>
                </>
              )}

              {selectedType === 'review' && (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-text mb-2">{item.title}</h3>
                      <p className="text-sm text-text-muted mb-1">
                        Từ {item.author} về {item.target}
                      </p>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < item.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-xs text-text-muted">{item.createdAt}</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded text-xs font-medium">
                      Chờ duyệt
                    </span>
                  </div>
                  <p className="text-text mb-4">{item.content}</p>
                </>
              )}

              {selectedType === 'verification' && (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-text mb-2">{item.name}</h3>
                      <p className="text-xs text-text-muted">{item.createdAt}</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded text-xs font-medium">
                      Chờ duyệt
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {item.documents.map((doc: string, index: number) => (
                      <div
                        key={index}
                        className="aspect-video bg-background border border-secondary/50 rounded-lg flex items-center justify-center"
                      >
                        <span className="text-text-muted">📄 {doc}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4 border-t border-secondary/30">
                <button
                  onClick={() => handleApprove(item.id)}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Duyệt
                </button>
                <button
                  onClick={() => handleReject(item.id)}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Từ chối
                </button>
                <button className="px-6 py-2 bg-background border border-secondary/50 text-text rounded-lg hover:bg-background-light transition-colors">
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

