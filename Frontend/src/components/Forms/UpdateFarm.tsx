import React, { useState, useEffect } from 'react';
import api from '../../utils/Api';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';

const UpdateFarm = () => {
    const { farmId } = useParams();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
    name: '',
    location: {
      county: '',
      subCounty: '',
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

  const fetchFarmData = async () => {
        try {
            const response = await api.get(`/farms/${farmId}`);
            setFormData(response.data.data);
        } catch (error) {
            console.error('Failed to fetch farm data:', error);
            showToast('Failed to fetch farm data. Please try again.', 'error');
        }
    };
    useEffect(() => {
        fetchFarmData();
    }, [farmId]);


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

    const handleLivestockTypeChange = (type: string) => {
        setFormData((prevData) => {
            const exists = prevData.livestockTypes.includes(type);
            if (exists) {
                return {
                    ...prevData,
                    livestockTypes: prevData.livestockTypes.filter((t) => t !== type)
                };
            } else {
                return {
                    ...prevData,
                    livestockTypes: [...prevData.livestockTypes, type]
                };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

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

      const response = await api.put(`/farms/${farmId}`, submitData);
      showToast('Farm information updated successfully!', 'success');
          // Redirect after a short delay
      setTimeout(() => {
      navigate(`/farms/${farmId}/dashboard`);
      }, 2000);
    } catch (error) {
      setError('Failed to update farm information');
    } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-6">Update Farm Information</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
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
 <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
    <button
  type="button"
  onClick={() => navigate(`/farms/${farmId}/dashboard`)}
  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
>
  Cancel
</button>
            <button
                type="submit"
                disabled={loading}
  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Updating...' : 'Update Farm'}
            </button>
            </div>
        </form>
    );
};
export default UpdateFarm;