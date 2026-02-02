import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/Api';

interface FarmStats {
  totalFarms: number;
  activeFarms: number;
  totalAnimals: number;
  totalLand: number;
  avgAnimalsPerFarm: number;
  topFarms: Array<{
    _id: string;
    name: string;
    location: string;
    totalAnimals: number;
    landSize: number;
  }>;
  animalsBySpecies: Record<string, number>;
  healthDistribution: {
    healthy: number;
    sick: number;
    critical: number;
  };
}

const FarmAnalytics = () => {
  const { farmId } = useParams<{ farmId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<FarmStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';
  const isSystemWide = isAdmin && !farmId;

  useEffect(() => {
    // For farmers, farmId is required
    if (!isAdmin && !farmId) {
      setError('Invalid farm ID');
      setLoading(false);
      return;
    }
    fetchAnalytics();
  }, [timeRange, farmId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      // Use different endpoint based on whether it's system-wide or farm-specific
      const endpoint = isSystemWide 
        ? '/farms/analytics' 
        : `/farms/${farmId}/analytics`;
      const response = await api.get(endpoint);
      setStats(response.data.data || response.data);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      setError(error.response?.data?.message || 'Failed to load farm analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <i className="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Analytics</h2>
          <p className="text-red-600 mb-4">{error || 'Failed to load farm analytics'}</p>
          <button
            onClick={() => navigate('/farms')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Back to Farms
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const speciesData = Object.entries(stats.animalsBySpecies);
  const maxCount = Math.max(...speciesData.map(([_, count]) => count));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isSystemWide ? 'System-Wide Farm Analytics' : 'Farm Analytics'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isSystemWide 
              ? 'Comprehensive insights across all farms in the system' 
              : 'Comprehensive insights into farm performance'}
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-500 text-white">
              <i className="fas fa-barn text-2xl"></i>
            </div>
            <span className="text-xs font-semibold text-green-700 bg-green-200 px-2 py-1 rounded-full">
              {Math.round((stats.activeFarms / stats.totalFarms) * 100)}% Active
            </span>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Total Farms</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalFarms}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-500 text-white">
              <i className="fas fa-paw text-2xl"></i>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Total Animals</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalAnimals}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-500 text-white">
              <i className="fas fa-map-marked-alt text-2xl"></i>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Total Land</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalLand} <span className="text-lg">acres</span></p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-500 text-white">
              <i className="fas fa-chart-line text-2xl"></i>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Avg Animals/Farm</p>
          <p className="text-3xl font-bold text-gray-900">{stats.avgAnimalsPerFarm.toFixed(1)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Animals by Species */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <i className="fas fa-chart-bar text-blue-600 mr-2"></i>
            Animals by Species
          </h3>
          <div className="space-y-4">
            {speciesData.map(([species, count]) => (
              <div key={species}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">{species}</span>
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Distribution */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <i className="fas fa-heartbeat text-red-600 mr-2"></i>
            Animal Health Distribution
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white mr-4">
                  <i className="fas fa-check-circle text-xl"></i>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Healthy</p>
                  <p className="text-sm text-gray-600">{Math.round((stats.healthDistribution.healthy / stats.totalAnimals) * 100)}% of total</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.healthDistribution.healthy}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-white mr-4">
                  <i className="fas fa-exclamation-circle text-xl"></i>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sick</p>
                  <p className="text-sm text-gray-600">{Math.round((stats.healthDistribution.sick / stats.totalAnimals) * 100)}% of total</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{stats.healthDistribution.sick}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white mr-4">
                  <i className="fas fa-times-circle text-xl"></i>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Critical</p>
                  <p className="text-sm text-gray-600">{Math.round((stats.healthDistribution.critical / stats.totalAnimals) * 100)}% of total</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-red-600">{stats.healthDistribution.critical}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Farms */}
      <div className="bg-white rounded-xl shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <i className="fas fa-trophy text-yellow-500 mr-2"></i>
            Top Performing Farms
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Farm Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Animals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Land Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Density
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.topFarms.map((farm, index) => (
                <tr key={farm._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index === 0 && <i className="fas fa-medal text-yellow-500 text-xl"></i>}
                      {index === 1 && <i className="fas fa-medal text-gray-400 text-xl"></i>}
                      {index === 2 && <i className="fas fa-medal text-orange-400 text-xl"></i>}
                      {index > 2 && <span className="text-sm font-semibold text-gray-500">#{index + 1}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{farm.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{farm.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{farm.totalAnimals}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{farm.landSize} acres</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {(farm.totalAnimals / farm.landSize).toFixed(2)} animals/acre
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FarmAnalytics;
