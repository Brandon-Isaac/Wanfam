import React from 'react';
import { useParams } from 'react-router-dom';

const HealthRecords: React.FC = () => {
  const { farmId } = useParams<{ farmId: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            <i className="fas fa-heartbeat mr-3 text-red-500"></i>
            Health Records
          </h1>
        </div>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-info-circle text-blue-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                View and manage all health records for your livestock. This feature is coming soon!
              </p>
            </div>
          </div>
        </div>

        <div className="text-center py-12">
          <i className="fas fa-file-medical text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-600 text-lg">Health Records Management</p>
          <p className="text-gray-500 mt-2">Track medical history, checkups, and health status</p>
        </div>
      </div>
    </div>
  );
};

export default HealthRecords;
