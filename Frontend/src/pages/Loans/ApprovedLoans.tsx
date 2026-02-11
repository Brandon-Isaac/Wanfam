import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/Api";

interface ApprovedLoan {
  _id: string;
  farmerId: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  };
  loanRequestId: {
    amount: number;
    purpose: string;
    collateral: string;
  };
  approvedAmount: number;
  approvalDate: string;
  status: string;
  disbursementDate?: string;
  repaymentSchedule?: any;
}

const ApprovedLoans = () => {
  const [approvedLoans, setApprovedLoans] = useState<ApprovedLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'disbursed' | 'completed'>('all');

  useEffect(() => {
    fetchApprovedLoans();
  }, [filter]);

  const fetchApprovedLoans = async () => {
    try {
      setLoading(true);
      // Fetch from loan requests endpoint and filter for approved loans
      const response = await api.get('/loans/requests');
      
      // Filter for approved requests only
      const approved = response.data.loanRequests.filter(
        (req: any) => req.status === 'approved'
      );
      
      // Apply status filter
      let filteredData = approved;
      if (filter !== 'all') {
        filteredData = approved.filter((loan: ApprovedLoan) => loan.status === filter);
      }
      
      setApprovedLoans(filteredData);
    } catch (error) {
      console.error('Error fetching approved loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      disbursed: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      defaulted: 'bg-red-100 text-red-800 border-red-200',
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
          <i className="fas fa-spinner fa-spin text-4xl text-green-600"></i>
          <p className="mt-4 text-gray-600">Loading approved loans...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Approved Loans</h1>
              <p className="text-gray-600 mt-1">Manage approved and disbursed loans</p>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Approved</p>
                <p className="text-3xl font-bold text-green-600">{approvedLoans.length}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <i className="fas fa-check-circle text-2xl text-green-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Disbursed</p>
                <p className="text-3xl font-bold text-blue-600">
                  {approvedLoans.filter(loan => loan.status === 'disbursed').length}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <i className="fas fa-handshake text-2xl text-blue-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Pending Disbursement</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {approvedLoans.filter(loan => loan.status === 'pending').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <i className="fas fa-clock text-2xl text-yellow-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(approvedLoans.reduce((sum, loan) => sum + (loan.approvedAmount || 0), 0) / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <i className="fas fa-money-bill-wave text-2xl text-purple-600"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-1 inline-flex">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Approved
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending' 
                ? 'bg-yellow-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Pending Disbursement
          </button>
          <button
            onClick={() => setFilter('disbursed')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              filter === 'disbursed' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Disbursed
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              filter === 'completed' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Approved Loans Grid */}
        {approvedLoans.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {approvedLoans.map((loan) => (
              <div 
                key={loan._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {loan.farmerId?.firstName?.charAt(0) || 'U'}
                        {loan.farmerId?.lastName?.charAt(0) || ''}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {loan.farmerId?.firstName && loan.farmerId?.lastName 
                            ? `${loan.farmerId.firstName} ${loan.farmerId.lastName}` 
                            : 'Borrower Name N/A'}
                        </h3>
                        <p className="text-sm text-gray-500">{loan.farmerId?.email || 'No email'}</p>
                        {loan.farmerId?.phoneNumber && (
                          <p className="text-xs text-gray-400 mt-1">
                            <i className="fas fa-phone mr-1"></i>
                            {loan.farmerId.phoneNumber}
                          </p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(loan.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center mb-2">
                        <i className="fas fa-check-circle text-green-600 mr-2"></i>
                        <span className="text-xs text-gray-600 font-medium">Approved Amount</span>
                      </div>
                      <p className="text-xl font-bold text-green-700">
                        KSh {loan.approvedAmount?.toLocaleString() || 0}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <i className="fas fa-calendar-check text-blue-600 mr-2"></i>
                        <span className="text-xs text-gray-500 font-medium">Approval Date</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(loan.approvalDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    {loan.disbursementDate && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center mb-2">
                          <i className="fas fa-handshake text-blue-600 mr-2"></i>
                          <span className="text-xs text-gray-600 font-medium">Disbursed On</span>
                        </div>
                        <p className="text-sm font-semibold text-blue-700">
                          {new Date(loan.disbursementDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <i className="fas fa-comment-alt text-purple-600 mr-2"></i>
                        <span className="text-xs text-gray-500 font-medium">Purpose</span>
                      </div>
                      <p className="text-xs font-semibold text-gray-900 line-clamp-2">
                        {loan.loanRequestId?.purpose || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  {loan.loanRequestId?.collateral && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start">
                        <i className="fas fa-shield-alt text-blue-600 mt-1 mr-3"></i>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium mb-1">Collateral</p>
                          <p className="text-sm text-gray-700">
                            {loan.loanRequestId.collateral}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {loan.status === 'pending' && (
                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                      <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                        <i className="fas fa-dollar-sign mr-2"></i>
                        Disburse Loan
                      </button>
                      <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                        <i className="fas fa-eye"></i>
                      </button>
                    </div>
                  )}

                  {loan.status === 'disbursed' && (
                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                      <button className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                        <i className="fas fa-calendar-alt mr-2"></i>
                        View Repayment Schedule
                      </button>
                      <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                        <i className="fas fa-file-pdf"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <i className="fas fa-check-double text-gray-300 text-6xl mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Approved Loans Found</h3>
            <p className="text-gray-500">
              {filter === 'pending' && "There are no loans pending disbursement."}
              {filter === 'disbursed' && "No disbursed loans at the moment."}
              {filter === 'completed' && "No completed loans."}
              {filter === 'all' && "No approved loans available."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovedLoans;
