import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../utils/Api';
import { useToast } from '../contexts/ToastContext';

interface FeedSchedule {
  _id: string;
  scheduleName: string;
  feedType: string;
  feedingTimes: string[];
  quantity: number;
  unit: string;
  notes?: string;
  animalIds: any[];
  createdAt: string;
  updatedAt: string;
}

const FeedSchedules = () => {
  const { farmId } = useParams();
  const { showToast } = useToast();
  const [schedules, setSchedules] = useState<FeedSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [executingSchedules, setExecutingSchedules] = useState<Set<string>>(new Set());
  const [executedToday, setExecutedToday] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (farmId) {
      fetchSchedules();
    }
  }, [farmId]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/feed-schedule/${farmId}`);
      setSchedules(response.data.data || []);
    } catch (error: any) {
      console.error('Error fetching feed schedules:', error);
      showToast('Failed to load feed schedules', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteSchedule = async (schedule: FeedSchedule) => {
    setExecutingSchedules(prev => new Set(prev).add(schedule._id));
    
    try {
      const response = await api.post(`/feed-consumption/${schedule._id}/`);
      
      // Get animal names for notification
      const animalNames = schedule.animalIds
        .map((animal: any) => animal.name || 'Unknown')
        .join(', ');
      
      const totalFed = response.data.totalAmountFed || (schedule.quantity * schedule.animalIds.length);
      
      showToast(
        `Animals ${animalNames} have been fed successfully! Total: ${totalFed} ${schedule.unit}`,
        'success'
      );
      
      // Mark as executed today
      setExecutedToday(prev => new Set(prev).add(schedule._id));
      
      // Remove from displayed schedules
      setSchedules(prevSchedules => 
        prevSchedules.filter(s => s._id !== schedule._id)
      );
    } catch (error: any) {
      console.error('Error executing schedule:', error);
      if (error.response?.data?.alreadyExecuted) {
        showToast('This schedule has already been executed today', 'warning');
        setExecutedToday(prev => new Set(prev).add(schedule._id));
        // Remove from displayed schedules
        setSchedules(prevSchedules => 
          prevSchedules.filter(s => s._id !== schedule._id)
        );
      } else {
        showToast(error.response?.data?.message || 'Failed to execute feeding schedule', 'error');
      }
    } finally {
      setExecutingSchedules(prev => {
        const newSet = new Set(prev);
        newSet.delete(schedule._id);
        return newSet;
      });
    }
  };

  const handleDeleteSchedule = async () => {
    if (!selectedSchedule) return;

    try {
      await api.delete(`/feed-schedule/${selectedSchedule}`);
      setSchedules(schedules.filter(schedule => schedule._id !== selectedSchedule));
      showToast('Feed schedule deleted successfully', 'success');
      setShowDeleteModal(false);
      setSelectedSchedule(null);
    } catch (error: any) {
      showToast('Failed to delete feed schedule', 'error');
      console.error('Error deleting schedule:', error);
    }
  };

  const openDeleteModal = (scheduleId: string) => {
    setSelectedSchedule(scheduleId);
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feed schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Feed Schedules</h1>
              <p className="text-gray-600 mt-1">Manage feeding schedules for your animals</p>
            </div>
            <Link
              to={`/farms/${farmId}/feed-schedule/create`}
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <i className="fas fa-plus mr-2"></i>
              Create Schedule
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Pending Schedules</p>
                <p className="text-3xl font-bold text-gray-900">{schedules.length}</p>
                <p className="text-xs text-gray-500 mt-1">for today</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <i className="fas fa-calendar-alt text-2xl text-blue-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Animals</p>
                <p className="text-3xl font-bold text-gray-900">
                  {schedules.reduce((acc, schedule) => acc + (schedule.animalIds?.length || 0), 0)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <i className="fas fa-cow text-2xl text-green-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Feed Types</p>
                <p className="text-3xl font-bold text-gray-900">
                  {new Set(schedules.map(s => s.feedType)).size}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <i className="fas fa-seedling text-2xl text-purple-600"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Schedules List */}
        {schedules.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check-circle text-4xl text-green-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">All Schedules Executed!</h3>
              <p className="text-gray-600 mb-6">
                Great job! All feeding schedules for today have been completed. New schedules will be available tomorrow, or you can create a new schedule now.
              </p>
              <Link
                to={`/farms/${farmId}/feed-schedule/create`}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <i className="fas fa-plus mr-2"></i>
                Create New Schedule
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules.map((schedule) => (
              <div
                key={schedule._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {schedule.scheduleName}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center">
                        <i className="fas fa-seedling mr-2 text-green-600"></i>
                        {schedule.feedType}
                      </p>
                    </div>
                    <button
                      onClick={() => openDeleteModal(schedule._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm">
                      <i className="fas fa-clock w-5 text-blue-600 mr-2"></i>
                      <span className="text-gray-700">
                        {schedule.feedingTimes?.length || 0} feeding{(schedule.feedingTimes?.length || 0) !== 1 ? 's' : ''} per day
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <i className="fas fa-weight w-5 text-purple-600 mr-2"></i>
                      <span className="text-gray-700">
                        {schedule.quantity} {schedule.unit} per feeding
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <i className="fas fa-paw w-5 text-green-600 mr-2"></i>
                      <span className="text-gray-700">
                        {schedule.animalIds?.length || 0} animal{(schedule.animalIds?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Feeding Times */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Feeding Times
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(schedule.feedingTimes || []).map((time, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                        >
                          <i className="fas fa-clock mr-1"></i>
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Animals */}
                  {schedule.animalIds && schedule.animalIds.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Animals
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {schedule.animalIds.map((animal: any, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full"
                          >
                            <i className="fas fa-paw mr-1"></i>
                            {animal.name || `Animal ${index + 1}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {schedule.notes && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-600 line-clamp-2">{schedule.notes}</p>
                    </div>
                  )}

                  {/* Execute Button */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleExecuteSchedule(schedule)}
                      disabled={executingSchedules.has(schedule._id)}
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {executingSchedules.has(schedule._id) ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Executing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check-circle mr-2"></i>
                          Execute Feeding
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Created {new Date(schedule.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Delete Feed Schedule
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete this feeding schedule? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedSchedule(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSchedule}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
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

export default FeedSchedules;
