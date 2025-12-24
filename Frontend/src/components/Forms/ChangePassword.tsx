import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/Api';
import { validatePassword, getPasswordStrengthMessage, getPasswordStrengthColor } from '../../utils/passwordValidation';

const ChangePassword = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [passwordValidation, setPasswordValidation] = useState<{ isValid: boolean; errors: string[]; strength: 'weak' | 'medium' | 'strong' }>({ 
        isValid: false, 
        errors: [], 
        strength: 'weak' 
    });
    const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleNewPasswordChange = (value: string) => {
        setNewPassword(value);
        const validation = validatePassword(value);
        setPasswordValidation(validation);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validate password strength
        const validation = validatePassword(newPassword);
        if (!validation.isValid) {
            setError(new Error(validation.errors.join('. ')));
            setLoading(false);
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError(new Error('Passwords do not match'));
            setLoading(false);
            return;
        }

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
                    <div className="relative">
                        <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 px-3 py-2 pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                        >
                            <i className={`fas ${showCurrentPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                    </div>
                </label>
                <label className="block mb-2">
                    <span className="text-gray-700">New Password</span>
                    <div className="relative">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => handleNewPasswordChange(e.target.value)}
                            onFocus={() => setShowPasswordRequirements(true)}
                            onBlur={() => setShowPasswordRequirements(false)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 px-3 py-2 pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                        >
                            <i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {newPassword && (
                        <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-medium ${getPasswordStrengthColor(passwordValidation.strength)}`}>
                                    {getPasswordStrengthMessage(passwordValidation.strength)}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                        passwordValidation.strength === 'strong'
                                            ? 'bg-green-600 w-full'
                                            : passwordValidation.strength === 'medium'
                                            ? 'bg-yellow-600 w-2/3'
                                            : 'bg-red-600 w-1/3'
                                    }`}
                                />
                            </div>
                        </div>
                    )}
                    
                    {/* Password Requirements */}
                    {(showPasswordRequirements || passwordValidation.errors.length > 0) && newPassword && (
                        <div className="mt-2 text-xs space-y-1">
                            <p className="font-medium text-gray-700">Password must contain:</p>
                            <ul className="space-y-1">
                                <li className={newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                                    {newPassword.length >= 8 ? '✓' : '○'} At least 8 characters
                                </li>
                                <li className={/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}>
                                    {/[A-Z]/.test(newPassword) ? '✓' : '○'} One uppercase letter
                                </li>
                                <li className={/[a-z]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}>
                                    {/[a-z]/.test(newPassword) ? '✓' : '○'} One lowercase letter
                                </li>
                                <li className={/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}>
                                    {/[0-9]/.test(newPassword) ? '✓' : '○'} One number
                                </li>
                                <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}>
                                    {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? '✓' : '○'} One special character
                                </li>
                            </ul>
                        </div>
                    )}
                </label>
                <label className="block mb-4">
                    <span className="text-gray-700">Confirm New Password</span>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 px-3 py-2 pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                        >
                            <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                    </div>
                    {confirmNewPassword && newPassword !== confirmNewPassword && (
                        <p className="text-red-600 text-xs mt-1">Passwords do not match</p>
                    )}
                    {confirmNewPassword && newPassword === confirmNewPassword && confirmNewPassword.length > 0 && (
                        <p className="text-green-600 text-xs mt-1">✓ Passwords match</p>
                    )}
                </label>
                <button 
                    type="submit" 
                    disabled={loading || !passwordValidation.isValid || newPassword !== confirmNewPassword} 
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
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