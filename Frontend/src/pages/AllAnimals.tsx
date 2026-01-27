import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/Api';

interface Animal {
  _id: string;
  name: string;
  tagId: string;
  species: string;
  breed: string;
  gender: string;
  age: number;
  healthStatus: string;
  farmId: {
    _id: string;
    name: string;
  };
  assignedWorker?: {
    firstName: string;
    lastName: string;
  };
}

const AllAnimals = () => {
  const [searchParams] = useSearchParams();
  
  // Initialize filter from URL params immediately
  const initialFilter = searchParams.get('filter') || 'all';
  
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState(initialFilter);
  const [filterSpecies, setFilterSpecies] = useState('all');
  const navigate = useNavigate();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchAllAnimals();
  }, [filterStatus, filterSpecies, debouncedSearch]); // Refetch when filters or debounced search changes

  const fetchAllAnimals = async () => {
    try {
      setLoading(true);
      
      // Use the new backend endpoint that efficiently fetches all animals for the farmer
      const response = await api.get('/livestock/farmer/all-animals', {
        params: {
          // Pass filters as query parameters - backend will handle them
          healthStatus: filterStatus !== 'all' ? filterStatus : undefined,
          species: filterSpecies !== 'all' ? filterSpecies : undefined,
          search: debouncedSearch || undefined
        }
      });
      
      setAnimals(response.data.data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching animals:', err);
      setError(err.response?.data?.message || 'Failed to fetch animals');
    } finally {
      setLoading(false);
    }
  };

  // No need for frontend filtering - backend handles it all
  const filteredAnimals = animals;

  const getHealthStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'sick': return 'bg-red-100 text-red-800';
      case 'treatment': return 'bg-yellow-100 text-yellow-800';
      case 'recovery': return 'bg-blue-100 text-blue-800';
      case 'quarantined': return 'bg-purple-100 text-purple-800';
      case 'deceased': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSpeciesIcon = (species: string) => {
    switch (species.toLowerCase()) {
      case 'cattle': return 'fa-cow';
      case 'goat': return 'fa-goat';
      case 'sheep': return 'fa-sheep';
      case 'chicken': return 'fa-egg';
      case 'pig': return 'fa-piggy-bank';
      default: return 'fa-paw';
    }
  };

  const uniqueSpecies = Array.from(new Set(animals.map(a => a.species)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading animals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Animals</h1>
              <p className="text-gray-600 mt-1">
                Viewing {filteredAnimals.length} of {animals.length} animals across all your farms
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <i className="fas fa-paw text-2xl text-blue-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Animals</p>
                <p className="text-2xl font-bold text-gray-900">{animals.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <i className="fas fa-heart text-2xl text-green-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Healthy</p>
                <p className="text-2xl font-bold text-green-900">
                  {animals.filter(a => a.healthStatus === 'healthy').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-3 bg-red-50 rounded-lg">
                <i className="fas fa-exclamation-triangle text-2xl text-red-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Needs Attention</p>
                <p className="text-2xl font-bold text-red-900">
                  {animals.filter(a => ['sick', 'treatment', 'recovery', 'quarantined'].includes(a.healthStatus)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-3 bg-purple-50 rounded-lg">
                <i className="fas fa-shield-alt text-2xl text-purple-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Quarantined</p>
                <p className="text-2xl font-bold text-purple-900">
                  {animals.filter(a => a.healthStatus === 'quarantined').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-search mr-2"></i>Search
              </label>
              <input
                type="text"
                placeholder="Search by name, tag, species, or farm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-heartbeat mr-2"></i>Health Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="healthy">Healthy</option>
                <option value="sick">Sick</option>
                <option value="treatment">Treatment</option>
                <option value="recovery">Recovery</option>
                <option value="quarantined">Quarantined</option>
                <option value="deceased">Deceased</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-paw mr-2"></i>Species
              </label>
              <select
                value={filterSpecies}
                onChange={(e) => setFilterSpecies(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Species</option>
                {uniqueSpecies.map(species => (
                  <option key={species} value={species}>{species}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle text-red-500 mr-3"></i>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Animals Grid */}
        {filteredAnimals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No animals found</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all' || filterSpecies !== 'all'
                ? 'Try adjusting your filters'
                : 'You have no animals yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnimals.map((animal) => (
              <Link
                key={animal._id}
                to={`/${animal.farmId._id}/livestock/${animal._id}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <i className={`fas ${getSpeciesIcon(animal.species)} text-2xl text-green-600`}></i>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900">{animal.name}</h3>
                        <p className="text-sm text-gray-500">Tag: {animal.tagId}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getHealthStatusColor(animal.healthStatus)}`}>
                      {animal.healthStatus}
                    </span>
                  </div>

                  {/* Farm Info */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center text-sm">
                      <i className="fas fa-home text-blue-600 mr-2"></i>
                      <span className="font-medium text-blue-900">{animal.farmId.name}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Species:</span>
                      <span className="font-medium text-gray-900">{animal.species}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Breed:</span>
                      <span className="font-medium text-gray-900">{animal.breed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gender:</span>
                      <span className="font-medium text-gray-900 capitalize">{animal.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium text-gray-900">{animal.age} years</span>
                    </div>
                    {animal.assignedWorker && (
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-gray-600">Worker:</span>
                        <span className="font-medium text-gray-900">
                          {animal.assignedWorker.firstName} {animal.assignedWorker.lastName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* View Details Button */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-green-600 font-medium">
                      <span>View Details</span>
                      <i className="fas fa-arrow-right"></i>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllAnimals;
