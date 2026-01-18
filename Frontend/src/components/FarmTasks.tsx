import api from "../utils/Api";
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const FarmTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { farmId } = useParams();
    const navigate = useNavigate();


    type Task = {
        _id: string;
        title: string;
        description: string;
        assignedTo: string[];
        dueDate: string;
        priority: string;
        status: string;
        taskCategory: string;
    };

    const fetchTasks = async () => {
        try {
            const response = await api.get(`/tasks/${farmId}`);
            setTasks(response.data.data);
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        } finally {
            setLoading(false);
        }
    };
    const handleDeleteTask = async (taskId: string | undefined) => {
        if (!taskId) {
        console.log("Deleting task with ID:", taskId);
        }
        try {
            await api.delete(`/tasks/${farmId}/task/${taskId}`);
            setTasks(tasks.filter((task: Task) => task._id !== taskId));
            setShowDeleteModal(false);
        } catch (error) {
            setShowDeleteModal(false)
            alert("Failed to delete task. Please try again.");
            console.error("Failed to delete task:", error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

if (loading) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        );
    }
if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-600">Error: {error}</p>
            </div>
        );
  }

    return (
        <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <i className="fas fa-tasks fa-2x text-green-600 mb-2"></i>
                        <h3 className="text-lg font-semibold mb-2">Total Tasks</h3>
                        <p className="text-2xl font-bold">{tasks.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <i className="fas fa-check-circle fa-2x text-green-600 mb-2"></i>
                        <h3 className="text-lg font-semibold mb-2">Completed Tasks</h3>
                        <p className="text-2xl font-bold">{tasks.filter((task: Task) => task.status === "Completed").length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <i className="fas fa-hourglass-half fa-2x text-yellow-600 mb-2"></i>
                        <h3 className="text-lg font-semibold mb-2">Pending Tasks</h3>
                        <p className="text-2xl font-bold">{tasks.filter((task: Task) => task.status === "Pending").length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <i className="fas fa-spinner fa-2x text-blue-600 mb-2"></i>
                        <h3 className="text-lg font-semibold mb-2">In Progress Tasks</h3>
                        <p className="text-2xl font-bold">{tasks.filter((task: Task) => task.status === "In Progress").length}</p>
                    </div>
                </div>
                <Link to={`/farms/${farmId}/tasks/add`} className="text-green-600 hover:text-green-700 mt-2 flex mr-2">+ Add Tasks</Link>
            <div className="max-w-7xl mx-auto p-4">
                <h2 className="text-2xl font-semibold mb-4">Farm Tasks</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasks.map((task: Task) => (
                        <div key={task._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                    task.priority === 'High' ? 'bg-red-100 text-red-800' :
                                    task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                    {task.priority}
                                </span>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
                            
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center text-sm text-gray-500">
                                    <i className="fas fa-calendar-alt mr-2"></i>
                                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <i className="fas fa-tag mr-2"></i>
                                    <span>{task.taskCategory}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <i className="fas fa-circle mr-2" style={{
                                        color: task.status === 'Completed' ? '#10b981' :
                                               task.status === 'In Progress' ? '#3b82f6' :
                                               '#eab308'
                                    }}></i>
                                    <span>{task.status}</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 pt-4 border-t">
                                <button 
                                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm"
                                    onClick={() => { navigate(`/farms/${farmId}/tasks/${task._id}`); }}
                                >
                                    <i className="fas fa-eye mr-1"></i> View
                                </button>
                                <button 
                                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm"
                                    onClick={() => { navigate(`/farms/${farmId}/tasks/${task._id}/edit`) }}
                                >
                                    <i className="fas fa-edit mr-1"></i> Edit
                                </button>
                                <button 
                                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 text-sm"
                                    onClick={() => {
                                        setSelectedTask(task._id);
                                        console.log(task._id)
                                        setShowDeleteModal(true);
                                    }}
                                >
                                    <i className="fas fa-trash mr-1"></i> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                {tasks.length === 0 && (
                    <div className="text-center py-12">
                        <i className="fas fa-tasks fa-4x text-gray-300 mb-4"></i>
                        <p className="text-gray-500 text-lg">No tasks found</p>
                    </div>
                )}
                
                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                            <p className="text-gray-600 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
                            <div className="flex gap-4">
                                <button 
                                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedTask(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                    onClick={() => handleDeleteTask(selectedTask || undefined)
                                    }
                                    
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </div>
    );
}
export default FarmTasks;