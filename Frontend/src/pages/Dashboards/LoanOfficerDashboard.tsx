import api from "../../utils/Api";
import { useState, useEffect } from "react";

const LoanOfficerDashboard = () => {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/loanofficer-dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching loan officer stats:', error);
      }
    };
    fetchStats();
  }, []);
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <i className="fas fa-file-alt text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <i className="fas fa-check-circle text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved This Month</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approvedThisMonth || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <i className="fas fa-times-circle text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected This Month</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejectedThisMonth || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <i className="fas fa-money-bill-wave text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Loan Value</p>
              <p className="text-2xl font-bold text-gray-900">KSh {stats.totalLoanValue || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Applications</h2>
        <div className="space-y-4">
          {stats.pendingApplications > 0 ? (
            <ul>
              {stats.pendingApplicationsList.map((application: { farmerId: string;  amount: number; status: string }, index: number) => (
                <li key={index} className="border-b border-gray-200 pb-3 mb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{application.farmerId}</p>
                      <p className="text-sm text-gray-600">Amount Requested: KSh {application.amount}</p>
                    </div>
                    <div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        application.status === 'approved' ? 'bg-green-100 text-green-800' :
                        application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {application.status}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">No recent applications to display.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanOfficerDashboard;