import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../utils/Api';
import { useToast } from '../../contexts/ToastContext';

interface Animal {
  _id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  healthStatus: string;
}

interface Farm {
  _id: string;
  name: string;
  location: string;
}

const CreateFeedSchedule = () => {
  const { farmId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [farm, setFarm] = useState<Farm | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAnimals, setLoadingAnimals] = useState(true);
  const [generatingWithAI, setGeneratingWithAI] = useState(false);
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([]);
  const [useAI, setUseAI] = useState(false);

  const [formData, setFormData] = useState({
    scheduleName: '',
    feedType: '',
    feedingTimes: [''],
    quantity: '',
    unit: 'kg',
    notes: '',
    customInstructions: ''
  });

  useEffect(() => {
    if (!farmId || farmId === 'undefined') {
      showToast('Invalid farm ID', 'error');
      navigate('/select/farm');
      return;
    }

    fetchFarmData();
    fetchAnimals();
  }, [farmId]);

  const fetchFarmData = async () => {
    try {
      const response = await api.get(`/farms/${farmId}`);
      setFarm(response.data.data);
    } catch (error: any) {
      showToast('Failed to fetch farm data', 'error');
    }
  };

  const fetchAnimals = async () => {
    try {
      setLoadingAnimals(true);
      const response = await api.get(`/livestock/${farmId}`);
      setAnimals(response.data.data || []);
    } catch (error: any) {
      showToast('Failed to fetch animals', 'error');
    } finally {
      setLoadingAnimals(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFeedingTimeChange = (index: number, value: string) => {
    const newTimes = [...formData.feedingTimes];
    newTimes[index] = value;
    setFormData(prev => ({ ...prev, feedingTimes: newTimes }));
  };

  const addFeedingTime = () => {
    setFormData(prev => ({ 
      ...prev, 
      feedingTimes: [...prev.feedingTimes, ''] 
    }));
  };

  const removeFeedingTime = (index: number) => {
    if (formData.feedingTimes.length > 1) {
      const newTimes = formData.feedingTimes.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, feedingTimes: newTimes }));
    }
  };

  const toggleAnimalSelection = (animalId: string) => {
    setSelectedAnimals(prev => 
      prev.includes(animalId)
        ? prev.filter(id => id !== animalId)
        : [...prev, animalId]
    );
  };

  const selectAllAnimals = () => {
    if (selectedAnimals.length === animals.length) {
      setSelectedAnimals([]);
    } else {
      setSelectedAnimals(animals.map(animal => animal._id));
    }
  };

  const handleGenerateWithAI = async () => {
    if (selectedAnimals.length === 0) {
      showToast('Please select at least one animal', 'error');
      return;
    }

    if (!formData.feedType) {
      showToast('Please specify feed type', 'error');
      return;
    }

    try {
      setGeneratingWithAI(true);
      const response = await api.post(`/feed-schedule/${farmId}/generate-schedule`, {
        animalIds: selectedAnimals,
        feedType: formData.feedType,
        customInstructions: formData.customInstructions || undefined
      });

      const schedule = response.data.data;
      const animalNames = schedule.animalIds
        .map((animal: any) => animal.name)
        .join(', ');
      
      showToast(
        `AI-generated feeding schedule created successfully for ${animalNames}!`,
        'success'
      );
      navigate(`/farms/${farmId}/feed-schedules`);
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Failed to generate schedule with AI',
        'error'
      );
    } finally {
      setGeneratingWithAI(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedAnimals.length === 0) {
      showToast('Please select at least one animal', 'error');
      return;
    }

    if (!formData.scheduleName || !formData.feedType || !formData.quantity) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const validTimes = formData.feedingTimes.filter(time => time.trim() !== '');
    if (validTimes.length === 0) {
      showToast('Please add at least one feeding time', 'error');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/feed-schedule/${farmId}`, {
        scheduleName: formData.scheduleName,
        animalIds: selectedAnimals,
        feedType: formData.feedType,
        feedingTimes: validTimes,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        notes: formData.notes || undefined
      });

      showToast('Feeding schedule created successfully!', 'success');
      navigate(`/farms/${farmId}/feed-schedules`);
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Failed to create feeding schedule',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingAnimals) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading animals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Link to={`/farms/${farmId}/dashboard`} className="text-gray-600 hover:text-gray-900">
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Farm
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Feeding Schedule</h1>
          <p className="text-gray-600 mt-1">
            {farm?.name} - {useAI ? 'Generate with AI' : 'Manual Entry'}
          </p>
        </div>

        {/* AI Toggle */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                <i className="fas fa-robot text-blue-600 mr-2"></i>
                AI-Powered Schedule Generation
              </h3>
              <p className="text-sm text-gray-600">
                Let AI analyze your animals and create an optimized feeding schedule
              </p>
            </div>
            <button
              type="button"
              onClick={() => setUseAI(!useAI)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                useAI ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  useAI ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Animal Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Select Animals</h3>
            <button
              type="button"
              onClick={selectAllAnimals}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {selectedAnimals.length === animals.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {animals.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-exclamation-circle text-4xl text-gray-400 mb-3"></i>
              <p className="text-gray-600">No animals found in this farm</p>
              <Link
                to={`/farms/${farmId}/animals/add`}
                className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
              >
                Add Animals
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {animals.map(animal => (
                <div
                  key={animal._id}
                  onClick={() => toggleAnimalSelection(animal._id)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedAnimals.includes(animal._id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedAnimals.includes(animal._id)}
                          onChange={() => {}}
                          className="mr-3 h-4 w-4 text-blue-600"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{animal.name}</p>
                          <p className="text-sm text-gray-600">
                            {animal.species} - {animal.breed}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 ml-7 flex items-center gap-3 text-xs text-gray-500">
                        <span><i className="fas fa-calendar-alt mr-1"></i>{animal.age} months</span>
                        <span><i className="fas fa-weight mr-1"></i>{animal.weight} kg</span>
                        <span className={`px-2 py-1 rounded-full ${
                          animal.healthStatus === 'healthy' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {animal.healthStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-sm text-gray-600 mt-3">
            {selectedAnimals.length} animal{selectedAnimals.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        {/* Form based on mode */}
        {useAI ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Generation Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feed Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="feedType"
                  value={formData.feedType}
                  onChange={handleInputChange}
                  placeholder="e.g., Hay, Grain, Mixed feed"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Instructions (Optional)
                </label>
                <textarea
                  name="customInstructions"
                  value={formData.customInstructions}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Any special instructions or considerations for the AI (e.g., 'Focus on weight gain', 'Lactating animals need more', etc.)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleGenerateWithAI}
                disabled={generatingWithAI || selectedAnimals.length === 0}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {generatingWithAI ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic mr-2"></i>
                    Generate Schedule with AI
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/farms/${farmId}/dashboard`)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Details</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="scheduleName"
                    value={formData.scheduleName}
                    onChange={handleInputChange}
                    placeholder="e.g., Morning Cattle Feed"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feed Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="feedType"
                    value={formData.feedType}
                    onChange={handleInputChange}
                    placeholder="e.g., Hay, Grain, Mixed feed"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    step="0.1"
                    min="0.1"
                    placeholder="e.g., 5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="liters">Liters (liters)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feeding Times <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {formData.feedingTimes.map((time, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => handleFeedingTimeChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      {formData.feedingTimes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeedingTime(index)}
                          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addFeedingTime}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <i className="fas fa-plus mr-1"></i>
                  Add Another Time
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Any additional notes or instructions..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={loading || selectedAnimals.length === 0}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    Create Schedule
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/farms/${farmId}/dashboard`)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateFeedSchedule;
