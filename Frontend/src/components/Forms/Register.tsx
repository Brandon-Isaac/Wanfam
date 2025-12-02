import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    farmName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'farmer',
    licenseNumber: '', // For veterinary
    specialization: '', // For veterinary
    employeeId: '', // For worker and loan officer
    department: '', // For worker and loan officer
    bankName: '', // For loan officer
    branch: '' // For loan officer
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (role: string) => {
    setUserData({
      ...userData,
      role,
      // Reset role-specific fields when changing role
      farmName: role === 'farmer' ? userData.farmName : '',
      licenseNumber: '',
      specialization: '',
      employeeId: '',
      department: '',
      bankName: '',
      branch: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (userData.password !== userData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const { confirmPassword, ...registrationData } = userData;
    const result = await register(registrationData);
    
   if (result.success) {
      // Redirect based on role
      const notification=`Registration successful! Please log in as a ${userData.role.replace('_', ' ')}.`;
      alert(notification);
      let redirectPath;
      switch (userData.role) {
        case 'farmer':
          redirectPath = '/login';
          break;
        case 'admin':
          redirectPath = '/login';
          break;
        default:
          redirectPath = '/login';
      }
      navigate(redirectPath);
    } else {
      setError(result.message || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  const renderRoleSpecificFields = () => {
    switch (userData.role) {
      case 'farmer':
        return (
          <>
          </>
        );

      case 'veterinary':
        return (
          <>
            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                License Number *
              </label>
              <input
                id="licenseNumber"
                name="licenseNumber"
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Veterinary license number"
                value={userData.licenseNumber}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <select
                id="specialization"
                name="specialization"
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                value={userData.specialization}
                onChange={handleChange}
              >
                <option value="">Select specialization</option>
                <option value="general">General Practice</option>
                <option value="dairy">Dairy Cattle</option>
                <option value="poultry">Poultry</option>
                <option value="small_animals">Small Animals</option>
                <option value="surgery">Surgery</option>
              </select>
            </div>
          </>
        );

      case 'worker':
        return (
          <>
            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID *
              </label>
              <input
                id="employeeId"
                name="employeeId"
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Employee identification number"
                value={userData.employeeId}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <select
                id="department"
                name="department"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                value={userData.department}
                onChange={handleChange}
              >
                <option value="">Select department</option>
                <option value="feeding">Feeding</option>
                <option value="milking">Milking</option>
                <option value="health">Health Care</option>
                <option value="cleaning">Cleaning</option>
                <option value="general">General Farm Work</option>
              </select>
            </div>
          </>
        );

      case 'loan_officer':
        return (
          <>
            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID *
              </label>
              <input
                id="employeeId"
                name="employeeId"
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Employee identification number"
                value={userData.employeeId}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name *
              </label>
              <input
                id="bankName"
                name="bankName"
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Name of your bank"
                value={userData.bankName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">
                Branch *
              </label>
              <input
                id="branch"
                name="branch"
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Branch location"
                value={userData.branch}
                onChange={handleChange}
              />
            </div>
          </>
        );

      case 'admin':
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              Admin accounts require special authorization. Please contact system administrator for access.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <i className="fas fa-cow text-green-600 text-4xl"></i>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join WANFAM as a {userData.role.replace('_', ' ')}
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-1">
          <div className="flex space-x-1 flex-wrap">
            {['farmer', 'veterinary', 'worker', 'loan_officer', 'admin'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleChange(role)}
                className={`flex-1 min-w-[120px] py-2 text-sm font-medium rounded-md transition-colors ${
                  userData.role === role
                    ? 'bg-green-600 text-white shadow'
                    : 'text-gray-600 hover:text-green-700'
                }`}
              >
                {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="First name"
                value={userData.firstName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Last name"
                value={userData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Email address"
                value={userData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="+254 XXX XXX XXX"
                value={userData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Role-specific Fields */}
          {renderRoleSpecificFields()}

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Minimum 6 characters"
                value={userData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Confirm your password"
                value={userData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || userData.role === 'admin'}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : `Create ${userData.role.replace('_', ' ')} account`}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-green-600 hover:text-green-500"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;