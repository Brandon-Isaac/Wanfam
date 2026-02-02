import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/Api';

interface HealthRecord {
  _id: string;
  animalId: {
    _id: string;
    name: string;
    tagId: string;
    species: string;
    breed?: string;
  };
  diagnosis?: string;
  healthStatus: string;
  recordType?: 'vaccination' | 'treatment';
  date: string;
  notes?: string;
  treatedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  recordedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

const HealthRecordDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<HealthRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHealthRecord();
  }, [id]);

  const fetchHealthRecord = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/health/${id}`);
      setRecord(response.data.data || response.data);
    } catch (error: any) {
      console.error('Error fetching health record:', error);
      setError(error.response?.data?.message || 'Failed to load health record');
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatusBadge = (healthStatus: string) => {
    const colors: Record<string, string> = {
      healthy: 'bg-green-100 text-green-800',
      sick: 'bg-red-100 text-red-800',
      treatment: 'bg-orange-100 text-orange-800',
      recovery: 'bg-blue-100 text-blue-800',
      quarantined: 'bg-purple-100 text-purple-800',
      vaccination: 'bg-teal-100 text-teal-800',
      deceased: 'bg-gray-100 text-gray-800'
    };
    return colors[healthStatus?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getRecordTypeBadge = (recordType?: string) => {
    const colors: Record<string, string> = {
      vaccination: 'bg-blue-100 text-blue-800',
      treatment: 'bg-orange-100 text-orange-800'
    };
    return colors[recordType || ''] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <i className="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Health Record</h2>
          <p className="text-red-600 mb-4">{error || 'Health record not found'}</p>
          <button
            onClick={() => navigate('/health')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Back to Health Records
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/health')}
            className="text-green-600 hover:text-green-700 flex items-center mb-2"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Health Records
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Health Record Details</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Animal Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <i className="fas fa-paw text-green-600 mr-2"></i>
              Animal Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Animal Name</p>
                <p className="text-lg font-medium text-gray-900">
                  {record.animalId?.name || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tag ID</p>
                <p className="text-lg font-medium text-gray-900">
                  {record.animalId?.tagId || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Species</p>
                <p className="text-lg font-medium text-gray-900">
                  {record.animalId?.species || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Breed</p>
                <p className="text-lg font-medium text-gray-900">
                  {record.animalId?.breed || 'N/A'}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link
                to={`/animals/${record.animalId?._id}`}
                className="text-green-600 hover:text-green-700 text-sm"
              >
                View Animal Profile <i className="fas fa-arrow-right ml-1"></i>
              </Link>
            </div>
          </div>

          {/* Health Record Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <i className="fas fa-notes-medical text-green-600 mr-2"></i>
              Record Details
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Diagnosis / Procedure</p>
                <p className="text-lg text-gray-900">{record.diagnosis || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Health Status</p>
                  <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getHealthStatusBadge(record.healthStatus)}`}>
                    {record.healthStatus}
                  </span>
                </div>
                {record.recordType && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Record Type</p>
                    <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getRecordTypeBadge(record.recordType)}`}>
                      {record.recordType}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Date</p>
                <p className="text-lg text-gray-900">
                  {new Date(record.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {record.notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Notes</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{record.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Personnel Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <i className="fas fa-user-md text-green-600 mr-2"></i>
              Personnel
            </h2>
            <div className="space-y-4">
              {record.treatedBy && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Treated By</p>
                  <p className="text-base font-medium text-gray-900">
                    {record.treatedBy.firstName} {record.treatedBy.lastName}
                  </p>
                </div>
              )}
              {record.recordedBy && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Recorded By</p>
                  <p className="text-base font-medium text-gray-900">
                    {record.recordedBy.firstName} {record.recordedBy.lastName}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <i className="fas fa-info-circle text-green-600 mr-2"></i>
              Record Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Record ID</p>
                <p className="text-sm text-gray-900 font-mono">{record._id}</p>
              </div>
              {record.createdAt && (
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm text-gray-900">
                    {new Date(record.createdAt).toLocaleString()}
                  </p>
                </div>
              )}
              {record.updatedAt && (
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="text-sm text-gray-900">
                    {new Date(record.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthRecordDetail;
