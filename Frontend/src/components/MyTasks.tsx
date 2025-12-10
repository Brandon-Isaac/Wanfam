import api from '../utils/Api';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useParams, useNavigate } from 'react-router-dom';

const MyTasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskStatus, setTaskStatus] = useState('');
  const [statusChangeModalOpen, setStatusChangeModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
    const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/workers/tasks`);
      setTasks(response.data.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };
  const handleStatusChange = (taskId: string) => {
    setSelectedTaskId(taskId);
    setStatusChangeModalOpen(true);
  };
    const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await api.put(`/tasks/${taskId}/status`, { status });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };
    useEffect(() => {
    fetchTasks();
  }, []);


  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Tasks</h2>
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task._id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">{task.title}</h3>
            <p className="text-gray-600">{task.description}</p>
            <p className="text-sm text-gray-500">Due Date: {new Date(task.dueDate).toLocaleDateString()}</p>
            <div className="mt-2">
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${task.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {task.status}
              </span>
            </div>
            <div className="mt-4 space-x-2">
              <button onClick={() => handleStatusChange(task._id)} className="px-4 py-2 bg-green-500 text-white rounded-lg">
            Update Status
              </button>
            </div>
          </div>
        ))}
        {statusChangeModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Change Task Status</h3>
              <select
            value={taskStatus}
            onChange={(e) => setTaskStatus(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
              >
            <option value="">Select Status</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
                </select>
            <button
              onClick={() => {
                updateTaskStatus(selectedTaskId, taskStatus);
                setStatusChangeModalOpen(false);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Update Status
            </button>
            <button
              onClick={() => setStatusChangeModalOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
            >
              Cancel
            </button>
              </div>
            </div>
        )}
      <button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg">
        Go to Dashboard
      </button>
    </div>
    </div>
  );
};

export default MyTasks;