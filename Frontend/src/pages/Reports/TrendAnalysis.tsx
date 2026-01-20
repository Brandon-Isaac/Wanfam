import React, { useState } from 'react';
import { } from 'react-router-dom';

const TrendAnalysis: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            <i className="fas fa-chart-line mr-3 text-green-500"></i>
            Trend Analysis
          </h1>
          <div className="flex space-x-2">
            {['week', 'month', 'quarter', 'year'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  timeRange === range
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-info-circle text-green-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Analyze trends in farm performance, livestock health, and financial metrics over time.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-blue-600">Production Trend</h3>
              <i className="fas fa-arrow-up text-green-500"></i>
            </div>
            <p className="text-3xl font-bold text-blue-700 mb-1">+12%</p>
            <p className="text-xs text-blue-500">vs previous period</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-purple-600">Health Score</h3>
              <i className="fas fa-arrow-up text-green-500"></i>
            </div>
            <p className="text-3xl font-bold text-purple-700 mb-1">+8%</p>
            <p className="text-xs text-purple-500">vs previous period</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-orange-600">Cost Efficiency</h3>
              <i className="fas fa-arrow-down text-red-500"></i>
            </div>
            <p className="text-3xl font-bold text-orange-700 mb-1">-5%</p>
            <p className="text-xs text-orange-500">vs previous period</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
            <div className="text-center py-16">
              <i className="fas fa-chart-area text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-600">Revenue trend visualization</p>
              <p className="text-sm text-gray-500 mt-1">Chart coming soon</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Livestock Growth</h3>
              <div className="text-center py-12">
                <i className="fas fa-chart-line text-5xl text-gray-300 mb-3"></i>
                <p className="text-gray-500">Growth trend visualization</p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Health Trends</h3>
              <div className="text-center py-12">
                <i className="fas fa-heartbeat text-5xl text-gray-300 mb-3"></i>
                <p className="text-gray-500">Health trend visualization</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendAnalysis;
