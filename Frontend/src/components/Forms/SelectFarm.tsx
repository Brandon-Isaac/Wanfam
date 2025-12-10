import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarm } from '../../contexts/FarmContext';
import api from '../../utils/Api';

const SelectFarm = () => {
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
          <p className="mt-4 text-gray-600">Loading farms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchFarms}
            className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
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
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 overflow-hidden transform hover:-translate-y-1"
              >
                <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center relative">
                  {farm.image ? (
                    <img src={farm.image} alt={farm.name} className="w-full h-full object-cover" />
                  ) : (
                    <i className="fas fa-barn text-6xl text-white opacity-90"></i>
                  )}
                  <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full shadow-md ${
                    farm.isActive ? 'bg-white text-green-600' : 'bg-gray-800 text-white'
                  }`}>
                    <i className={`fas ${farm.isActive ? 'fa-check-circle' : 'fa-pause-circle'} mr-1`}></i>
                    {farm.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{farm.name}</h3>
                  
                  {/* Location */}
                  <div className="flex items-start mb-4 text-sm text-gray-600">
                    <i className="fas fa-map-marker-alt text-red-500 mt-1 mr-2"></i>
                    <div>
                      <div className="font-medium text-gray-900">{farm.location.county}</div>
                      <div className="text-xs">{farm.location.subCounty}</div>
                    </div>
                  </div>

                  {/* Farm Size */}
                  <div className="flex items-center mb-4 text-sm">
                    <div className="flex-1 bg-blue-50 rounded-lg p-3 flex items-center">
                      <i className="fas fa-ruler-combined text-blue-600 text-lg mr-3"></i>
                      <div>
                        <div className="font-semibold text-gray-900">{farm.size.value || 'N/A'} {farm.size.unit || 'Acres'}</div>
                        <div className="text-xs text-gray-600">Farm Size</div>
                      </div>
                    </div>
                  </div>

                  {/* Livestock Types */}
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <i className="fas fa-paw text-amber-600 mr-2"></i>
                      <span className="font-medium">Livestock Types:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {farm.livestockTypes.map((type: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full border border-amber-200"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg">
                    <i className="fas fa-hand-pointer mr-2"></i>
                    Select & Manage Farm
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