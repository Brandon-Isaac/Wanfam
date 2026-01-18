import api from "../utils/Api";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const TaskView = () => {
    const { farmId } = useParams();
    const {taskId} = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState<{_id: string; title: string; description: string; assignedTo: {firstName: string; lastName: string}; dueDate: string; priority: string; status: string; taskCategory: string} | null>(null);

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const response = await api.get(`/tasks/${farmId}/task/${taskId}`);
                setTask(response.data.data);
            } catch (error) {
                console.error("Failed to fetch task:", error);
            }
        };

        fetchTask();
    }, [farmId, taskId]);

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h2 className="text-2xl font-semibold mb-4">Task Details</h2>
            {task && (
                <div key={task._id} className="bg-white shadow-md rounded p-6">
                    <h3 className="text-xl font-bold mb-2">{task.title}</h3>
                    <p className="mb-4">{task.description}</p>
                    <p><strong>Category:</strong> {task.taskCategory}</p>
                    <p><strong>Assigned To:</strong> {Array.isArray(task.assignedTo) 
                        ? task.assignedTo.map(person => `${person.firstName} ${person.lastName}`).join(' , ')
                        : `${task.assignedTo.firstName} ${task.assignedTo.lastName}`}
                    </p>
                    <p><strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>
                    <p><strong>Priority:</strong> {task.priority}</p>
                    <p><strong>Status:</strong> {task.status}</p>

                </div>
            )}
            <div className="flex space-x-4">
            <button className="mt-4 bg-yellow-500 text-white py-2 px-4 rounded mr-2" onClick={() => navigate(`/farms/${farmId}/tasks/${taskId}/edit`)}>Edit Task</button>
            <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded" onClick={() => navigate(`/farms/${farmId}/tasks`)}>Go Back</button>
            </div>
        </div>
    );
};

export default TaskView;