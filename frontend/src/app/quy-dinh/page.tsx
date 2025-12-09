import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quy định | Tìm Gái gọi',
  description: 'Quy định và điều khoản sử dụng dịch vụ',
};

async function getRulesContent() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/settings/public/rulesContent`,
      {
        next: { revalidate: 60 },
        cache: 'no-store',
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.value || data.value || null;
  } catch {
    return null;
  }
}

export default async function QuyDinhPage() {
  const rulesContent = await getRulesContent();

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-background-light">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/20 rounded-xl">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-text">Quy định</h1>
              <p className="text-text-muted text-sm mt-1">
                Cập nhật lần cuối: Tháng 12, 2025
              </p>
            </div>
          </div>
          <p className="text-text-muted max-w-2xl">
            Vui lòng đọc kỹ các quy định dưới đây trước khi sử dụng dịch vụ của chúng tôi.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-background-light/80 backdrop-blur-sm rounded-2xl border border-secondary/20 shadow-xl overflow-hidden">
          {/* Table of Contents */}
          <div className="bg-gradient-to-r from-primary/10 to-transparent p-6 border-b border-secondary/20">
            <h2 className="text-lg font-semibold text-text mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Mục lục
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['Quy định chung', 'Điều kiện sử dụng', 'Hành vi bị cấm', 'Trách nhiệm', 'Xử lý vi phạm', 'Liên hệ'].map(
                (item, index) => (
                  <a
                    key={index}
                    href={`#section-${index + 1}`}
                    className="text-sm text-text-muted hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                      {index + 1}
                    </span>
                    {item}
                  </a>
                )
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 md:p-8">
            {rulesContent ? (
              <div
                className="prose prose-invert max-w-none
                  prose-headings:text-text prose-headings:font-bold prose-headings:flex prose-headings:items-center prose-headings:gap-3
                  prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b prose-h2:border-secondary/20
                  prose-h3:text-lg prose-h3:mt-5 prose-h3:mb-3
                  prose-p:text-text-muted prose-p:leading-relaxed prose-p:mb-4
                  prose-ul:text-text-muted prose-ul:my-4 prose-ul:space-y-2
                  prose-li:my-0 prose-li:pl-2
                  prose-strong:text-primary prose-strong:font-semibold
                  prose-a:text-primary prose-a:hover:text-primary-hover prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: rulesContent }}
              />
            ) : (
              <DefaultContent />
            )}
          </div>

          {/* Footer Note */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-6 border-t border-secondary/20">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg shrink-0">
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-text mb-1">Lưu ý quan trọng</h3>
                <p className="text-sm text-text-muted">
                  Việc sử dụng dịch vụ đồng nghĩa với việc bạn đã đọc, hiểu và đồng ý với tất cả các quy định trên. Chúng
                  tôi có quyền thay đổi quy định bất cứ lúc nào mà không cần thông báo trước.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function DefaultContent() {
  const sections = [
    {
      id: 1,
      title: 'Quy định chung',
      icon: '📋',
      content: (
        <p>
          Chào mừng bạn đến với website của chúng tôi. Khi sử dụng dịch vụ, bạn đồng ý tuân thủ các quy định sau đây. Vui
          lòng đọc kỹ trước khi sử dụng.
        </p>
      ),
    },
    {
      id: 2,
      title: 'Điều kiện sử dụng',
      icon: '✅',
      content: (
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-sm shrink-0 mt-0.5">
              ✓
            </span>
            <span>
              <strong className="text-text">Độ tuổi:</strong> Bạn phải đủ 18 tuổi trở lên để sử dụng dịch vụ
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-sm shrink-0 mt-0.5">
              ✓
            </span>
            <span>
              <strong className="text-text">Mục đích:</strong> Không được sử dụng dịch vụ cho mục đích bất hợp pháp
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-sm shrink-0 mt-0.5">
              ✓
            </span>
            <span>
              <strong className="text-text">Tôn trọng:</strong> Tôn trọng quyền riêng tư và nhân phẩm của người khác
            </span>
          </li>
        </ul>
      ),
    },
    {
      id: 3,
      title: 'Hành vi bị cấm',
      icon: '🚫',
      content: (
        <ul className="space-y-3">
          {[
            'Đăng tải nội dung vi phạm pháp luật',
            'Quấy rối, đe dọa hoặc xúc phạm người khác',
            'Sử dụng thông tin giả mạo',
            'Spam hoặc quảng cáo trái phép',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-sm shrink-0 mt-0.5">
                ✕
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: 4,
      title: 'Trách nhiệm',
      icon: '⚖️',
      content: (
        <p>
          Chúng tôi không chịu trách nhiệm về nội dung do người dùng đăng tải. Mọi giao dịch giữa các bên là tự nguyện và
          tự chịu trách nhiệm. Website chỉ đóng vai trò là nền tảng kết nối.
        </p>
      ),
    },
    {
      id: 5,
      title: 'Xử lý vi phạm',
      icon: '⚠️',
      content: (
        <div className="space-y-3">
          <p>Người dùng vi phạm quy định có thể bị:</p>
          <div className="grid gap-2">
            {[
              { level: 'Nhẹ', action: 'Cảnh cáo lần đầu', color: 'yellow' },
              { level: 'Trung bình', action: 'Khóa tài khoản tạm thời', color: 'orange' },
              { level: 'Nghiêm trọng', action: 'Khóa tài khoản vĩnh viễn', color: 'red' },
            ].map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-lg bg-${item.color}-500/10 border border-${item.color}-500/20`}
              >
                <span className={`text-${item.color}-500 font-medium text-sm`}>{item.level}:</span>
                <span className="text-text-muted">{item.action}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 6,
      title: 'Liên hệ',
      icon: '📞',
      content: (
        <div className="grid md:grid-cols-2 gap-4">
          <a
            href="mailto:support@timgaigoi.com"
            className="flex items-center gap-3 p-4 bg-background rounded-xl border border-secondary/30 hover:border-primary/50 transition-all group"
          >
            <div className="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs text-text-muted">Email</p>
              <p className="text-text font-medium">support@timgaigoi.com</p>
            </div>
          </a>
          <a
            href="tel:0909123456"
            className="flex items-center gap-3 p-4 bg-background rounded-xl border border-secondary/30 hover:border-primary/50 transition-all group"
          >
            <div className="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs text-text-muted">Hotline</p>
              <p className="text-text font-medium">0909 xxx xxx</p>
            </div>
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <section key={section.id} id={`section-${section.id}`} className="scroll-mt-24">
          <h2 className="text-xl font-bold text-text flex items-center gap-3 pb-3 border-b border-secondary/20 mb-4">
            <span className="text-2xl">{section.icon}</span>
            <span>
              {section.id}. {section.title}
            </span>
          </h2>
          <div className="text-text-muted leading-relaxed">{section.content}</div>
        </section>
      ))}
    </div>
  );
}
