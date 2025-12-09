export const dynamic = 'force-dynamic';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Tìm mặt | Tìm Gái gọi',
  description: 'Tìm mặt người quen',
};

export default function TimMatPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-text mb-6">Tìm mặt</h1>
          <div className="bg-background-light rounded-lg p-6 space-y-4 text-text">
            <p>Trang tìm mặt sẽ được cập nhật...</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

