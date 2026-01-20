import api from "../../utils/Api";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const AddTask= () => {
    const { farmId } = useParams();
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

    const fetchWorkers = async () => {
        try {
            const response = await api.get(`/workers/${farmId}`);
            getWorkers(response.data.data);
        } catch (error) {
            setError("Failed to fetch workers.");
        }
    };

    useEffect(() => {
        fetchWorkers();
    }, [farmId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            const response = await api.post(`/tasks/${farmId}`, {
                title,
                description,
                assignedTo,
                taskCategory,
                dueDate,
                priority,
                status,
            });
            setSuccess("Task added successfully!");
            setTitle("");
            setDescription("");
            setAssignedTo([]);
            setDueDate("");
            setPriority("Medium");
            setStatus("Pending");
            setTaskCategory("Feeding");
        } catch (err) {
            setError("Failed to add task. Please try again.");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h2 className="text-2xl font-semibold mb-4">Add New Task</h2>
            {error && <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{error}</div>}
            {success && <div className="mb-4 p-2 bg-green-200 text-green-800 rounded">{success}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Task Category</label>
                    <select
                        value={taskCategory}
                        onChange={(e) => setTaskCategory(e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded"
                        required
                    >
                        <option value="Feeding">Feeding</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Medical">Medical</option>
                        <option value="Other">Other</option>
                    </select>
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
                    <div>
                        <label className="block mb-1 font-medium">Due Date</label>
                        <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Priority</label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded"
                        required
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                    </select>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded"
                        required
                    >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                </div>
                <div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded"
                        onClick={() => navigate(`/farms/${farmId}/tasks`)}
                    >
                        Add Task
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddTask;