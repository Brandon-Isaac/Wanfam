import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../utils/Api';
import { useToast } from '../../contexts/ToastContext';

const FarmerDashboard = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState<any>({});
  const [farmWorkers, setFarmWorkers] = useState<any[]>([]);
  const [farms, setFarms] = useState<any[]>([]);
  const [pendingSchedulesCount, setPendingSchedulesCount] = useState(0);
  
  const fetchStats = async () => {
    try {
      const response = await api.get(`/dashboard/farmer-dashboard`);
      setStats(response.data);
      
      // Fetch workers for the first farm if available
      if (response.data.totalFarms > 0) {
        fetchFarmWorkers();
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchFarmWorkers = async () => {
    try {
      // Get all farms first
      const farmsResponse = await api.get('/farms');
      const farmsData = farmsResponse.data.data || farmsResponse.data;
      setFarms(farmsData);
      
      if (farmsData.length > 0) {
        // Fetch workers from the first farm
        const workersResponse = await api.get(`/workers/${farmsData[0]._id}`);
        setFarmWorkers(workersResponse.data.data || []);
        
        // Fetch pending schedules count
        await fetchPendingSchedules(farmsData[0]._id);
      }
    } catch (error) {
      console.error('Error fetching farm workers:', error);
    }
  };

  const fetchPendingSchedules = async (farmId: string) => {
    try {
      const response = await api.get(`/feed-schedule/${farmId}`);
      setPendingSchedulesCount(response.data.data?.length || 0);
    } catch (error) {
      console.error('Error fetching pending schedules:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening across all your farms.</p>
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Large Metric Cards */}
          <Link 
            to="/select/farm"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-blue-400 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Total Farms</p>
                <p className="text-4xl font-bold text-gray-900">{stats.totalFarms?.toLocaleString() || 0}</p>
                <p className="text-sm text-blue-600 mt-2 flex items-center">
                  <i className="fas fa-home mr-1"></i>
                  Active farms
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <i className="fas fa-home text-2xl text-blue-600"></i>
              </div>
            </div>
          </Link>

          <Link
            to="/revenue"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-green-400 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Total Revenue (30d)</p>
                <p className="text-4xl font-bold text-gray-900">
                  {stats.totalRevenue !== undefined ? `${(stats.totalRevenue / 1000).toFixed(1)}K` : '0'}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  KES {stats.totalRevenue?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <i className="fas fa-chart-line text-2xl text-green-600"></i>
              </div>
            </div>
          </Link>

          <Link
            to="/animals/all"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-green-400 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Total Animals</p>
                <p className="text-4xl font-bold text-gray-900">{stats.totalAnimals?.toLocaleString() || 0}</p>
                <p className="text-sm text-green-600 mt-2 flex items-center">
                  <i className="fas fa-check-circle mr-1"></i>
                  {stats.healthyAnimals || 0} healthy
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <i className="fas fa-cow text-2xl text-green-600"></i>
              </div>
            </div>
          </Link>

          <Link
            to={farms.length > 0 ? `/farms/${farms[0]._id}/feed-schedules` : "/select/farm"}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-orange-400 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Pending Feeds</p>
                <p className="text-4xl font-bold text-gray-900">{pendingSchedulesCount}</p>
                <p className="text-sm text-orange-600 mt-2 flex items-center">
                  <i className="fas fa-calendar-check mr-1"></i>
                  for today
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <i className="fas fa-utensils text-2xl text-orange-600"></i>
              </div>
            </div>
          </Link>
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            to="/animals/all?filter=sick"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all hover:border-red-400 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Health Alerts</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.sickAnimals || 0}</p>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <i className="fas fa-exclamation-triangle text-red-600"></i>
              </div>
            </div>
          </Link>
          <Link
            to="/expenses"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all hover:border-purple-400 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expenses (30d)</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalExpenses !== undefined ? `${(stats.totalExpenses / 1000).toFixed(0)}K` : '0'}
                </p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <i className="fas fa-receipt text-purple-600"></i>
              </div>
            </div>
          </Link>
          <Link
            to="/financial-overview"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all hover:border-green-400 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Net Profit (30d)</p>
                <p className={`text-2xl font-bold mt-1 ${(stats.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.netProfit !== undefined ? `${(stats.netProfit / 1000).toFixed(0)}K` : '0'}
                </p>
              </div>
              <div className={`p-2 ${(stats.netProfit || 0) >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-lg`}>
                <i className={`fas fa-coins ${(stats.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}></i>
              </div>
            </div>
          </Link>
              </div>
            </div>


        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recentActivity?.length > 0 ? (
                      stats.recentActivity.slice(0, 8).map((activity: any, index: number) => {
                        const formatPath = (path: string, entityType: string) => {
                          if (!path) return 'Unknown location';
                          const segments = path.split('/').filter(seg => seg);
                          const readableSegments = segments.map(seg => {
                            if (/^[a-f0-9]{24}$/i.test(seg)) {
                              return entityType || 'record';
                            }
                            return seg.replace(/[-_]/g, ' ')
                              .split(' ')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(' ');
                          });
                          return readableSegments.join(' > ');
                        };

                        const userName = activity.userId?.firstName
                          ? `${activity.userId.firstName} ${activity.userId.lastName || ''}`.trim()
                          : activity.userId?.username || 'Unknown';

                        return (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {activity.action}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-900">
                                {formatPath(activity.details?.path, activity.entityType)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-700">{userName}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-500">
                                {new Date(activity.timestamp).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                          No recent activity
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Livestock Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Livestock Overview</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <Link
                    to="/animals/all?filter=healthy"
                    className="text-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-all hover:shadow-md cursor-pointer border border-green-200"
                  >
                    <p className="text-3xl font-bold text-green-600">{stats.healthyAnimals || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Healthy Animals</p>
                  </Link>
                  <Link
                    to="/animals/all?filter=sick"
                    className="text-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-all hover:shadow-md cursor-pointer border border-red-200"
                  >
                    <p className="text-3xl font-bold text-red-600">{stats.sickAnimals || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Sick Animals</p>
                  </Link>
                </div>

                {/* Livestock by Type */}
                {stats.livestockSpeciesCount?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">By Species</h4>
                    <div className="space-y-2">
                      {stats.livestockSpeciesCount.map((item: { species: string; count: number }, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700 capitalize">{item.species}</span>
                          <span className="text-sm font-bold text-gray-900">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                <Link
                  to="/select/farm"
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:shadow-md transition-all border border-green-200"
                >
                  <i className="fas fa-home text-green-600 text-xl mb-2"></i>
                  <span className="text-xs font-semibold text-green-800 text-center">Manage Farm</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg hover:shadow-md transition-all border border-red-200"
                >
                  <i className="fas fa-user text-red-600 text-xl mb-2"></i>
                  <span className="text-xs font-semibold text-red-800 text-center">Profile</span>
                </Link>
                <Link
                  to={farms?.[0]?._id ? `/farms/${farms[0]._id}/feed-schedules` : '/select/farm'}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-all border border-blue-200"
                  onClick={(e) => {
                    if (!farms?.[0]?._id) {
                      e.preventDefault();
                      showToast('Please select a farm first', 'warning');
                    }
                  }}
                >
                  <i className="fas fa-calendar-plus text-blue-600 text-xl mb-2"></i>
                  <span className="text-xs font-semibold text-blue-800 text-center">Feed Schedule</span>
                </Link>
                <Link
                  to="/tasks"
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition-all border border-purple-200"
                >
                  <i className="fas fa-tasks text-purple-600 text-xl mb-2"></i>
                  <span className="text-xs font-semibold text-purple-800 text-center">My Tasks</span>
                </Link>
              </div>
            </div>

            {/* Farm Workers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Farm Workers</h2>
              </div>
              <div className="p-4">
                {farmWorkers?.length > 0 ? (
                  <div className="space-y-3">
                    {farmWorkers.slice(0, 5).map((worker: { _id: string; firstName: string; lastName: string; role: string; email: string }, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {worker.firstName?.charAt(0)}{worker.lastName?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {worker.firstName} {worker.lastName}
                            </p>
                            <p className="text-xs text-gray-600 capitalize">{worker.role || 'Worker'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <i className="fas fa-user-check text-blue-600"></i>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-users text-gray-300 text-3xl mb-2"></i>
                    <p className="text-sm text-gray-500">No farm workers</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notifications */}
            {stats.notifications?.unread > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center">
                      <i className="fas fa-bell text-red-600 mr-3"></i>
                      <span className="text-sm font-medium text-gray-900">Unread notifications</span>
                    </div>
                    <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {stats.notifications.unread}
                    </span>
                  </div>
                  <Link
                    to="/notifications"
                    className="mt-3 block text-center bg-gray-50 hover:bg-gray-100 rounded-lg py-2.5 text-sm font-medium text-gray-700 transition-colors"
                  >
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default FarmerDashboard;