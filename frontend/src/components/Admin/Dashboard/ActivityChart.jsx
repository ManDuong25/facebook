import React from 'react';

const ActivityChart = ({ data }) => {
  // Giả lập biểu đồ đơn giản bằng CSS
  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Thống kê hoạt động trong 30 ngày qua</h3>

      <div className="flex flex-col space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-24 text-sm text-gray-600">{item.label}</div>
            <div className="flex-1">
              <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="w-12 text-right text-sm font-medium">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityChart;
