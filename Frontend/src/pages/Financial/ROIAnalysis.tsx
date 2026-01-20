import React from 'react';

const ROIAnalysis: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            <i className="fas fa-chart-line mr-3 text-green-500"></i>
            ROI Analysis
          </h1>
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
            <i className="fas fa-calculator mr-2"></i>
            Calculate ROI
          </button>
        </div>
        
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-info-circle text-green-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Analyze return on investment for your farm operations and make data-driven decisions.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-blue-600">Total Investment</p>
              <i className="fas fa-wallet text-blue-400"></i>
            </div>
            <p className="text-2xl font-bold text-blue-700">$0.00</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-green-600">Total Returns</p>
              <i className="fas fa-money-bill-trend-up text-green-400"></i>
            </div>
            <p className="text-2xl font-bold text-green-700">$0.00</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-yellow-600">Net Profit</p>
              <i className="fas fa-sack-dollar text-yellow-400"></i>
            </div>
            <p className="text-2xl font-bold text-yellow-700">$0.00</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-purple-600">ROI Percentage</p>
              <i className="fas fa-percentage text-purple-400"></i>
            </div>
            <p className="text-2xl font-bold text-purple-700">0%</p>
          </div>
        </div>

        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <i className="fas fa-chart-pie text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-600 text-lg">ROI Analysis Dashboard</p>
          <p className="text-gray-500 mt-2">Track investment returns and profitability metrics</p>
        </div>
      </div>
    </div>
  );
};

export default ROIAnalysis;
