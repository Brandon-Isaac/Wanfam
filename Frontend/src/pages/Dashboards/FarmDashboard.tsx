import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../utils/Api';
import FarmBanner from '../../components/FarmBanner';

const FarmDashboard = () => {
  const { farmId } = useParams();
  const [stats, setStats] = useState({} as any);

  useEffect(() => {
    const fetchFarmStats = async () => {
      try {
        const response = await api.get(`/dashboard/farmer-dashboard/${farmId}`);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching farm stats:', error);
      }
    };

    fetchFarmStats();
  }, [farmId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <FarmBanner userRole="farmer" farmDetails={stats} />
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Large Metric Cards */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Total Animals</p>
                <p className="text-4xl font-bold text-gray-900">{stats.totalAnimals?.toLocaleString() || 0}</p>
                <p className="text-sm text-green-600 mt-2 flex items-center">
                  <i className="fas fa-arrow-up mr-1"></i>
                  {stats.healthyLivestock || 0} healthy
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <i className="fas fa-cow text-2xl text-green-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Revenue (30 days)</p>
                <p className="text-4xl font-bold text-gray-900">
                  {stats.totalRevenue !== undefined ? `${(stats.totalRevenue / 1000).toFixed(1)}K` : '0'}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  KES {stats.totalRevenue?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <i className="fas fa-chart-line text-2xl text-blue-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Net Profit (30 days)</p>
                <p className={`text-4xl font-bold ${(stats.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.netProfit !== undefined ? `${(stats.netProfit / 1000).toFixed(1)}K` : '0'}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  KES {stats.netProfit?.toLocaleString() || 0}
                </p>
              </div>
              <div className={`p-3 ${(stats.netProfit || 0) >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-lg`}>
                <i className={`fas fa-coins text-2xl ${(stats.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}></i>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending Tasks</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingTasks || 0}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <i className="fas fa-tasks text-blue-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Health Alerts</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.sickAnimals || 0}</p>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <i className="fas fa-exclamation-triangle text-red-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Checkups</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.upcomingCheckupsCount || 0}</p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <i className="fas fa-calendar-alt text-yellow-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expenses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalExpenses !== undefined ? `${(stats.totalExpenses / 1000).toFixed(0)}K` : '0'}
                </p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <i className="fas fa-receipt text-purple-600"></i>
              </div>
            </div>
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
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">{stats.healthyLivestock || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Healthy Animals</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-3xl font-bold text-red-600">{stats.sickAnimals || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Sick Animals</p>
                  </div>
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
                  to={`/farms/${farmId}/livestock`}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:shadow-md transition-all border border-green-200"
                >
                  <i className="fas fa-paw text-green-600 text-xl mb-2"></i>
                  <span className="text-xs font-semibold text-green-800 text-center">Animals</span>
                </Link>
                <Link
                  to={`/farms/${farmId}/tasks`}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-all border border-blue-200"
                >
                  <i className="fas fa-tasks text-blue-600 text-xl mb-2"></i>
                  <span className="text-xs font-semibold text-blue-800 text-center">Tasks</span>
                </Link>
                <Link
                  to={`/farms/${farmId}/animals/sick`}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg hover:shadow-md transition-all border border-yellow-200"
                >
                  <i className="fas fa-notes-medical text-yellow-600 text-xl mb-2"></i>
                  <span className="text-xs font-semibold text-yellow-800 text-center">Sick Animals</span>
                </Link>
                <Link
                  to={`/farms/${farmId}/vets`}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg hover:shadow-md transition-all border border-indigo-200"
                >
                  <i className="fas fa-user-md text-indigo-600 text-xl mb-2"></i>
                  <span className="text-xs font-semibold text-indigo-800 text-center">Vets</span>
                </Link>
                <Link
                  to={`/farms/${farmId}/production/record`}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition-all border border-purple-200"
                >
                  <i className="fas fa-water text-purple-600 text-xl mb-2"></i>
                  <span className="text-xs font-semibold text-purple-800 text-center">Production</span>
                </Link>
                <Link
                  to={`/farms/${farmId}/update`}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg hover:shadow-md transition-all border border-red-200"
                >
                  <i className="fas fa-edit text-red-600 text-xl mb-2"></i>
                  <span className="text-xs font-semibold text-red-800 text-center">Update</span>
                </Link>
                <Link
                  to={`/farms/${farmId}/workers`}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg hover:shadow-md transition-all border border-orange-200"
                >
                  <i className="fas fa-users text-orange-600 text-xl mb-2"></i>
                  <span className="text-xs font-semibold text-orange-800 text-center">Workers</span>
                </Link>
                <Link
                  to={`/farms/${farmId}/financial`}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg hover:shadow-md transition-all border border-teal-200"
                >
                  <i className="fas fa-chart-pie text-teal-600 text-xl mb-2"></i>
                  <span className="text-xs font-semibold text-teal-800 text-center">Financial</span>
                </Link>
              </div>
            </div>

            {/* Upcoming Checkups */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Checkups</h2>
              </div>
              <div className="p-4">
                {stats.upcomingCheckups?.length > 0 ? (
                  <div className="space-y-3">
                    {stats.upcomingCheckups.map((checkup: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {checkup.animalName || `Animal #${checkup.animalId}`}
                          </p>
                          <p className="text-xs text-gray-600">{checkup.type || 'Regular Checkup'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-yellow-700">
                            {new Date(checkup.scheduledDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-calendar-check text-gray-300 text-3xl mb-2"></i>
                    <p className="text-sm text-gray-500">No upcoming checkups</p>
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
    </div>
  );
};

export default FarmDashboard;