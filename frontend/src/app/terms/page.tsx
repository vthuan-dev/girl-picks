import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Điều khoản | Tìm Gái gọi',
  description: 'Điều khoản sử dụng dịch vụ',
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-text mb-6">Điều khoản sử dụng</h1>
          <div className="bg-background-light rounded-lg p-6 space-y-4 text-text">
            <p>Nội dung điều khoản sẽ được cập nhật...</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

