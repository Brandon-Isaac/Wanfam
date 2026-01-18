import React from 'react';
import { useParams, Link } from 'react-router-dom';

const BreedingRecords: React.FC = () => {
  const { farmId } = useParams<{ farmId: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            <i className="fas fa-dna mr-3 text-pink-500"></i>
            Breeding Records
          </h1>
          <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors">
            <i className="fas fa-plus mr-2"></i>
            Add Breeding Record
          </button>
        </div>
        
        <div className="bg-pink-50 border-l-4 border-pink-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-info-circle text-pink-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-pink-700">
                Track breeding history, genetics, and offspring for your livestock to optimize breeding programs.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Breeding</p>
                <p className="text-3xl font-bold text-blue-700">0</p>
              </div>
              <i className="fas fa-clipboard-list text-3xl text-blue-400"></i>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Successful</p>
                <p className="text-3xl font-bold text-green-700">0</p>
              </div>
              <i className="fas fa-check-circle text-3xl text-green-400"></i>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-700">0</p>
              </div>
              <i className="fas fa-clock text-3xl text-yellow-400"></i>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Offspring</p>
                <p className="text-3xl font-bold text-purple-700">0</p>
              </div>
              <i className="fas fa-baby text-3xl text-purple-400"></i>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Breeding Records</h2>
            <div className="flex space-x-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <i className="fas fa-filter mr-2"></i>
                Filter
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <i className="fas fa-sort mr-2"></i>
                Sort
              </button>
            </div>
          </div>

          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <i className="fas fa-heart text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-600 text-lg">No Breeding Records Yet</p>
            <p className="text-gray-500 mt-2 mb-4">Start tracking your livestock breeding programs</p>
            <Link 
              to={`/farms/${farmId}/livestock`}
              className="inline-block bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              View Livestock
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreedingRecords;
