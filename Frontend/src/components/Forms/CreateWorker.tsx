import React, {useState, useEffect} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFarm } from '../../contexts/FarmContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/Api';

const CreateWorker = () => {
    const { farmId } = useParams<{ farmId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [wages, setWages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post(`/workers/${farmId}`, {
                firstName,
                lastName,
                email,
                phone,
                wages
            });
            navigate(`/farms/${farmId}/workers`);
        } catch (error: any) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <h2 className="text-2xl font-bold mb-6">Create Worker</h2>
            <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
                <label className="block mb-4">
                    <span className="text-gray-700">First Name</span>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        required
                    />
                </label>
                <label className="block mb-4">
                    <span className="text-gray-700">Last Name</span>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        required
                    />
                </label>
                <label className="block mb-4">
                    <span className="text-gray-700">Email</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        required
                    />
                </label>
                <label className="block mb-4">
                    <span className="text-gray-700">Phone</span>
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        required
                    />
                </label>
                <label className="block mb-4">
                    <span className="text-gray-700">Wages</span>
                    <input
                        type="number"
                        value={wages}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWages(Number(e.target.value))}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        required
                    />
                </label>
                <button type="submit" disabled={loading} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    {loading ? 'Creating...' : 'Create Worker'}
                </button>
                {error && <p className="mt-4 text-red-600">{error.message}</p>}
            </form>
        </div>
    );
};

export default CreateWorker;
