import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import  { useFarm } from '../../contexts/FarmContext';
import { useAuth } from '../../contexts/AuthContext'
import api from '../../utils/Api';

const SelectFarm = () => {
  const { user } = useAuth();
  const { selectFarm } = useFarm();
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      const response = await api.get(`/farms`);
       setFarms(response.data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFarmSelection = (farm: object) => {
    selectFarm(farm);
    const farmId = (farm as any)._id;
    navigate(`/farms/${farmId}/dashboard`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your farms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchFarms}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Select a Farm to Manage</h1>
          <p className="text-gray-600 mb-8">Choose which farm you'd like to work with today</p>
        </div>

        {farms.length === 0 ? (
          <div className="text-center">
            <div className="w-64 h-64 mx-auto bg-gray-200 rounded-lg flex items-center justify-center mb-6">
              <i className="fas fa-barn text-6xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No farms found</h3>
            <p className="text-gray-600 mb-6">You don't have any farms yet. Create your first farm to get started.</p>
            <button
              onClick={() => navigate('/farms/add')}
              className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>
              Create Your First Farm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farms.map((farm: any) => (
              <div
                key={farm._id}
                onClick={() => handleFarmSelection(farm)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 overflow-hidden"
              >
                <div className="h-48 bg-green-100 flex items-center justify-center">
                  {farm.image ? (
                    <img src={farm.image} alt={farm.name} className="w-full h-full object-cover" />
                  ) : (
                    <i className="fas fa-barn text-4xl text-green-500"></i>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{farm.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{farm.location.county}, {farm.location.subCounty}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <span><i className="fas fa-cow mr-1"></i>{farm.livestockTypes.length || 0} Livestock Types</span>
                    <span><i className="fas fa-chart-line mr-1"></i>{farm.size.value || 'N/A'} Acres</span>
                  </div>
                  {farm.statistics && (
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold text-gray-900">{farm.statistics.totalLivestock}</div>
                        <div className="text-gray-600">Animals</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold text-gray-900">{farm.statistics.totalWorkers}</div>
                  <div className="text-gray-600">Workers</div>
                </div>
              </div>
            )}

                  <button className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">
                    Manage Farm
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/farms/add')}
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Add New Farm
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectFarm;