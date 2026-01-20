import React, { useState } from 'react';
import { } from 'react-router-dom';

const ReportGenerator: React.FC = () => {
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const reportTypes = [
    { id: 'comprehensive', name: 'Comprehensive Farm Report', icon: 'fa-file-alt', description: 'Complete overview of all farm operations' },
    { id: 'financial', name: 'Financial Summary', icon: 'fa-dollar-sign', description: 'Revenue, expenses, and profitability' },
    { id: 'livestock', name: 'Livestock Report', icon: 'fa-cow', description: 'Animal inventory and health status' },
    { id: 'production', name: 'Production Report', icon: 'fa-chart-bar', description: 'Milk, meat, and other product outputs' },
    { id: 'health', name: 'Health Report', icon: 'fa-heartbeat', description: 'Veterinary records and health metrics' },
    { id: 'custom', name: 'Custom Report', icon: 'fa-cog', description: 'Build your own custom report' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            <i className="fas fa-file-invoice mr-3 text-indigo-500"></i>
            Report Generator
          </h1>
        </div>
        
        <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-info-circle text-indigo-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-indigo-700">
                Generate customized reports for your farm operations, finances, and livestock management.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Select Report Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {reportTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                    reportType === type.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      reportType === type.id ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      <i className={`fas ${type.icon}`}></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1">{type.name}</h4>
                      <p className="text-xs text-gray-600">{type.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Date Range</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Report Preview</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Type:</span>
                <span className="font-semibold">
                  {reportType ? reportTypes.find(t => t.id === reportType)?.name : 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Date Range:</span>
                <span className="font-semibold">
                  {dateRange.start && dateRange.end ? `${dateRange.start} to ${dateRange.end}` : 'Not set'}
                </span>
              </div>
            </div>

            <button
              disabled={!reportType || !dateRange.start || !dateRange.end}
              className={`w-full py-3 rounded-lg transition-colors mb-3 ${
                reportType && dateRange.start && dateRange.end
                  ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <i className="fas fa-file-pdf mr-2"></i>
              Generate PDF
            </button>

            <button
              disabled={!reportType || !dateRange.start || !dateRange.end}
              className={`w-full py-3 rounded-lg transition-colors ${
                reportType && dateRange.start && dateRange.end
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <i className="fas fa-file-excel mr-2"></i>
              Generate Excel
            </button>

            <div className="mt-6 text-center">
              <i className="fas fa-file-invoice text-5xl text-gray-300 mb-3"></i>
              <p className="text-gray-500 text-sm">Configure report to generate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;
