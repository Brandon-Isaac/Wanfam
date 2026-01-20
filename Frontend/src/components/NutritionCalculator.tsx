import React, { useState } from 'react';

const NutritionCalculator: React.FC = () => {
  const [animalType, setAnimalType] = useState('');
  const [weight, setWeight] = useState('');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            <i className="fas fa-calculator mr-3 text-blue-500"></i>
            Nutrition Calculator
          </h1>
        </div>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-info-circle text-blue-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Calculate optimal nutrition requirements for your livestock based on weight, age, and activity level.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Animal Type
              </label>
              <select 
                value={animalType}
                onChange={(e) => setAnimalType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select animal type</option>
                <option value="dairy">Dairy Cattle</option>
                <option value="beef">Beef Cattle</option>
                <option value="sheep">Sheep</option>
                <option value="goat">Goat</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter weight"
              />
            </div>

            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
              <i className="fas fa-calculator mr-2"></i>
              Calculate
            </button>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Nutrition Results</h3>
            <div className="text-center py-8">
              <i className="fas fa-chart-pie text-5xl text-gray-300 mb-3"></i>
              <p className="text-gray-500">Enter animal details to calculate nutrition requirements</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionCalculator;
