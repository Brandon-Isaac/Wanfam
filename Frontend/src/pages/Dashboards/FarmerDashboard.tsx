import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../utils/Api';

const FarmerDashboard = () => {
    const [stats, setStats] = useState<any>({});
  const fetchStats = async () => {
    try {
      const response = await api.get(`/dashboard/farmer-dashboard`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <i className="fas fa-home text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Farms</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFarms || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <i className="fas fa-cow text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Animals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAnimals || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <i className="fas fa-exclamation-triangle text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Health Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.sickAnimals || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                    <i className="fas fa-calendar-alt text-xl"></i>
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Upcoming Checkups</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.upcomingCheckupsCount || 0}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
                        {/* Activity list */}
              <div className="space-y-4">
                {stats.recentActivity?.length > 0 ? (
                  stats.recentActivity.map((recentActivity: { action: string; timestamp: Date, details: { path: string ,body: { firstName: string, lastName: string ,name: string} } }, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div title={`by ${recentActivity.details.body.firstName || recentActivity.details.body.name || ''} ${recentActivity.details.body.lastName || ''}`} >
                            <h2 className="text-sm text-gray-900">{recentActivity.action}</h2>
                            <p className="text-sm text-gray-600">At {recentActivity.details.path}</p>
                            <p className="text-xs text-gray-400">{new Date(recentActivity.timestamp).toLocaleString()}</p>
                        </div>
                    </div>
                    ))
                ) : (
                  <p className="text-gray-500">No recent activity</p>
                )}
              </div>
            </div>
          </div>

          {/* Livestock Overview */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Livestock Overview</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.healthyAnimals || 0}</p>
                  <p className="text-sm text-gray-600">Healthy</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{stats.sickAnimals || 0}</p>
                  <p className="text-sm text-gray-600">Sick</p>
                </div>
              </div>
              
              {/* Livestock by Type */}
              {stats.livestockSpeciesCount?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">By Type</h4>
                  <div className="space-y-2">
                    {stats.map((livestockSpeciesCount: { species: string; count: number }, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 capitalize">{livestockSpeciesCount.species}</span>
                        <span className="text-sm font-medium text-gray-900">{livestockSpeciesCount.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <Link
                to="/select/farm"
                className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <i className="fas fa-home text-green-600 text-2xl mb-2"></i>
                <span className="text-sm font-medium text-green-800">Manage Farm</span>
              </Link>
              <Link
                to="/farms"
                className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <i className="fas fa-eye text-blue-600 text-2xl mb-2"></i>
                <span className="text-sm font-medium text-blue-800">View Farms</span>
              </Link>
              <Link
                to="/profile"
                className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <i className="fas fa-user text-red-600 text-2xl mb-2"></i>
                <span className="text-sm font-medium text-red-800">User Profile</span>
              </Link>
       
            </div>
          </div>

        {/* Upcoming Checkups */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Upcoming Checkups</h2>
            </div>
            <div className="p-6">
              {stats.upcomingCheckups?.length > 0 ? (
                <div className="space-y-3">
                  {stats.upcomingCheckups.slice(0, 3).map((checkup: {  animalId: number; species: string; scheduledDate: string, scheduleName: string }, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {checkup.species || `Animal #${checkup.animalId}`}
                          {checkup.scheduleName ? ` - ${checkup.scheduleName}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-yellow-600">
                          {new Date(checkup.scheduledDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-calendar-check text-gray-400 text-2xl mb-2"></i>
                  <p className="text-gray-500">No upcoming checkups</p>
                </div>
              )}
            </div>
          </div>

          {/* Notifications */}
          {stats.notifications?.unread > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <i className="fas fa-bell text-red-600 mr-2"></i>
                    <span className="text-sm text-gray-900">You have unread notifications</span>
                  </div>
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {stats.notifications.unread}
                  </span>
                </div>
                <Link 
                  to="/notifications" 
                  className="mt-3 block text-center bg-gray-50 hover:bg-gray-100 rounded-lg py-2 text-sm text-gray-700"
                >
                  View All
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