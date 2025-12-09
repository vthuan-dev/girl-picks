import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chính sách bảo mật | Tìm Gái gọi',
  description: 'Chính sách bảo mật và quyền riêng tư',
};

async function getPrivacyContent() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/settings/public/privacyContent`, {
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

export default async function PrivacyPage() {
  const privacyContent = await getPrivacyContent();

  return (
    <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-text mb-6">Chính sách bảo mật</h1>
          <div className="bg-background-light rounded-xl p-6 md:p-8 border border-secondary/30 shadow-lg">
            {privacyContent ? (
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
                dangerouslySetInnerHTML={{ __html: privacyContent }}
              />
            ) : (
              <div className="text-text-muted space-y-4">
                <h2 className="text-xl font-bold text-text">1. Thu thập thông tin</h2>
                <p>Chúng tôi thu thập thông tin cá nhân khi bạn đăng ký tài khoản, bao gồm email, số điện thoại và tên.</p>
                
                <h2 className="text-xl font-bold text-text mt-6">2. Sử dụng thông tin</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Cung cấp và cải thiện dịch vụ</li>
                  <li>Liên hệ với bạn về các cập nhật quan trọng</li>
                  <li>Bảo vệ an toàn tài khoản của bạn</li>
                </ul>

                <h2 className="text-xl font-bold text-text mt-6">3. Bảo mật thông tin</h2>
                <p>Chúng tôi sử dụng các biện pháp bảo mật tiên tiến để bảo vệ thông tin cá nhân của bạn.</p>

                <h2 className="text-xl font-bold text-text mt-6">4. Quyền của bạn</h2>
                <p>Bạn có quyền truy cập, chỉnh sửa hoặc xóa thông tin cá nhân của mình bất cứ lúc nào.</p>
              </div>
            )}
          </div>
        </div>
    </main>
  );
}
