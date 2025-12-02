import { useState, useEffect } from "react";
import api from "../utils/Api";
import { Link } from "react-router-dom";

interface Farm {
    _id: string;
    name: string;
    isActive: boolean;
    location: {
        county: string;
        subCounty: string;
    };
    size: {
        value: number;
        unit: string;
    };
    livestockTypes: string[];
    statistics?: {
        totalLivestock: number;
        totalWorkers: number;
    };
}

const Farms = () => {
    const [farms, setFarms] = useState<Farm[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchFarms = async () => {
            try {
                const response = await api.get('/farms');
                setFarms(response.data.data);
            } catch (err: any) {
                setError(err.message || 'Error fetching farms');
            }
            setLoading(false);
        };
        fetchFarms();
    }, []);

   if (loading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

    return (
       <div className="space-y-6 ml-4 pt-4 pl-4 pr-4">
        <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Farms</h1>
        <br className="my-4" />
        <Link
          to="/farms/add"
          className="bg-green-600 text-white px-4 py-2 hover:bg-green-700"
        >
          Add Farm
        </Link>
</div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="flex flex-col justify-center w-full h-auto flex-wrap gap-6">
        {farms.map((farm) => (
          <div key={farm._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{farm.name}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                farm.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {farm.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <i className="fas fa-map-marker-alt w-4"></i>
                <span>{farm.location.county}, {farm.location.subCounty}</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-ruler-combined w-4"></i>
                <span>{farm.size.value} {farm.size.unit}</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-paw w-4"></i>
                <span>{farm.livestockTypes.join(', ')}</span>
              </div>
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

      
          </div>
        ))}
      </div>

      {farms.length === 0 && !loading && (
        <div className="text-center py-8">
          <i className="fas fa-barn text-4xl text-gray-400 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No farms yet</h3>
          <p className="text-gray-600 mb-4">Create your first farm to get started</p>
          <Link
            to="/farms/create"
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700"
          >
            Create Your First Farm
          </Link>
        </div>
      )}
    </div>
  );
}
export default Farms;