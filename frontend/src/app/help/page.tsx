import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Trung tâm trợ giúp | Tìm Gái gọi',
  description: 'Hướng dẫn sử dụng và hỗ trợ',
};

export default function HelpPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-text mb-6">Trung tâm trợ giúp</h1>
          <div className="bg-background-light rounded-lg p-6 space-y-4 text-text">
            <p>Nội dung hướng dẫn sẽ được cập nhật...</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

