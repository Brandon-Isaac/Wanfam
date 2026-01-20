import React from 'react';

const DiseaseSurveillance: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            <i className="fas fa-microscope mr-3 text-purple-500"></i>
            Disease Surveillance
          </h1>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-exclamation-triangle text-yellow-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Monitor disease patterns and outbreaks across your farm. Early detection system coming soon!
              </p>
            </div>
          </div>
        </div>

        <div className="text-center py-12">
          <i className="fas fa-virus text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-600 text-lg">Disease Surveillance System</p>
          <p className="text-gray-500 mt-2">Track and monitor disease patterns and outbreaks</p>
        </div>
      </div>
    </div>
  );
};

export default DiseaseSurveillance;
