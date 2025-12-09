export const dynamic = 'force-dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Điều khoản sử dụng | Tìm Gái gọi',
  description: 'Điều khoản và điều kiện sử dụng dịch vụ',
};

async function getTermsContent() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/settings/public/termsContent`, {
      next: { revalidate: 60 },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.value || data.value || null;
  } catch {
    return null;
  }
}

export default async function TermsPage() {
  const termsContent = await getTermsContent();

  return (
    <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-text mb-6">Điều khoản sử dụng</h1>
          <div className="bg-background-light rounded-xl p-6 md:p-8 border border-secondary/30 shadow-lg">
            {termsContent ? (
              <div 
                className="prose prose-invert max-w-none text-text
                  prose-headings:text-text prose-headings:font-bold
                  prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3
                  prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2
                  prose-p:text-text-muted prose-p:leading-relaxed prose-p:mb-4
                  prose-ul:text-text-muted prose-ul:my-4
                  prose-li:my-1
                  prose-strong:text-text prose-strong:font-semibold
                  prose-a:text-primary prose-a:hover:text-primary-hover"
                dangerouslySetInnerHTML={{ __html: termsContent }}
              />
            ) : (
              <div className="text-text-muted space-y-4">
                <h2 className="text-xl font-bold text-text">1. Chấp nhận điều khoản</h2>
                <p>Bằng việc truy cập và sử dụng website, bạn đồng ý tuân thủ các điều khoản và điều kiện sau đây.</p>
                
                <h2 className="text-xl font-bold text-text mt-6">2. Quyền sử dụng</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Bạn được cấp quyền sử dụng dịch vụ cho mục đích cá nhân</li>
                  <li>Không được sao chép, phân phối nội dung mà không có sự cho phép</li>
                  <li>Không được sử dụng bot hoặc công cụ tự động</li>
                </ul>

                <h2 className="text-xl font-bold text-text mt-6">3. Giới hạn trách nhiệm</h2>
                <p>Chúng tôi không chịu trách nhiệm về bất kỳ thiệt hại nào phát sinh từ việc sử dụng dịch vụ.</p>

                <h2 className="text-xl font-bold text-text mt-6">4. Thay đổi điều khoản</h2>
                <p>Chúng tôi có quyền thay đổi điều khoản bất cứ lúc nào. Việc tiếp tục sử dụng dịch vụ đồng nghĩa với việc bạn chấp nhận các thay đổi.</p>
              </div>
            )}
          </div>
        </div>
    </main>
  );
}
