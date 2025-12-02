import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/Api';

const DismissWorker = () => {
    const { user } = useAuth();
    const { farmId } = useParams<{ farmId: string }>();
    const { workerId } = useParams<{ workerId: string }>();
    const navigate = useNavigate();
    const [workers, setWorkers] = useState([]);
    const [selectedWorkerId, setSelectedWorkerId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
        fetchEmployedWorkers();
    }, []);

    const fetchEmployedWorkers = async () => {
        try {
            const response = await api.get(`/workers/available`);
            setWorkers(response.data.data);
        } catch (error: any) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };
    type Worker = {
        _id: string;
        firstName: string;
        lastName: string;
    };

    const handleDismissWorker = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.put(`/workers/${farmId}/${selectedWorkerId}/dismiss`);
            navigate(`/farms/${farmId}/workers`, { replace: true, state: { refresh: true } });
        } catch (error: any) {
            console.error('Error dismissing worker:', error.response?.data || error.message);
            setError(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <h2 className="text-2xl font-bold mb-6">Dismiss Worker</h2>
            <form onSubmit={handleDismissWorker} className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
                <label className="block mb-4">
                    <span className="text-gray-700">Select Worker to Dismiss</span>
                    <select
                        value={selectedWorkerId}
                        onChange={(e) => setSelectedWorkerId(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 h-10 w-full"
                    >
                        <option value=""> Select a Worker </option>
                        {workers.map((worker: Worker) => (
                            <option key={worker._id} value={worker._id}>
                                {worker.firstName}
                            </option>
                        ))}
                    </select>
                </label>
                <button type="submit" disabled={submitting} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                    {submitting ? 'Dismissing...' : 'Dismiss Worker'}
                </button>
            </form>
        </div>
    );
};

export default DismissWorker;