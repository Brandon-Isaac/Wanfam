import api from "../../utils/Api";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";


const WorkerDashboard = () => {
  const [stats, setStats] = useState<any>({});
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/worker-dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <i className="fas fa-tasks text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assigned Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.assignedTasks || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <i className="fas fa-check-circle text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedTasks || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <i className="fas fa-clock text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingTasks || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <i className="fas fa-spinner text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inprogressTasks || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <i className="fas fa-exclamation text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overdueTasks || 0}</p>
            </div>
          </div>
        </div>
      </div>

<div className="flex flex-row justify-between space-x-6">
      <div className="bg-white rounded-lg shadow p-6 w-2/3">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Incomplete Tasks</h2>
        <ul className="mt-4">
          {stats.ongoingTasksList && stats.ongoingTasksList.map((task: any, index: number) => (
            <li key={index} className="border-b border-gray-200 py-2">
              <p className="text-sm text-gray-600">{task.title}</p>
              <p className="text-xs text-gray-400">{task.description}</p>
            </li>
          ))}
        </ul>
      </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <Link
                to={`/tasks`}
                className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <i className="fas fa-tasks text-green-600 text-2xl mb-2"></i>
                <span className="text-sm font-medium text-green-800">My Tasks</span>
              </Link>
              <Link
                to="/assigned-animals"
                className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <i className="fas fa-eye text-blue-600 text-2xl mb-2"></i>
                <span className="text-sm font-medium text-blue-800">Animals assigned</span>
              </Link>
              <Link
                to="/chatbot"
                className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <i className="fas fa-comments text-purple-600 text-2xl mb-2"></i>
                <span className="text-sm font-medium text-purple-800">Chatbot</span>
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
        </div>
</div>
    </div>
  );
};

export default WorkerDashboard;