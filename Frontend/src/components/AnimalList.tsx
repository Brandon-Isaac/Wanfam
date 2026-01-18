import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/Api';
import Animal from '../types/Animal';

const AnimalList = () => {
const params = useParams();
  const  farmId  = params.farmId;
  const navigate = useNavigate();

  type Farm = {
    _id: string;
    name: string;
    location?: string;
    size?: number;
  };
  
  const [farm, setFarm] = useState<Farm | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortField, setSortField] = useState<keyof Animal>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedAnimals, setSelectedAnimals] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [showDeleteModal, setShowDeleteModal] = useState(false);


  useEffect(() => {
    if (!farmId || farmId === 'undefined') {
      setError('Invalid farm ID');
      setLoading(false);
      return;
    }
    
    fetchFarmAndAnimals();
  }, [farmId]);
  const fetchFarmAndAnimals = async () => {
    try {
      setLoading(true);
      
      // Fetch farm details and livestock in parallel
      const [farmResponse, livestockResponse] = await Promise.all([
        api.get(`/farms/${farmId}`),
        api.get(`/livestock/${farmId}`)
      ]);

      setFarm(farmResponse.data.data);
      
      // Map the livestock data to frontend expected format
      const livestockData = livestockResponse.data.data || [];
      const mappedAnimals = livestockData.map((animal: any) => ({
        id: animal._id,
        name: animal.name,
        tag: animal.tagId,
        type: animal.species,
        breed: animal.breed,
        gender: animal.gender,
        birthDate: animal.dateOfBirth,
        purchaseDate: animal.dateOfPurchase,
        notes: animal.notes,
        weight: animal.weight,
        assignedWorker: animal.assignedWorker,
        createdAt: animal.addedAt,
        updatedAt: animal.updatedAt,
        // Calculate age
        age: animal.age,
        latestMilkProduction: animal.productivityStats?.milkOutput?.length > 0
          ? animal.productivityStats.milkOutput[animal.productivityStats.milkOutput.length - 1].liters
          : null
      }));
      
      setAnimals(mappedAnimals);
    } catch (error:any) {
      setError('Failed to fetch data: ' + (error.response?.data?.message || error.message));
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Search is handled in the filtering logic
  };

  const handleSort = (field: keyof Animal) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDeleteAnimals = async () => {
    if (selectedAnimals.size === 0) return;

    try {
      // Delete each selected animal
      const deletePromises = Array.from(selectedAnimals).map(animalId =>
        api.delete(`/livestock/${farmId}/animals/${animalId}`)
      );
      
      await Promise.all(deletePromises);
      
      setSuccess(`Successfully deleted ${selectedAnimals.size} animal(s)`);
      setSelectedAnimals(new Set());
      setShowDeleteModal(false);
      
      // Refresh the list
      fetchFarmAndAnimals();
    } catch (error:any) {
      setError('Failed to delete animals: ' + (error.response?.data?.message || error.message));
    }
  };

  const toggleAnimalSelection = (animalId: string) => {
    const newSelected = new Set(selectedAnimals);
    if (newSelected.has(animalId)) {
      newSelected.delete(animalId);
    } else {
      newSelected.add(animalId)
    }
    setSelectedAnimals(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedAnimals.size === filteredAnimals.length) {
      setSelectedAnimals(new Set());
    } else {
      setSelectedAnimals(new Set(filteredAnimals.map(animal => animal.id)));
    }
  };

  const getSortIcon = (field: keyof Animal) => {
    if (sortField !== field) return 'fas fa-sort';
    return sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      cattle: 'fas fa-cow',
      goat: 'fas fa-horse',
      sheep: 'fas fa-sheep',
      pig: 'fas fa-pig',
      poultry: 'fas fa-dove',
      other: 'fas fa-paw'
    };
    return icons[type] || 'fas fa-paw';
  };

  // Filter and sort animals
  const filteredAnimals = (animals || [])
    .filter(animal => {
      const matchesSearch = searchTerm === '' || 
        animal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.breed?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'all' || animal.type === typeFilter;

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let aValue: any = a[sortField] || '';
      let bValue: any = b[sortField] || '';

      if (sortField === 'birthDate') {
        aValue = new Date(a.birthDate || 0);
        bValue = new Date(b.birthDate || 0);
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAnimals = filteredAnimals.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAnimals.length / itemsPerPage);

  // Get unique livestock types for filter
  const availableTypes = Array.from(new Set(animals.map(animal => animal.type)));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error && !farm) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-900">{error}</h2>
          <Link to={`/farms/${farmId}/dashboard`} className="text-green-600 hover:text-green-700 mt-4 inline-block">
            Return to Farms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {farm?.name} - Livestock
              </h1>
              <p className="text-gray-600">
                Manage livestock for this farm - {filteredAnimals.length} animals found
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                to={`/farms/${farmId}/dashboard`}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Back to Farm
              </Link>
              <Link
                to={`/farms/${farmId}/livestock/add`}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                <i className="fas fa-plus mr-2"></i>Add Animal
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <i className="fas fa-cow text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Animals</p>
                <p className="text-2xl font-bold text-gray-900">{animals.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <i className="fas fa-venus text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Females</p>
                <p className="text-2xl font-bold text-gray-900">
                  {animals.filter(a => a.gender === 'female').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <i className="fas fa-mars text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Males</p>
                <p className="text-2xl font-bold text-gray-900">
                  {animals.filter(a => a.gender === 'male').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <i className="fas fa-layer-group text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Types</p>
                <p className="text-2xl font-bold text-gray-900">{availableTypes.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by name, tag ID, or breed..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  <i className="fas fa-search"></i>
                </button>
              </form>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Types</option>
                {availableTypes.map(type => (
                  <option key={type} value={type} className="capitalize">
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as keyof Animal)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="name">Name</option>
                <option value="type">Type</option>
                <option value="tag">Tag ID</option>
                <option value="birthDate">Age</option>
                <option value="createdAt">Date Added</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedAnimals.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-blue-800 font-medium">
                  {selectedAnimals.size} animal{selectedAnimals.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  <i className="fas fa-trash mr-1"></i>Delete Selected
                </button>
                <button
                  onClick={() => setSelectedAnimals(new Set())}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Animals Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedAnimals.size === filteredAnimals.length && filteredAnimals.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      <span>Animal</span>
                      <i className={`${getSortIcon('name')} ml-1`}></i>
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center">
                      <span>Type</span>
                      <i className={`${getSortIcon('type')} ml-1`}></i>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age/Weight
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Worker
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentAnimals.map((animal) => (
                  <tr key={animal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedAnimals.has(animal.id)}
                        onChange={() => toggleAnimalSelection(animal.id)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white">
                            <i className={getTypeIcon(animal.type)}></i>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {animal.name || 'Unnamed'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Tag: {animal.tag}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{animal.type}</div>
                      <div className="text-sm text-gray-500">{animal.breed}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {animal.age !== undefined && animal.age !== null ? `${animal.age} years` : 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {animal.gender} • {animal.weight ? `${animal.weight} kg` : 'No weight'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {animal.assignedWorker ? 
                        (`${animal.assignedWorker.firstName} ${animal.assignedWorker.lastName}`) : 
                        'Unassigned'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(animal.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/farms/${farmId}/livestock/${animal.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>
                        <Link
                          to={`/farms/${farmId}/livestock/${animal.id}/edit`}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedAnimals(new Set([animal.id]));
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {filteredAnimals.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-cow text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">No animals found in this farm</p>
              <Link
                to={`/farms/${farmId}/livestock/add`}
                className="text-green-600 hover:text-green-700 mt-2 inline-block"
              >
                Add your first animal
              </Link>
            </div>
          )}

          {/* Pagination */}
          {filteredAnimals.length > 0 && totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredAnimals.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredAnimals.length}</span> animals
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-green-50 border-green-500 text-green-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg max-w-md mx-auto p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete {selectedAnimals.size} animal{selectedAnimals.size !== 1 ? 's' : ''}?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAnimals}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimalList;