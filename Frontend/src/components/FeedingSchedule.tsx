import React from 'react';
import { useParams } from 'react-router-dom';

const FeedingSchedule: React.FC = () => {
  const { farmId } = useParams<{ farmId: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            <i className="fas fa-calendar-alt mr-3 text-orange-500"></i>
            Feeding Schedule
          </h1>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors">
            <i className="fas fa-plus mr-2"></i>
            Add Schedule
          </button>
        </div>
        
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-info-circle text-orange-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-orange-700">
                Create and manage feeding schedules for your livestock. Ensure optimal nutrition timing!
              </p>
            </div>
          </div>
        </div>

        <div className="text-center py-12">
          <i className="fas fa-clock text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-600 text-lg">Feeding Schedule Management</p>
          <p className="text-gray-500 mt-2">Plan and track feeding times for all animals</p>
        </div>
      </div>
    </div>
  );
};

export default FeedingSchedule;
