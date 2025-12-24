import api from "../../utils/Api";
import { useState, useEffect } from "react";

const AdminDashboard = () => {
    const [stats, setStats] = useState<any>({});

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/admin-dashboard');
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };
        fetchStats();
    }, []);
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <i className="fas fa-users text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
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
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <i className="fas fa-chart-line text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Farms</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeFarms || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <i className="fas fa-server text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className="text-2xl font-bold text-gray-900">{stats.systemHealth || 'Good'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">User Activity</h2>
          <p className="text-gray-600">Recent user logins and actions will be displayed here.</p>
          <ul className="mt-4">
            {stats.userActivity && stats.userActivity.map((activity: any, index: number) => (
              <li key={index} className="border-b border-gray-200 py-2">
                <p className="text-sm text-gray-600">{activity.action}</p>
                <p className="text-xs text-gray-400">{activity.timestamp}</p>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">System Metrics</h2>
            <p className="text-gray-600">Key system performance indicators will be displayed here.</p>
            <ul className="mt-4">
              <li className="border-b border-gray-200 py-2">
                <p className="text-sm text-gray-600">Uptime: {stats.systemDetails.uptime}</p>
              </li>
              <li className="border-b border-gray-200 py-2">
                <p className="text-sm text-gray-600">CPU Usage: {stats.systemDetails.cpuUsage}</p>
              </li>
              <li className="border-b border-gray-200 py-2">
                <p className="text-sm text-gray-600">Memory Usage: {stats.systemDetails.memoryUsage}</p>
              </li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;