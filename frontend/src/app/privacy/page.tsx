import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Chính sách bảo mật | Tìm Gái gọi',
  description: 'Chính sách bảo mật thông tin',
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-text mb-6">Chính sách bảo mật</h1>
          <div className="bg-background-light rounded-lg p-6 space-y-4 text-text">
            <p>Nội dung chính sách bảo mật sẽ được cập nhật...</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

