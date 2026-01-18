import React from 'react';
import { useParams } from 'react-router-dom';

const ReportAnalytics: React.FC = () => {
  const { farmId } = useParams<{ farmId: string }>();
  void farmId;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            <i className="fas fa-chart-bar mr-3 text-purple-500"></i>
            Dashboard Analytics
          </h1>
          <div className="flex space-x-2">
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors">
              <i className="fas fa-download mr-2"></i>
              Export
            </button>
          </div>
        </div>
        
        <div className="bg-purple-50 border-l-4 border-purple-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-info-circle text-purple-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-purple-700">
                Comprehensive analytics dashboard for monitoring farm performance and key metrics.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-blue-600">Total Animals</p>
              <i className="fas fa-cow text-blue-400 text-2xl"></i>
            </div>
            <p className="text-3xl font-bold text-blue-700">0</p>
            <p className="text-xs text-blue-500 mt-1">↑ 0% from last month</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-green-600">Total Revenue</p>
              <i className="fas fa-dollar-sign text-green-400 text-2xl"></i>
            </div>
            <p className="text-3xl font-bold text-green-700">$0</p>
            <p className="text-xs text-green-500 mt-1">↑ 0% from last month</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-yellow-600">Total Expenses</p>
              <i className="fas fa-receipt text-yellow-400 text-2xl"></i>
            </div>
            <p className="text-3xl font-bold text-yellow-700">$0</p>
            <p className="text-xs text-yellow-500 mt-1">↓ 0% from last month</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-purple-600">Net Profit</p>
              <i className="fas fa-chart-line text-purple-400 text-2xl"></i>
            </div>
            <p className="text-3xl font-bold text-purple-700">$0</p>
            <p className="text-xs text-purple-500 mt-1">↑ 0% from last month</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Revenue vs Expenses</h3>
            <div className="text-center py-12">
              <i className="fas fa-chart-area text-5xl text-gray-300 mb-3"></i>
              <p className="text-gray-500">Chart visualization coming soon</p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Livestock Distribution</h3>
            <div className="text-center py-12">
              <i className="fas fa-chart-pie text-5xl text-gray-300 mb-3"></i>
              <p className="text-gray-500">Chart visualization coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportAnalytics;
