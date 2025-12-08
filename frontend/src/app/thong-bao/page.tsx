import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Thông báo | Tìm Gái gọi',
  description: 'Thông báo và cập nhật',
};

export default function ThongBaoPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-text mb-6">Thông báo</h1>
          <div className="bg-background-light rounded-lg p-6 space-y-4 text-text">
            <p>Không có thông báo mới...</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

