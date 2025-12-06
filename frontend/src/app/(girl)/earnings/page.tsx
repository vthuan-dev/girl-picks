'use client';

import { useState } from 'react';

export default function EarningsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const periods = [
    { label: 'Hôm nay', value: 'today' },
    { label: 'Tuần này', value: 'week' },
    { label: 'Tháng này', value: 'month' },
    { label: 'Năm nay', value: 'year' },
  ];

  const earnings = [
    {
      id: '1',
      date: '2024-12-06',
      service: 'Đi chơi',
      customer: 'Nguyễn Văn A',
      amount: 600000,
      status: 'completed',
    },
    {
      id: '2',
      date: '2024-12-05',
      service: 'Đi ăn tối',
      customer: 'Trần Thị B',
      amount: 900000,
      status: 'completed',
    },
    {
      id: '3',
      date: '2024-12-04',
      service: 'Qua đêm',
      customer: 'Lê Văn C',
      amount: 3000000,
      status: 'completed',
    },
  ];

  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Thu nhập</h1>
        <p className="text-text-muted">Theo dõi thu nhập của bạn</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-background-light rounded-lg border border-secondary/30 p-6">
          <p className="text-sm text-text-muted mb-2">Tổng thu nhập</p>
          <p className="text-3xl font-bold text-text">{totalEarnings.toLocaleString('vi-VN')}đ</p>
        </div>
        <div className="bg-background-light rounded-lg border border-secondary/30 p-6">
          <p className="text-sm text-text-muted mb-2">Số đơn hoàn thành</p>
          <p className="text-3xl font-bold text-text">{earnings.length}</p>
        </div>
        <div className="bg-background-light rounded-lg border border-secondary/30 p-6">
          <p className="text-sm text-text-muted mb-2">Trung bình/đơn</p>
          <p className="text-3xl font-bold text-text">
            {Math.round(totalEarnings / earnings.length).toLocaleString('vi-VN')}đ
          </p>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2">
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => setSelectedPeriod(period.value)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${
                selectedPeriod === period.value
                  ? 'bg-primary text-white'
                  : 'bg-background-light border border-secondary/50 text-text hover:bg-primary/10 hover:border-primary/50'
              }
            `}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Earnings List */}
      <div className="bg-background-light rounded-lg border border-secondary/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background border-b border-secondary/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Ngày
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Dịch vụ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/30">
              {earnings.map((earning) => (
                <tr key={earning.id} className="hover:bg-background transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                    {new Date(earning.date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                    {earning.service}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                    {earning.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-primary font-bold">
                      {earning.amount.toLocaleString('vi-VN')}đ
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs font-medium">
                      Đã hoàn thành
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

