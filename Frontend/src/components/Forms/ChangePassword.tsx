import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/Api';

const ChangePassword = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/auth/change-password`, {
                currentPassword,
                newPassword
            });
            navigate(`/profile`);
        } catch (error: any) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <h2 className="text-2xl font-bold mb-6">Change Password</h2>
            <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
                <label className="block mb-4">
                    <span className="text-gray-700">Current Password</span>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        required
                    />
                </label>
                <label className="block mb-4">
                    <span className="text-gray-700">New Password</span>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        required
                    />
                </label>
                <label className="block mb-4">
                    <span className="text-gray-700">Confirm New Password</span>
                    <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        required
                    />
                </label>
                {newPassword !== confirmNewPassword && (
                    <p className="text-red-600 text-sm mt-1">Passwords do not match</p>
                )}
                <button type="submit" disabled={loading} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    {loading ? 'Changing...' : 'Change Password'}
                </button>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mt-4 ml-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                    Cancel
                </button>
                {error && <p className="mt-4 text-red-600">{error.message}</p>}
            </form>
        </div>
    );
};

export default ChangePassword;