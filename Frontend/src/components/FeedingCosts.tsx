import React from 'react';
import { useParams } from 'react-router-dom';

const FeedingCosts: React.FC = () => {
  const { farmId } = useParams<{ farmId: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            <i className="fas fa-dollar-sign mr-3 text-yellow-500"></i>
            Feeding Cost Tracker
          </h1>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-info-circle text-yellow-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Track and analyze feeding costs across your farm to optimize your budget.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Monthly Cost</p>
                <p className="text-2xl font-bold text-yellow-700">$0.00</p>
              </div>
              <i className="fas fa-calendar-alt text-3xl text-yellow-400"></i>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Cost per Animal</p>
                <p className="text-2xl font-bold text-green-700">$0.00</p>
              </div>
              <i className="fas fa-cow text-3xl text-green-400"></i>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Yearly</p>
                <p className="text-2xl font-bold text-blue-700">$0.00</p>
              </div>
              <i className="fas fa-chart-line text-3xl text-blue-400"></i>
            </div>
          </div>
        </div>

        <div className="text-center py-12">
          <i className="fas fa-money-bill-wave text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-600 text-lg">Feeding Cost Analytics</p>
          <p className="text-gray-500 mt-2">Track expenses and optimize feed budget</p>
        </div>
      </div>
    </div>
  );
};

export default FeedingCosts;
