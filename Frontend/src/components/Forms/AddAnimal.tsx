import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../utils/Api';
import worker from '../../types/Worker';
import farm from '../../types/FarmTypes';

const AddLivestock = () => {
  const { farmId } = useParams();
  const navigate = useNavigate();
  
  const [farm, setFarm] = useState<farm | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [breeds, setBreeds] = useState([]);
  const [workers, setWorkers] = useState<worker[]>([]);
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    species: 'cattle',
    breed: '',
    gender: 'female',
    dateOfBirth: '',
    dateOfPurchase: '',
    notes: '',
    assignedWorker: ''
  });
  type workers=worker[];

  useEffect(() => {
    if (!farmId || farmId === 'undefined') {
      setError('Invalid farm ID');
      return;
    }
    
    fetchFarmData();
    fetchReferenceData();
  }, [farmId]);

  const fetchFarmData = async () => {
    try {
      const response = await api.get(`/farms/${farmId}`);
      setFarm(response.data.data);
      
      // Fetch farm workers
      const workersResponse = await api.get(`/workers/${farmId}`);
      setWorkers(workersResponse.data.data);
    } catch (error: any) {
      setError('Failed to fetch farm data: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchReferenceData = async () => {
    try {
      const [breedsResponse] = await Promise.all([
        api.get(`/breeds/${formData.species}`),
      ]);

      setBreeds(breedsResponse.data.breeds || []);
    } catch (error) {
      console.error('Error fetching reference data:', error);
    }
  };

  const handleChangingBreedsBySpecies = (species: string) => {
    setFormData(prev => ({ ...prev, breed: '', species }));
    
    // Fetch breeds for the new species immediately
    const fetchBreedsForSpecies = async () => {
      try {
        const breedsResponse = await api.get(`/breeds/${species}`);
        setBreeds(breedsResponse.data.breeds || []);
      } catch (error) {
        console.error('Error fetching breeds for species:', error);
      }
    };
    
    fetchBreedsForSpecies();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>|any) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validation
      if (!formData.species) {
        throw new Error('Animal species is required');
      }
      if (!formData.gender) {
        throw new Error('Gender is required');
      }

      const response = await api.post(`/livestock/${farmId}`, formData);
      setSuccess('Livestock added successfully!');
      
      // Redirect to farm livestock list after success
      setTimeout(() => {
        navigate(`/${farmId}/livestock`);
      }, 2000);

    } catch (error: any) {
      setError('Failed to add livestock: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  const livestockTypes = [
    { value: 'cattle', label: 'Cattle', icon: 'fas fa-cow' },
    { value: 'goat', label: 'Goat', icon: 'fas fa-horse' },
    { value: 'sheep', label: 'Sheep', icon: 'fas fa-sheep' },
    { value: 'poultry', label: 'Chicken', icon: 'fas fa-dove' },
    { value: 'pig', label: 'Pig', icon: 'fas fa-pig' },
    { value: 'other', label: 'Other', icon: 'fas fa-paw' }
  ];

  if (!farm && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Livestock</h1>
              <p className="text-gray-600">
                Adding animal to: <span className="font-medium">{farm?.name}</span>
              </p>
            </div>
            <Link
              to={`/${farmId}/livestock`}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back to Farm Livestock
            </Link>
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

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex overflow-x-auto">
              {['basic', 'details'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === tab
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} Information
                </button>
              ))}
            </nav>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

        
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Animal Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Daisy, Spotty"
                  />
                </div>
            

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Animal Type *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {livestockTypes.map((species) => (
                    <label
                      key={species.value}
                      className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
                        formData.species === species.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:border-green-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="species"
                        value={species.value}
                        checked={formData.species === species.value}
                        onChange={(e) => handleChangingBreedsBySpecies(e.target.value)}
                        className="sr-only"
                      />
                      <i className={`${species.icon} mr-2 text-lg`}></i>
                      <span className="text-sm">{species.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Breed
                  </label>
                  <select
                    name="breed"
                    value={formData.breed}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select breed</option>
                    {breeds.map((breed) => (
                      <option key={breed} value={breed}>
                        {breed}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    name="dateOfPurchase"
                    value={formData.dateOfPurchase}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          )}

              {/* Details Tab */}
              {activeTab === 'details' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h2>
                
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Worker
                </label>
                <select
                  id="assignedWorker"
                  name="assignedWorker"
                  value={formData.assignedWorker}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">No worker assigned</option>
                  {workers.map((worker) => (
                  <option key={worker._id} value={worker._id}>
                    {worker.firstName} {worker.lastName}
                  </option>
                  ))}
                </select>
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Any additional information about this animal..."
                />
                </div>
              </div>
              )}

          {/* Navigation and Submit */}
          <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
            <div className="flex space-x-3">
              {['basic', 'details'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`w-3 h-3 rounded-full ${
                    activeTab === tab ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                  title={tab.charAt(0).toUpperCase() + tab.slice(1)}
                />
              ))}
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  const tabs = ['basic', 'details'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1]);
                }}
                disabled={activeTab === 'basic'}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Previous
              </button>
              
                {activeTab !== 'details' ? (
                <div
                  onClick={() => {
                  const tabs = ['basic', 'details'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1]);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer"
                >
                  Next
                </div>
                ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? (
                  <>
                    <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Adding Livestock...
                  </>
                  ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    Add Livestock
                  </>
                  )}
                </button>
                )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLivestock;