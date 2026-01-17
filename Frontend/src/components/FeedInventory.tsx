import React from 'react';
import { useParams } from 'react-router-dom';

const FeedInventory: React.FC = () => {
  const { farmId } = useParams<{ farmId: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            <i className="fas fa-warehouse mr-3 text-green-500"></i>
            Feed Inventory
          </h1>
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
            <i className="fas fa-plus mr-2"></i>
            Add Feed Item
          </button>
        </div>
        
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-info-circle text-green-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Track your feed inventory levels and get alerts when supplies are running low.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center py-12">
          <i className="fas fa-boxes text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-600 text-lg">Feed Inventory Management</p>
          <p className="text-gray-500 mt-2">Monitor feed stock levels and supplies</p>
        </div>
      </div>
    </div>
  );
};

export default FeedInventory;
