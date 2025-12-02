import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/Api';

const EmployWorker = () => {
    const { user } = useAuth();
    const { farmId } = useParams<{ farmId: string }>();
    const navigate = useNavigate();
    const [workers, setWorkers] = useState([]);
    const [selectedWorkerId, setSelectedWorkerId] = useState('');
    const [wages, setWages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [submitting, setSubmitting] = useState(false);

    type Worker = {
        _id: string;
        firstName: string;
        lastName: string;
        wages: number;
    };

    useEffect(() => {
        fetchAvailableWorkers();
    }, []);

    const fetchAvailableWorkers = async () => {
        try {
            const response = await api.get(`/workers/available`);
            setWorkers(response.data.data);
        } catch (error: any) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };
    const handleEmployWorker = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await api.post(`/workers/${farmId}/employ`, {
                workerId: selectedWorkerId,
                wages,
            });
            console.log('Worker employed successfully', response.data);
            // Force a page refresh or pass state to ensure workers list updates
            navigate(`/farms/${farmId}/workers`, { replace: true, state: { refresh: true } });
        } catch (error: any) {
            console.error('Error employing worker:', error.response?.data || error.message);
            setError(error);
        } finally {
            setSubmitting(false);
        }
    };
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                    <p className="text-gray-600">{error.message}</p>
                    <button onClick={() => setError(null)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <h2 className="text-2xl font-bold mb-6">Employ Worker</h2>
            <form onSubmit={handleEmployWorker} className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
                <label className="block mb-4">
                    <span className="text-gray-700">Select Worker to Employ</span>
                    <select
                        value={selectedWorkerId}
                        onChange={(e) => setSelectedWorkerId(e.target.value) }
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
                <label className="block mb-4">
                    <span className="text-gray-700">Wages</span>
                    <input
                        type="number"
                        value={wages}
                        onChange={(e) => setWages(Number(e.target.value))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 h-10 w-full"
                    />
                </label>
                <button type="submit" disabled={submitting} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    {submitting ? 'Employing...' : 'Employ Worker'}
                </button>
            </form>
        </div>
    );
};

export default EmployWorker;