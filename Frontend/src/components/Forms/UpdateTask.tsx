import api from '../../utils/Api';
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const UpdateTask = () => {
    const { farmId, taskId } = useParams();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assignedTo, setAssignedTo] = useState<string[]>([]);
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [status, setStatus] = useState("Pending");
    const [taskCategory, setTaskCategory] = useState("Feeding");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [workers, getWorkers] = useState<Array<{_id: string; firstName: string; lastName: string}>>([]);
    const [formDataLoaded, setFormDataLoaded] = useState(true);

    const fetchWorkers = async () => {
        try {
            const response = await api.get(`/workers/${farmId}`);
            getWorkers(response.data.data);
        } catch (error) {
            setError("Failed to fetch workers.");
        }
    };
    const fetchTaskDetails = async () => {
        try {
            const response = await api.get(`/tasks/${farmId}/task/${taskId}`);
            const task = response.data.data;
            setTitle(task.title);
            setDescription(task.description);
            setAssignedTo(task.assignedTo.map((worker: {_id: string}) => worker._id));
            setDueDate(task.dueDate.split('T')[0]);
            setPriority(task.priority); 
            setStatus(task.status);
            setTaskCategory(task.taskCategory);
            setFormDataLoaded(true);
        } catch (error) {
            setError("Failed to fetch task details.");
        }
    };

    useEffect(() => {
        fetchWorkers();
        fetchTaskDetails();
    }, [farmId, taskId]);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            const response = await api.put(`/tasks/${farmId}/task/${taskId}`, {
                title,
                description,
                assignedTo,
                taskCategory,
                dueDate,
                priority,
                status,
            });
            setSuccess("Task updated successfully!");
            navigate(`/${farmId}/tasks/${taskId}`);
        }
        catch (err) {
            setError("Failed to update task. Please try again.");
        }
        setLoading(false);
    };

    if (!formDataLoaded) {
        return <div>Loading...</div>;
    }
    return (
        <div className="max-w-3xl mx-auto p-4 bg-white shadow-md rounded">
            <h2 className="text-2xl font-semibold mb-4">Update Task</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {success && <p className="text-green-500 mb-4">{success}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Assign To</label>
                    <div className="w-full border border-gray-300 p-2 rounded max-h-32 overflow-y-auto">
                        {workers.map((worker) => (
                            <label key={worker._id} className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    value={worker._id}
                                    checked={assignedTo.includes(worker._id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setAssignedTo([...assignedTo, worker._id]);
                                        } else {
                                            setAssignedTo(assignedTo.filter(id => id !== worker._id));
                                        }
                                    }}
                                    className="mr-2"
                                />
                                {worker.firstName} {worker.lastName}
                            </label>
                        ))}
                    </div>
                    </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Due Date</label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Priority</label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Task Category</label>
                    <select
                        value={taskCategory}
                        onChange={(e) => setTaskCategory(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    >
                        <option value="Feeding">Feeding</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Medical">Medical</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Update Task
                </button>
                <button
                    type="button"
                    className="bg-red-500 text-white px-4 py-2 rounded ml-2"
                    onClick={() => navigate(-1)}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
};

export default UpdateTask;