import api from "../../utils/Api";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const LoanOfficerDashboard = () => {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/officer-dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching loan officer stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-green-600"></i>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Loan Officer Dashboard</h1>
          <p className="text-gray-600 mt-1">Review loan applications and manage approvals.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Loan Requests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Total Requests</p>
                <p className="text-4xl font-bold text-gray-900">{stats.totalLoanRequests || 0}</p>
                <p className="text-sm text-gray-600 mt-2">All loan applications</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <i className="fas fa-file-alt text-2xl text-blue-600"></i>
              </div>
            </div>
          </div>

          {/* Pending Applications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Pending Applications</p>
                <p className="text-4xl font-bold text-orange-600">{stats.pendingApplications || 0}</p>
                <p className="text-sm text-orange-600 mt-2 flex items-center">
                  <i className="fas fa-clock mr-1"></i>
                  Awaiting review
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <i className="fas fa-hourglass-half text-2xl text-orange-600"></i>
              </div>
            </div>
          </div>

          {/* Approved This Month */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Approved This Month</p>
                <p className="text-4xl font-bold text-green-600">{stats.approvedThisMonth || 0}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {stats.rejectedThisMonth || 0} rejected
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <i className="fas fa-check-circle text-2xl text-green-600"></i>
              </div>
            </div>
          </div>

          {/* Total Loan Value */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Total Loan Value</p>
                <p className="text-4xl font-bold text-purple-600">
                  {stats.totalLoanValue ? `${(stats.totalLoanValue / 1000).toFixed(0)}K` : '0'}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  KSh {stats.totalLoanValue?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <i className="fas fa-money-bill-wave text-2xl text-purple-600"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Pending Applications */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Pending Applications</h2>
                <Link 
                  to="/loan-applications"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="p-6">
                {stats.pendingApplicationsList && stats.pendingApplicationsList.length > 0 ? (
                  <div className="space-y-4">
                    {stats.pendingApplicationsList.map((application: any) => (
                      <div 
                        key={application._id} 
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {application.farmerId?.firstName && application.farmerId?.lastName 
                                ? `${application.farmerId.firstName} ${application.farmerId.lastName}` 
                                : 'Applicant Name N/A'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {application.farmerId?.email || 'No email'}
                            </p>
                          </div>
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-start">
                            <i className="fas fa-dollar-sign text-green-600 mt-1 mr-2 text-sm"></i>
                            <div>
                              <p className="text-xs text-gray-500">Amount Requested</p>
                              <p className="text-sm font-bold text-gray-900">
                                KSh {application.amount?.toLocaleString() || 0}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <i className="fas fa-comment-alt text-blue-600 mt-1 mr-2 text-sm"></i>
                            <div className="flex-1">
                              <p className="text-xs text-gray-500">Purpose</p>
                              <p className="text-sm text-gray-700">
                                {application.purpose || 'No purpose specified'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center text-xs text-gray-500">
                              <i className="fas fa-calendar mr-1"></i>
                              {new Date(application.createdAt).toLocaleDateString()}
                            </div>
                            <Link
                              to={`/loan-applications/${application._id}`}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Review Application →
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <i className="fas fa-inbox text-gray-300 text-4xl mb-3"></i>
                    <p className="text-gray-500">No pending applications</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                <Link
                  to="/loan-applications"
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-all border border-blue-200"
                >
                  <i className="fas fa-clipboard-list text-blue-600 text-xl mb-2"></i>
                  <span className="text-xs font-semibold text-blue-800 text-center">Applications</span>
                </Link>
                <Link
                  to="/approved-loans"
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:shadow-md transition-all border border-green-200"
                >
                  <i className="fas fa-check-double text-green-600 text-xl mb-2"></i>
                  <span className="text-xs font-semibold text-green-800 text-center">Approved</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition-all border border-purple-200"
                >
                  <i className="fas fa-user text-purple-600 text-xl mb-2"></i>
                  <span className="text-xs font-semibold text-purple-800 text-center">Profile</span>
                </Link>
                <Link
                  to="/reports"
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg hover:shadow-md transition-all border border-orange-200"
                >
                  <i className="fas fa-chart-bar text-orange-600 text-xl mb-2"></i>
                  <span className="text-xs font-semibold text-orange-800 text-center">Reports</span>
                </Link>
              </div>
            </div>

            {/* Loan Status Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Loan Status</h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <i className="fas fa-check-circle text-green-600 mr-3"></i>
                    <span className="text-sm font-medium text-gray-900">Approved Loans</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    {stats.approvedLoans || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <i className="fas fa-handshake text-blue-600 mr-3"></i>
                    <span className="text-sm font-medium text-gray-900">Disbursed Loans</span>
                  </div>
                  <span className="text-sm font-bold text-blue-600">
                    {stats.disbursedLoans || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <i className="fas fa-lock text-gray-600 mr-3"></i>
                    <span className="text-sm font-medium text-gray-900">Closed Loans</span>
                  </div>
                  <span className="text-sm font-bold text-gray-600">
                    {stats.closedLoans || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanOfficerDashboard;