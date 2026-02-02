import api from "../../utils/Api";
import { useState, useEffect } from "react";

const AdminDashboard = () => {
    const [stats, setStats] = useState<any>({
        totalUsers: 0,
        totalAnimals: 0,
        activeFarms: 0,
        systemHealth: 'Good',
        userActivity: [],
        systemDetails: {
            uptime: 'N/A',
            cpuUsage: 'N/A',
            memoryUsage: 'N/A'
        }
    });
    const [detailView, setDetailView] = useState<string | null>(null);
    const [detailData, setDetailData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/admin-dashboard');
                
                // Helper function to format uptime in seconds to human readable
                const formatUptime = (seconds: number) => {
                    const days = Math.floor(seconds / 86400);
                    const hours = Math.floor((seconds % 86400) / 3600);
                    const minutes = Math.floor((seconds % 3600) / 60);
                    return `${days}d ${hours}h ${minutes}m`;
                };

                // Helper function to calculate CPU usage percentage
                const parseCpuUsage = (cpu: any) => {
                    if (typeof cpu === 'object' && cpu.user !== undefined && cpu.system !== undefined) {
                        const total = cpu.user + cpu.system;
                        const percentage = total / 1000000; // Convert to percentage
                        return `${Math.min(percentage, 100).toFixed(2)}%`;
                    }
                    return typeof cpu === 'string' ? cpu : 'N/A';
                };

                // Helper function to calculate memory usage percentage
                const parseMemoryUsage = (mem: any) => {
                    if (typeof mem === 'object' && mem.heapUsed !== undefined && mem.heapTotal !== undefined) {
                        const percentage = ((mem.heapUsed / mem.heapTotal) * 100).toFixed(2);
                        return `${percentage}%`;
                    }
                    return typeof mem === 'string' ? mem : 'N/A';
                };

                const uptime = response.data.systemDetails?.uptime;
                const formattedUptime = typeof uptime === 'number' ? formatUptime(uptime) : uptime || 'N/A';

                setStats({
                    totalUsers: response.data.totalUsers || 0,
                    totalAnimals: response.data.totalAnimals || 0,
                    activeFarms: response.data.activeFarms || 0,
                    systemHealth: response.data.systemHealth || 'Good',
                    userActivity: response.data.userActivity || [],
                    systemDetails: {
                        uptime: formattedUptime,
                        cpuUsage: parseCpuUsage(response.data.systemDetails?.cpuUsage),
                        memoryUsage: parseMemoryUsage(response.data.systemDetails?.memoryUsage)
                    }
                });
            } catch (error) {
                // Silently handle error, keep default state
            }
        };
        fetchStats();
    }, []);

    const fetchDetails = async (type: string) => {
        setLoading(true);
        setDetailView(type);
        try {
            let endpoint = '';
            switch (type) {
                case 'users':
                    endpoint = '/users';
                    break;
                case 'animals':
                    endpoint = '/livestock/animals';
                    break;
                case 'farms':
                    endpoint = '/farms/all';
                    break;
                case 'system':
                    endpoint = '/dashboard/system-info';
                    break;
            }
            const response = await api.get(endpoint);
            setDetailData(response.data.data || response.data);
        } catch (error) {
            setDetailData(null);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setDetailView(null);
        setDetailData(null);
    };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <button 
          onClick={() => fetchDetails('users')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer text-left"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <i className="fas fa-users text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-xs text-blue-600 mt-1">Click for details →</p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => fetchDetails('animals')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer text-left"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <i className="fas fa-cow text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Animals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAnimals}</p>
              <p className="text-xs text-green-600 mt-1">Click for details →</p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => fetchDetails('farms')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer text-left"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <i className="fas fa-chart-line text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Farms</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeFarms}</p>
              <p className="text-xs text-purple-600 mt-1">Click for details →</p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => fetchDetails('system')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer text-left"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <i className="fas fa-server text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className="text-2xl font-bold text-gray-900">{stats.systemHealth}</p>
              <p className="text-xs text-yellow-600 mt-1">Click for details →</p>
            </div>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <i className="fas fa-history text-blue-600 mr-2"></i>
              Recent User Activity
            </h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Last 10 actions
            </span>
          </div>
          
          {stats.userActivity && stats.userActivity.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stats.userActivity.map((activity: any, index: number) => {
                const actionIcons: any = {
                  'CREATE': { icon: 'fa-plus-circle', color: 'text-green-600', bg: 'bg-green-50' },
                  'UPDATE': { icon: 'fa-edit', color: 'text-blue-600', bg: 'bg-blue-50' },
                  'DELETE': { icon: 'fa-trash', color: 'text-red-600', bg: 'bg-red-50' },
                  'LOGIN': { icon: 'fa-sign-in-alt', color: 'text-purple-600', bg: 'bg-purple-50' },
                  'LOGOUT': { icon: 'fa-sign-out-alt', color: 'text-gray-600', bg: 'bg-gray-50' }
                };
                
                const config = actionIcons[activity.action] || { icon: 'fa-circle', color: 'text-gray-600', bg: 'bg-gray-50' };
                
                const formatTimestamp = (timestamp: string) => {
                  const date = new Date(timestamp);
                  const now = new Date();
                  const diffMs = now.getTime() - date.getTime();
                  const diffMins = Math.floor(diffMs / 60000);
                  const diffHours = Math.floor(diffMins / 60);
                  const diffDays = Math.floor(diffHours / 24);
                  
                  if (diffMins < 1) return 'Just now';
                  if (diffMins < 60) return `${diffMins}m ago`;
                  if (diffHours < 24) return `${diffHours}h ago`;
                  if (diffDays < 7) return `${diffDays}d ago`;
                  return date.toLocaleDateString();
                };
                
                return (
                  <div key={index} className={`${config.bg} rounded-lg p-4 border-l-4 border-${config.color.replace('text-', '')} hover:shadow-md transition-shadow`}>
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 w-10 h-10 ${config.bg} rounded-full flex items-center justify-center mr-3`}>
                        <i className={`fas ${config.icon} ${config.color} text-lg`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-900 capitalize">
                            {activity.action}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(activity.timestamp || activity.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {activity.entityType && (
                            <span className="font-medium text-gray-700">{activity.entityType}</span>
                          )}
                          {activity.details && typeof activity.details === 'string' && (
                            <span className="block mt-1 text-gray-500">{activity.details}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <i className="fas fa-chart-pie text-indigo-600 mr-2"></i>
              System Metrics
            </h2>
            <button 
              onClick={() => fetchDetails('system')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
            >
              View Details <i className="fas fa-external-link-alt ml-1"></i>
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Uptime Metric */}
            <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-clock text-green-600 text-lg"></i>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">System Uptime</p>
                    <p className="text-xl font-bold text-gray-900">{stats.systemDetails.uptime}</p>
                  </div>
                </div>
                <div className="text-green-500">
                  <i className="fas fa-check-circle text-2xl"></i>
                </div>
              </div>
            </div>

            {/* CPU Usage with Progress Bar */}
            <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-microchip text-blue-600 text-lg"></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-gray-500 uppercase">CPU Usage</p>
                    <p className="text-sm font-bold text-gray-900">{stats.systemDetails.cpuUsage}</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: typeof stats.systemDetails.cpuUsage === 'string' && stats.systemDetails.cpuUsage.includes('%') 
                        ? stats.systemDetails.cpuUsage 
                        : '0%' 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Memory Usage with Progress Bar */}
            <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-memory text-purple-600 text-lg"></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-gray-500 uppercase">Memory Usage</p>
                    <p className="text-sm font-bold text-gray-900">{stats.systemDetails.memoryUsage}</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-purple-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: typeof stats.systemDetails.memoryUsage === 'string' && stats.systemDetails.memoryUsage.includes('%')
                        ? stats.systemDetails.memoryUsage 
                        : '0%' 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Health Status */}
            <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 animate-pulse">
                    <i className="fas fa-heartbeat text-green-600 text-lg"></i>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">System Status</p>
                    <p className="text-lg font-bold text-green-600">{stats.systemHealth}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {detailView && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 capitalize">
                {detailView === 'users' && 'All Users'}
                {detailView === 'animals' && 'All Animals'}
                {detailView === 'farms' && 'All Farms'}
                {detailView === 'system' && 'System Information'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {detailView === 'users' && detailData && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {Array.isArray(detailData) && detailData.map((user: any) => (
                            <tr key={user._id || user.id}>
                              <td className="px-4 py-3 text-sm text-gray-900">{user.firstName} {user.lastName}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`px-2 py-1 text-xs rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {detailView === 'animals' && detailData && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tag ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Species</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farm</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Health</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {Array.isArray(detailData) && detailData.map((animal: any) => (
                            <tr key={animal._id || animal.id}>
                              <td className="px-4 py-3 text-sm text-gray-900">{animal.name}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{animal.tagId}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 capitalize">{animal.species}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {animal.farmId?.name || 'N/A'}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                                  animal.healthStatus === 'healthy' ? 'bg-green-100 text-green-800' :
                                  animal.healthStatus === 'sick' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {animal.healthStatus || 'healthy'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {detailView === 'farms' && detailData && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farm Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {Array.isArray(detailData) && detailData.map((farm: any) => (
                            <tr key={farm._id || farm.id}>
                              <td className="px-4 py-3 text-sm text-gray-900">{farm.name}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {farm.location?.county || farm.location?.subCounty 
                                  ? `${farm.location.county || ''}${farm.location.county && farm.location.subCounty ? ', ' : ''}${farm.location.subCounty || ''}`
                                  : typeof farm.location === 'string' ? farm.location : 'N/A'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {farm.size?.value ? `${farm.size.value} ${farm.size.unit || 'acres'}` : typeof farm.size === 'number' ? `${farm.size} acres` : 'N/A'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {farm.owner?.firstName ? `${farm.owner.firstName} ${farm.owner.lastName}` : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {detailView === 'system' && (
                    <div className="space-y-6">
                      {/* System Status Banner */}
                      <div className={`rounded-xl p-6 ${
                        stats.systemHealth === 'Good' 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200' 
                          : 'bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mr-4 ${
                              stats.systemHealth === 'Good' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              <i className={`fas fa-heartbeat text-3xl ${
                                stats.systemHealth === 'Good' ? 'text-green-600' : 'text-red-600'
                              }`}></i>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-1">System Health Status</p>
                              <p className={`text-3xl font-bold ${
                                stats.systemHealth === 'Good' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {stats.systemHealth}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => fetchDetails('system')}
                            className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-sm font-medium text-gray-700"
                          >
                            <i className="fas fa-sync-alt mr-2"></i>
                            Refresh
                          </button>
                        </div>
                      </div>

                      {/* Performance Metrics Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Uptime Card */}
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                              <i className="fas fa-clock text-blue-600 text-xl"></i>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-600 uppercase">System Uptime</p>
                              <p className="text-2xl font-bold text-gray-900">{stats.systemDetails.uptime}</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600">Time since last restart</p>
                        </div>

                        {/* CPU Usage Card */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                              <i className="fas fa-microchip text-purple-600 text-xl"></i>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-gray-600 uppercase">CPU Usage</p>
                              <p className="text-2xl font-bold text-gray-900">{stats.systemDetails.cpuUsage}</p>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div 
                              className={`h-3 rounded-full transition-all duration-500 ${
                                parseFloat(stats.systemDetails.cpuUsage) > 80 
                                  ? 'bg-gradient-to-r from-red-400 to-red-600' 
                                  : parseFloat(stats.systemDetails.cpuUsage) > 50
                                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                                  : 'bg-gradient-to-r from-green-400 to-green-600'
                              }`}
                              style={{ width: stats.systemDetails.cpuUsage }}
                            ></div>
                          </div>
                        </div>

                        {/* Memory Usage Card */}
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                              <i className="fas fa-memory text-orange-600 text-xl"></i>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-gray-600 uppercase">Memory Usage</p>
                              <p className="text-2xl font-bold text-gray-900">{stats.systemDetails.memoryUsage}</p>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-2">
                            <div 
                              className={`h-3 rounded-full transition-all duration-500 ${
                                parseFloat(stats.systemDetails.memoryUsage) > 80 
                                  ? 'bg-gradient-to-r from-red-400 to-red-600' 
                                  : parseFloat(stats.systemDetails.memoryUsage) > 50
                                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                                  : 'bg-gradient-to-r from-green-400 to-green-600'
                              }`}
                              style={{ width: stats.systemDetails.memoryUsage }}
                            ></div>
                          </div>
                          {detailData?.performanceMetrics?.memoryUsage && (
                            <div className="flex justify-between text-xs text-gray-600 mt-2">
                              <span>Used: {(detailData.performanceMetrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB</span>
                              <span>Total: {(detailData.performanceMetrics.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                          )}
                        </div>

                        {/* Event Loop Delay Card */}
                        {detailData?.performanceMetrics?.eventLoopDelay !== undefined && (
                          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-100">
                            <div className="flex items-center mb-4">
                              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                                <i className="fas fa-tachometer-alt text-teal-600 text-xl"></i>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-600 uppercase">Event Loop Delay</p>
                                <p className="text-2xl font-bold text-gray-900">
                                  {detailData.performanceMetrics.eventLoopDelay.toFixed(2)} ms
                                </p>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600">Lower is better for responsiveness</p>
                          </div>
                        )}
                      </div>

                      {/* Detailed Memory Breakdown */}
                      {detailData?.performanceMetrics?.memoryUsage && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <i className="fas fa-chart-bar text-indigo-600 mr-2"></i>
                            Detailed Memory Breakdown
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">RSS</p>
                              <p className="text-lg font-bold text-gray-900">
                                {(detailData.performanceMetrics.memoryUsage.rss / 1024 / 1024).toFixed(2)} MB
                              </p>
                              <p className="text-xs text-gray-500 mt-1">Resident Set</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">Heap Total</p>
                              <p className="text-lg font-bold text-gray-900">
                                {(detailData.performanceMetrics.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB
                              </p>
                              <p className="text-xs text-gray-500 mt-1">Allocated</p>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">Heap Used</p>
                              <p className="text-lg font-bold text-gray-900">
                                {(detailData.performanceMetrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB
                              </p>
                              <p className="text-xs text-gray-500 mt-1">In Use</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">External</p>
                              <p className="text-lg font-bold text-gray-900">
                                {(detailData.performanceMetrics.memoryUsage.external / 1024 / 1024).toFixed(2)} MB
                              </p>
                              <p className="text-xs text-gray-500 mt-1">C++ Objects</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* CPU Usage Breakdown */}
                      {detailData?.performanceMetrics?.cpuUsage && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <i className="fas fa-microchip text-purple-600 mr-2"></i>
                            CPU Usage Breakdown
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-700">User CPU Time</p>
                                <p className="text-lg font-bold text-blue-600">
                                  {(detailData.performanceMetrics.cpuUsage.user / 1000000).toFixed(2)}%
                                </p>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${Math.min((detailData.performanceMetrics.cpuUsage.user / 1000000), 100)}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-700">System CPU Time</p>
                                <p className="text-lg font-bold text-purple-600">
                                  {(detailData.performanceMetrics.cpuUsage.system / 1000000).toFixed(2)}%
                                </p>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-purple-600 h-2 rounded-full"
                                  style={{ width: `${Math.min((detailData.performanceMetrics.cpuUsage.system / 1000000), 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {stats.systemHealth === 'Poor' && (
                        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
                          <div className="flex items-start">
                            <i className="fas fa-exclamation-triangle text-red-500 text-xl mr-3 mt-1"></i>
                            <div>
                              <h4 className="text-lg font-semibold text-red-800 mb-2">System Health Warning</h4>
                              <p className="text-sm text-red-700 mb-3">
                                Your system is experiencing high resource usage. Consider the following actions:
                              </p>
                              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                                <li>Restart the backend server to clear memory</li>
                                <li>Check for memory leaks in the application</li>
                                <li>Increase Node.js memory limit (--max-old-space-size)</li>
                                <li>Optimize database queries and implement caching</li>
                                <li>Monitor and close unnecessary processes</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!detailData && !loading && (
                    <div className="text-center py-12 text-gray-500">
                      No data available
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;