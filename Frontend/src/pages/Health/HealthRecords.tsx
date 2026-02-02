import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/Api';

interface HealthRecord {
  _id: string;
  animalId: {
    _id: string;
    name: string;
    tagId: string;
    species: string;
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

const HealthRecords = () => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRecordType, setFilterRecordType] = useState('all');
  const [filterHealthStatus, setFilterHealthStatus] = useState('all');

  useEffect(() => {
    fetchHealthRecords();
  }, []);

  const fetchHealthRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/health');
      setRecords(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching health records:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.animalId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.animalId?.tagId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRecordType = filterRecordType === 'all' || record.recordType === filterRecordType;
    const matchesHealthStatus = filterHealthStatus === 'all' || record.healthStatus?.toLowerCase() === filterHealthStatus.toLowerCase();

    return matchesSearch && matchesRecordType && matchesHealthStatus;
  });

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Health Records</h1>
        <p className="text-gray-600 mt-2">View and manage animal health records</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <i className="fas fa-notes-medical text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{records.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <i className="fas fa-exclamation-triangle text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Critical/Sick</p>
              <p className="text-2xl font-bold text-gray-900">
                {records.filter(r => ['sick', 'quarantined'].includes(r.healthStatus?.toLowerCase())).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <i className="fas fa-heartbeat text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Treatment</p>
              <p className="text-2xl font-bold text-gray-900">
                {records.filter(r => ['treatment', 'recovery'].includes(r.healthStatus?.toLowerCase())).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <i className="fas fa-check-circle text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vaccinations</p>
              <p className="text-2xl font-bold text-gray-900">
                {records.filter(r => r.recordType === 'vaccination').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Records
            </label>
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by animal or diagnosis..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Record Type
            </label>
            <select
              value={filterRecordType}
              onChange={(e) => setFilterRecordType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="vaccination">Vaccination</option>
              <option value="treatment">Treatment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Health Status
            </label>
            <select
              value={filterHealthStatus}
              onChange={(e) => setFilterHealthStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="healthy">Healthy</option>
              <option value="sick">Sick</option>
              <option value="treatment">Treatment</option>
              <option value="recovery">Recovery</option>
              <option value="quarantined">Quarantined</option>
              <option value="vaccination">Vaccination</option>
            </select>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Animal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diagnosis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Record Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Health Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Treated By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <i className="fas fa-notes-medical text-4xl mb-4 text-gray-300"></i>
                    <p>No health records found</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {record.animalId?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {record.animalId?.tagId || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{record.diagnosis || 'N/A'}</div>
                      {record.notes && (
                        <div className="text-xs text-gray-500 mt-1">
                          {record.notes.substring(0, 50)}{record.notes.length > 50 && '...'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRecordTypeBadge(record.recordType)}`}>
                        {record.recordType || 'general'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getHealthStatusBadge(record.healthStatus)}`}>
                        {record.healthStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.treatedBy 
                        ? `${record.treatedBy.firstName} ${record.treatedBy.lastName}`
                        : 'Not assigned'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/health/${record._id}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        <i className="fas fa-eye"></i>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HealthRecords;
