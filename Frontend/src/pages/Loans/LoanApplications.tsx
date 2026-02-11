import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/Api";

interface LoanApplication {
  _id: string;
  farmerId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  amount: number;
  purpose: string;
  status: string;
  collateral: string;
  createdAt: string;
}

const LoanApplications = () => {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/loans/requests');
      
      let filteredData = response.data.loanRequests || [];
      if (filter !== 'all') {
        filteredData = (response.data.loanRequests || []).filter(
          (app: LoanApplication) => app.status === filter
        );
      }
      
      setApplications(filteredData);
    } catch (error) {
      console.error('Error fetching loan applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      disbursed: 'bg-blue-100 text-blue-800 border-blue-200',
    };

    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Loan Applications</h1>
              <p className="text-gray-600 mt-1">Review and manage loan applications</p>
            </div>
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-1 inline-flex">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Applications
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending' 
                ? 'bg-yellow-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              filter === 'approved' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              filter === 'rejected' 
                ? 'bg-red-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Rejected
          </button>
        </div>

        {/* Applications Grid */}
        {applications.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {applications.map((application) => (
              <div 
                key={application._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {application.farmerId?.firstName?.charAt(0) || 'U'}
                        {application.farmerId?.lastName?.charAt(0) || ''}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.farmerId?.firstName && application.farmerId?.lastName 
                            ? `${application.farmerId.firstName} ${application.farmerId.lastName}` 
                            : 'Applicant Name N/A'}
                        </h3>
                        <p className="text-sm text-gray-500">{application.farmerId?.email || 'No email'}</p>
                      </div>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <i className="fas fa-dollar-sign text-green-600 mr-2"></i>
                        <span className="text-xs text-gray-500 font-medium">Loan Amount</span>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        KSh {application.amount?.toLocaleString() || 0}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <i className="fas fa-shield-alt text-blue-600 mr-2"></i>
                        <span className="text-xs text-gray-500 font-medium">Collateral</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {application.collateral || 'Not specified'}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <i className="fas fa-calendar text-purple-600 mr-2"></i>
                        <span className="text-xs text-gray-500 font-medium">Applied On</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(application.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-start">
                      <i className="fas fa-comment-alt text-blue-600 mt-1 mr-3"></i>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium mb-1">Purpose</p>
                        <p className="text-sm text-gray-700">
                          {application.purpose || 'No purpose specified'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {application.status === 'pending' && (
                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                      <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                        <i className="fas fa-check mr-2"></i>
                        Approve
                      </button>
                      <button className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                        <i className="fas fa-times mr-2"></i>
                        Reject
                      </button>
                      <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                        <i className="fas fa-eye"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <i className="fas fa-inbox text-gray-300 text-6xl mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Found</h3>
            <p className="text-gray-500">
              {filter === 'pending' && "There are no pending loan applications at the moment."}
              {filter === 'approved' && "No approved loan applications."}
              {filter === 'rejected' && "No rejected loan applications."}
              {filter === 'all' && "No loan applications available."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanApplications;
