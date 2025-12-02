import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/Api';

const AddFarm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    location: {
      county: '',
      subCounty: '',
      coordinates: {
        latitude: '',
        longitude: ''
      }
    },
    size: {
      value: '',
      unit: 'acres'
    },
    livestockTypes: [] as string[],
    facilities: {
      feedStorage: false,
      waterSources: 0,
      milkingParlor: false,
      quarantineArea: false
    },
    settings: {
      currency: 'KES',
      timezone: 'Africa/Nairobi',
      language: 'english'
    }
  });

  // Kenya counties data (you can expand this or load from API)
  const kenyaCounties = [
    'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa',
    'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
    'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu',
    'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa',
    'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
    'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
    'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
  ];

  const livestockOptions = [
    { value: 'cattle', label: 'Cattle', icon: 'fas fa-cow' },
    { value: 'goats', label: 'Goats', icon: 'fas fa-horse' },
    { value: 'sheep', label: 'Sheep', icon: 'fas fa-sheep' },
    { value: 'poultry', label: 'Poultry', icon: 'fas fa-dove' },
    { value: 'pigs', label: 'Pigs', icon: 'fas fa-pig' },
    { value: 'other', label: 'Other', icon: 'fas fa-paw' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | any) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const updated = { ...prev };
        let current: any = updated;
        
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = type === 'checkbox' ? checked : value;
        return updated;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleLivestockTypeChange = (livestockType: string) => {
    setFormData(prev => ({
      ...prev,
      livestockTypes: prev.livestockTypes.includes(livestockType)
        ? prev.livestockTypes.filter(type => type !== livestockType)
        : [...prev.livestockTypes, livestockType]
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.location.county || !formData.size.value || formData.livestockTypes.length === 0) {
        throw new Error('Please fill in all required fields');
      }

      // Convert string numbers to numbers
      const submitData = {
        ...formData,
        size: {
          ...formData.size,
          value: parseFloat(formData.size.value)
        },
        facilities: {
          ...formData.facilities,
          waterSources: (formData.facilities.waterSources) || 0
        }
      };

      // Clean up coordinates if empty
      if (!submitData.location.coordinates.latitude || !submitData.location.coordinates.longitude) {
        delete (submitData.location as any).coordinates;
      } else {
        submitData.location.coordinates = {
          latitude: (submitData.location.coordinates.latitude),
          longitude: (submitData.location.coordinates.longitude)
        };
      }

      const response = await api.post('/farms', submitData);
      
      setSuccess('Farm created successfully!');
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Failed to create farm');
    } finally {
      setLoading(false);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              coordinates: {
                latitude: position.coords.latitude.toFixed(6),
                longitude: position.coords.longitude.toFixed(6)
              }
            }
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get current location');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <i className="fas fa-barn text-white"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Add New Farm</h1>
                <p className="text-green-100 text-sm">Create a new farm profile</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-white hover:text-green-100 transition-colors duration-200"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Alert Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <i className="fas fa-exclamation-triangle text-red-400 mt-1"></i>
                <div className="ml-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <i className="fas fa-check-circle text-green-400 mt-1"></i>
                <div className="ml-3">
                  <p className="text-green-800 text-sm">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Farm Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
    required
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
  placeholder="Enter farm name"
/>
  </div>
  <div>
<label htmlFor="size.value" className="block text-sm font-medium text-gray-700 mb-1">
  Farm Size <span className="text-red-500">*</span>
</label>
<div className="flex space-x-2">
  <input
    type="number"
    id="size.value"
    name="size.value"
    value={formData.size.value}
    onChange={handleInputChange}
    required
    min="0"
    step="0.1"
    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
    placeholder="Size"
  />
  <select
    name="size.unit"
    value={formData.size.unit}
    onChange={handleInputChange}
    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
  >
    <option value="acres">Acres</option>
    <option value="hectares">Hectares</option>
  </select>
</div>
  </div>
</div>
  </div>

  {/* Location Information */}
  <div className="space-y-4">
<h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
  Location Information
</h3>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div>
<label htmlFor="location.county" className="block text-sm font-medium text-gray-700 mb-1">
  County <span className="text-red-500">*</span>
</label>
<select
  id="location.county"
  name="location.county"
  value={formData.location.county}
  onChange={handleInputChange}
  required
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
>
  <option value="">Select County</option>
  {kenyaCounties.map((county) => (
    <option key={county} value={county}>
      {county}
    </option>
  ))}
</select>
  </div>

  <div>
<label htmlFor="location.subCounty" className="block text-sm font-medium text-gray-700 mb-1">
  Sub-County <span className="text-red-500">*</span>
</label>
<input
  type="text"
  id="location.subCounty"
  name="location.subCounty"
  value={formData.location.subCounty}
  onChange={handleInputChange}
  required
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
  placeholder="Enter sub-county"
/>
  </div>
</div>

{/* GPS Coordinates */}
<div>
  <div className="flex items-center justify-between mb-2">
<label className="block text-sm font-medium text-gray-700">
  GPS Coordinates (Optional)
</label>
<button
  type="button"
  onClick={getCurrentLocation}
  className="text-sm text-green-600 hover:text-green-700 flex items-center space-x-1"
>
  <i className="fas fa-location-arrow"></i>
  <span>Get Current Location</span>
</button>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div>
  <input
    type="number"
    name="location.coordinates.latitude"
    value={formData.location.coordinates.latitude}
    onChange={handleInputChange}
    step="any"
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
    placeholder="Latitude"
  />
</div>
<div>
  <input
    type="number"
    name="location.coordinates.longitude"
    value={formData.location.coordinates.longitude}
    onChange={handleInputChange}
    step="any"
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
    placeholder="Longitude"
  />
</div>
  </div>
</div>
  </div>

  {/* Livestock Types */}
  <div className="space-y-4">
<h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
  Livestock Types <span className="text-red-500">*</span>
</h3>

<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
  {livestockOptions.map((livestock) => (
<div key={livestock.value}>
  <label className="flex flex-col items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
    <input
      type="checkbox"
      checked={formData.livestockTypes.includes(livestock.value)}
      onChange={() => handleLivestockTypeChange(livestock.value)}
      className="sr-only"
    />
    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
      formData.livestockTypes.includes(livestock.value)
        ? 'bg-green-500 text-white'
        : 'bg-gray-200 text-gray-600'
    }`}>
      <i className={livestock.icon}></i>
    </div>
    <span className={`text-xs text-center ${
      formData.livestockTypes.includes(livestock.value)
        ? 'text-green-700 font-medium'
        : 'text-gray-700'
    }`}>
      {livestock.label}
    </span>
  </label>
</div>
  ))}
</div>
  </div>

  {/* Facilities */}
  <div className="space-y-4">
<h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
  Facilities & Infrastructure
</h3>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div>
<label htmlFor="facilities.waterSources" className="block text-sm font-medium text-gray-700 mb-1">
  Water Sources
</label>
<input
  type="number"
  id="facilities.waterSources"
  name="facilities.waterSources"
  value={formData.facilities.waterSources}
  onChange={handleInputChange}
  min="0"
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
/>
  </div>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div className="flex items-center">
<input
  type="checkbox"
  id="facilities.feedStorage"
  name="facilities.feedStorage"
  checked={formData.facilities.feedStorage}
  onChange={handleInputChange}
  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
/>
<label htmlFor="facilities.feedStorage" className="ml-2 block text-sm text-gray-700">
  Feed Storage
</label>
  </div>

  <div className="flex items-center">
<input
  type="checkbox"
  id="facilities.milkingParlor"
  name="facilities.milkingParlor"
  checked={formData.facilities.milkingParlor}
  onChange={handleInputChange}
  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
/>
<label htmlFor="facilities.milkingParlor" className="ml-2 block text-sm text-gray-700">
  Milking Parlor
</label>
  </div>

  <div className="flex items-center">
<input
  type="checkbox"
  id="facilities.quarantineArea"
  name="facilities.quarantineArea"
  checked={formData.facilities.quarantineArea}
  onChange={handleInputChange}
  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
/>
<label htmlFor="facilities.quarantineArea" className="ml-2 block text-sm text-gray-700">
  Quarantine Area
</label>
  </div>
</div>
  </div>

  {/* Settings */}
  <div className="space-y-4">
<h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
  Farm Settings
</h3>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div>
<label htmlFor="settings.currency" className="block text-sm font-medium text-gray-700 mb-1">
  Currency
</label>
<select
  id="settings.currency"
  name="settings.currency"
  value={formData.settings.currency}
  onChange={handleInputChange}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
>
  <option value="KES">Kenyan Shilling (KES)</option>
  <option value="USD">US Dollar (USD)</option>
  <option value="EUR">Euro (EUR)</option>
</select>
  </div>

  <div>
<label htmlFor="settings.timezone" className="block text-sm font-medium text-gray-700 mb-1">
  Timezone
</label>
<select
  id="settings.timezone"
  name="settings.timezone"
  value={formData.settings.timezone}
  onChange={handleInputChange}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
>
  <option value="Africa/Nairobi">East Africa Time</option>
  <option value="UTC">UTC</option>
</select>
  </div>

  <div>
<label htmlFor="settings.language" className="block text-sm font-medium text-gray-700 mb-1">
  Language
</label>
<select
  id="settings.language"
  name="settings.language"
  value={formData.settings.language}
  onChange={handleInputChange}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
>
  <option value="english">English</option>
  <option value="swahili">Swahili</option>
</select>
  </div>
</div>
  </div>

  {/* Submit Buttons */}
  <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
<button
  type="button"
  onClick={() => navigate('/farms')}
  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
>
  Cancel
</button>
<button
  type="submit"
  disabled={loading}
  className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {loading ? (
<div className="flex items-center space-x-2">
  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
  <span>Creating...</span>
</div>
  ) : (
'Create Farm'
  )}
</button>
  </div>
</form>
  </div>
</div>
  );
};

export default AddFarm;