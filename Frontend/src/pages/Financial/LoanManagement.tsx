import React from 'react';
import { useParams, Link } from 'react-router-dom';

const LoanManagement: React.FC = () => {
  const { farmId } = useParams<{ farmId: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            <i className="fas fa-hand-holding-usd mr-3 text-blue-500"></i>
            Loan Management
          </h1>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
            <i className="fas fa-plus mr-2"></i>
            Apply for Loan
          </button>
        </div>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-info-circle text-blue-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Manage your farm loans, track repayments, and apply for new financing options.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Active Loans</p>
                <p className="text-3xl font-bold text-blue-700">0</p>
              </div>
              <i className="fas fa-file-invoice-dollar text-4xl text-blue-400"></i>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Total Borrowed</p>
                <p className="text-2xl font-bold text-yellow-700">$0.00</p>
              </div>
              <i className="fas fa-money-bill-wave text-4xl text-yellow-400"></i>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Total Repaid</p>
                <p className="text-2xl font-bold text-green-700">$0.00</p>
              </div>
              <i className="fas fa-check-circle text-4xl text-green-400"></i>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Loan Status</h2>
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <i className="fas fa-clipboard-list text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-600 text-lg">No Active Loans</p>
            <p className="text-gray-500 mt-2">Apply for a loan to get started</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanManagement;
