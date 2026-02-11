import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/Api";

interface OverdueLoan {
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
  };
  approvedAmount: number;
  approvalDate: string;
  disbursementDate: string;
  dueDate?: string;
  daysOverdue?: number;
  outstandingAmount?: number;
  status: string;
}

const LoanReports = () => {
  const [overdueLoans, setOverdueLoans] = useState<OverdueLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDays, setFilterDays] = useState<'all' | '7' | '30' | '90'>('all');

  useEffect(() => {
    fetchOverdueLoans();
  }, [filterDays]);

  const fetchOverdueLoans = async () => {
    try {
      setLoading(true);
      // Fetch all loan requests and filter for approved ones (approved = disbursed)
      const response = await api.get('/loans/requests');
      
      // Filter for approved loans (in this system, approved means disbursed)
      const approvedLoans = (response.data.loanRequests || []).filter((loan: OverdueLoan) => 
        loan.status === 'approved'
      );

      // Add mock overdue calculation
      const loansWithOverdueInfo = approvedLoans.map((loan: OverdueLoan) => {
        const disbursementDate = new Date(loan.disbursementDate || loan.approvalDate);
        const dueDate = new Date(disbursementDate);
        dueDate.setDate(dueDate.getDate() + 90); // Assume 90-day repayment period
        
        const today = new Date();
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          ...loan,
          dueDate: dueDate.toISOString(),
          daysOverdue: Math.max(0, daysOverdue),
          outstandingAmount: loan.approvedAmount * (1 + 0.05) // Mock 5% interest
        };
      }).filter((loan: OverdueLoan) => (loan.daysOverdue || 0) > 0);

      // Filter by days overdue
      let filtered = loansWithOverdueInfo;
      if (filterDays !== 'all') {
        const days = parseInt(filterDays);
        filtered = loansWithOverdueInfo.filter((loan: OverdueLoan) => 
          (loan.daysOverdue || 0) <= days
        );
      }

      setOverdueLoans(filtered);
    } catch (error) {
      console.error('Error fetching overdue loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOverdueSeverity = (days: number) => {
    if (days <= 7) return { color: 'yellow', label: 'Recently Overdue', icon: 'exclamation-circle' };
    if (days <= 30) return { color: 'orange', label: 'Moderately Overdue', icon: 'exclamation-triangle' };
    if (days <= 90) return { color: 'red', label: 'Seriously Overdue', icon: 'exclamation' };
    return { color: 'red', label: 'Critically Overdue', icon: 'times-circle' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-orange-600"></i>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  const totalOverdue = overdueLoans.reduce((sum, loan) => sum + (loan.outstandingAmount || 0), 0);
  const avgDaysOverdue = overdueLoans.length > 0 
    ? Math.round(overdueLoans.reduce((sum, loan) => sum + (loan.daysOverdue || 0), 0) / overdueLoans.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Loan Reports</h1>
              <p className="text-gray-600 mt-1">Overdue loans and repayment tracking</p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
                <i className="fas fa-download mr-2"></i>
                Export Report
              </button>
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Overdue</p>
                <p className="text-3xl font-bold text-red-600">{overdueLoans.length}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <i className="fas fa-exclamation-triangle text-2xl text-red-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Outstanding Amount</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(totalOverdue / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-gray-500 mt-1">KSh {totalOverdue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <i className="fas fa-money-bill-wave text-2xl text-orange-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Avg Days Overdue</p>
                <p className="text-3xl font-bold text-purple-600">{avgDaysOverdue}</p>
                <p className="text-xs text-gray-500 mt-1">days</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <i className="fas fa-calendar-times text-2xl text-purple-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Critical Cases</p>
                <p className="text-3xl font-bold text-red-700">
                  {overdueLoans.filter(loan => (loan.daysOverdue || 0) > 90).length}
                </p>
                <p className="text-xs text-red-700 mt-1">&gt;90 days overdue</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <i className="fas fa-times-circle text-2xl text-red-700"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-1 inline-flex">
          <button
            onClick={() => setFilterDays('all')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              filterDays === 'all' 
                ? 'bg-orange-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Overdue
          </button>
          <button
            onClick={() => setFilterDays('7')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              filterDays === '7' 
                ? 'bg-yellow-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            &lt; 7 Days
          </button>
          <button
            onClick={() => setFilterDays('30')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              filterDays === '30' 
                ? 'bg-orange-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            &lt; 30 Days
          </button>
          <button
            onClick={() => setFilterDays('90')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              filterDays === '90' 
                ? 'bg-red-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            &lt; 90 Days
          </button>
        </div>

        {/* Overdue Loans Grid */}
        {overdueLoans.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {overdueLoans.map((loan) => {
              const severity = getOverdueSeverity(loan.daysOverdue || 0);
              return (
                <div 
                  key={loan._id}
                  className={`bg-white rounded-xl shadow-sm border-2 border-${severity.color}-200 hover:shadow-md transition-all`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-br from-${severity.color}-500 to-${severity.color}-600 rounded-full flex items-center justify-center text-white`}>
                          <i className={`fas fa-${severity.icon} text-xl`}></i>
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
                      <div className="text-right">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full bg-${severity.color}-100 text-${severity.color}-800 border border-${severity.color}-300`}>
                          {loan.daysOverdue} Days Overdue
                        </span>
                        <p className={`text-xs text-${severity.color}-600 mt-2 font-medium`}>
                          {severity.label}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <div className="flex items-center mb-2">
                          <i className="fas fa-exclamation-circle text-red-600 mr-2"></i>
                          <span className="text-xs text-gray-600 font-medium">Outstanding</span>
                        </div>
                        <p className="text-xl font-bold text-red-700">
                          KSh {loan.outstandingAmount?.toLocaleString() || 0}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <i className="fas fa-hand-holding-usd text-green-600 mr-2"></i>
                          <span className="text-xs text-gray-500 font-medium">Original Amount</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          KSh {loan.approvedAmount?.toLocaleString() || 0}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <i className="fas fa-calendar-check text-blue-600 mr-2"></i>
                          <span className="text-xs text-gray-500 font-medium">Due Date</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {loan.dueDate 
                            ? new Date(loan.dueDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : 'N/A'}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <i className="fas fa-handshake text-purple-600 mr-2"></i>
                          <span className="text-xs text-gray-500 font-medium">Disbursed</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(loan.disbursementDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {loan.loanRequestId?.purpose && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start">
                          <i className="fas fa-comment-alt text-blue-600 mt-1 mr-3"></i>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-medium mb-1">Loan Purpose</p>
                            <p className="text-sm text-gray-700">
                              {loan.loanRequestId.purpose}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                      <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                        <i className="fas fa-phone mr-2"></i>
                        Contact Borrower
                      </button>
                      <button className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                        <i className="fas fa-money-check-alt mr-2"></i>
                        Record Payment
                      </button>
                      <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                        <i className="fas fa-gavel"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <i className="fas fa-check-circle text-green-500 text-6xl mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Overdue Loans</h3>
            <p className="text-gray-500">
              All loans are up to date with their repayment schedules.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanReports;
