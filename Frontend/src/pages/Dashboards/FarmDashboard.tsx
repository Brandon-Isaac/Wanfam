import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../utils/Api';
import FarmBanner from '../../components/FarmBanner';
import LoanRequestForm from '../../components/Forms/LoanRequestForm';

const FarmDashboard = () => {
  const { farmId } = useParams();
  const [stats, setStats] = useState({} as any);
  const [farmWorkers, setFarmWorkers] = useState<any[]>([]);
  const [pendingSchedulesCount, setPendingSchedulesCount] = useState(0);
  const [showLoanForm, setShowLoanForm] = useState(false);

  const fetchFarmWorkers = async () => {
    try {
      const workersResponse = await api.get(`/workers/${farmId}`);
      setFarmWorkers(workersResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching farm workers:', error);
    }
  };

  const fetchPendingSchedules = async () => {
    try {
      const response = await api.get(`/feed-schedule/${farmId}`);
      setPendingSchedulesCount(response.data.data?.length || 0);
    } catch (error) {
      console.error('Error fetching pending schedules:', error);
    }
  };

  useEffect(() => {
    const fetchFarmStats = async () => {
      try {
        const response = await api.get(`/dashboard/farmer-dashboard/${farmId}`);
        setStats(response.data);
        fetchFarmWorkers();
        fetchPendingSchedules();
      } catch (error) {
        console.error('Error fetching farm stats:', error);
      }
    };

    fetchFarmStats();
  }, [farmId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <FarmBanner userRole="farmer" farmDetails={stats} />
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Large Metric Cards */}
          <Link
            to={`/${farmId}/livestock`}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-green-400 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Total Animals</p>
                <p className="text-4xl font-bold text-gray-900">{stats.totalAnimals?.toLocaleString() || 0}</p>
                <p className="text-sm text-green-600 mt-2 flex items-center">
                  <i className="fas fa-arrow-up mr-1"></i>
                  {stats.healthyLivestock || 0} healthy
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <i className="fas fa-cow text-2xl text-green-600"></i>
              </div>
            </div>
          </Link>

          <Link
            to={`/farms/${farmId}/feed-schedules`}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-orange-400 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Pending Feeds</p>
                <p className="text-4xl font-bold text-gray-900">{pendingSchedulesCount}</p>
                <p className="text-sm text-orange-600 mt-2 flex items-center">
                  <i className="fas fa-calendar-check mr-1"></i>
                  for today
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <i className="fas fa-utensils text-2xl text-orange-600"></i>
              </div>
            </div>
          </Link>

          <Link
            to="/revenue"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-blue-400 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Revenue (30 days)</p>
                <p className="text-4xl font-bold text-gray-900">
                  {stats.totalRevenue !== undefined ? `${(stats.totalRevenue / 1000).toFixed(1)}K` : '0'}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  KES {stats.totalRevenue?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <i className="fas fa-chart-line text-2xl text-blue-600"></i>
              </div>
            </div>
          </Link>

          <Link
            to="/financial-overview"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-green-400 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Net Profit (30 days)</p>
                <p className={`text-4xl font-bold ${(stats.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.netProfit !== undefined ? `${(stats.netProfit / 1000).toFixed(1)}K` : '0'}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  KES {stats.netProfit?.toLocaleString() || 0}
                </p>
              </div>
              <div className={`p-3 ${(stats.netProfit || 0) >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-lg`}>
                <i className={`fas fa-coins text-2xl ${(stats.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}></i>
              </div>
            </div>
          </Link>
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            to={`/${farmId}/tasks`}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all hover:border-blue-400 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending Tasks</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingTasks || 0}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <i className="fas fa-tasks text-blue-600"></i>
              </div>
            </div>
          </Link>

          <Link
            to={`/${farmId}/sick-animals`}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all hover:border-red-400 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Health Alerts</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.sickAnimals || 0}</p>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <i className="fas fa-exclamation-triangle text-red-600"></i>
              </div>
            </div>
          </Link>

          <Link
            to="/treatment-schedules"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all hover:border-yellow-400 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Checkups</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.upcomingCheckupsCount || 0}</p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <i className="fas fa-calendar-alt text-yellow-600"></i>
              </div>
            </div>
          </Link>

          <Link
            to="/expenses"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all hover:border-purple-400 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expenses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalExpenses !== undefined ? `${(stats.totalExpenses / 1000).toFixed(0)}K` : '0'}
                </p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <i className="fas fa-receipt text-purple-600"></i>
              </div>
            </div>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">

            {/* Animal Status Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Animal Health Status</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <i className="fas fa-check-circle text-green-600"></i>
                      <span className="text-sm font-medium text-gray-700">Healthy</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">{stats.healthyLivestock || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-3">
                      <i className="fas fa-heartbeat text-red-600"></i>
                      <span className="text-sm font-medium text-gray-700">Sick</span>
                    </div>
                    <span className="text-sm font-bold text-red-600">{stats.sickAnimals || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scheduled Checkups */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Checkups</h2>
                <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {stats.upcomingCheckupsCount || 0}
                </span>
              </div>
              <div className="p-6">
                {stats.upcomingCheckups && stats.upcomingCheckups.length > 0 ? (
                  <div className="space-y-3">
                    {stats.upcomingCheckups.slice(0, 5).map((checkup: any, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-yellow-300 transition-colors">
                        <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <i className={`fas ${checkup.type === 'vaccination' ? 'fa-syringe' : 'fa-stethoscope'} text-yellow-600`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {checkup.animalId?.name || 'Animal'}
                          </p>
                          <p className="text-xs text-gray-600 capitalize">
                            {checkup.vaccineName || checkup.treatmentType || 'Checkup'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <i className="fas fa-calendar text-yellow-600"></i>
                            {new Date(checkup.scheduledDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            checkup.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {checkup.status || 'Scheduled'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-calendar-check text-gray-300 text-3xl mb-2"></i>
                    <p className="text-sm text-gray-500">No upcoming checkups scheduled</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                <Link
                  to={`/${farmId}/livestock`}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:shadow-md transition-all border border-green-200"
                >
                  <i className="fas fa-paw text-green-600 text-xl mb-2"></i>
                  <span className="text-xs font-semibold text-green-800 text-center">Animals</span>
                </Link>
                <Link
                  to={`/${farmId}/tasks`}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-all border border-blue-200"
                >
                  <i className="fas fa-tasks text-blue-600 text-xl mb-2"></i>
                  <span className="text-xs font-semibold text-blue-800 text-center">Tasks</span>
                </Link>
                <Link
                  to={`/${farmId}/animals/sick`}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg hover:shadow-md transition-all border border-yellow-200"
                >
                  <i className="fas fa-notes-medical text-yellow-600 text-xl mb-2"></i>
                  <span className="text-xs font-semibold text-yellow-800 text-center">Sick Animals</span>
                </Link>
                <Link
                  to={`/${farmId}/vets`}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg hover:shadow-md transition-all border border-indigo-200"
                >
                  <i className="fas fa-user-md text-indigo-600 text-xl mb-2"></i>
                  <span className="text-xs font-semibold text-indigo-800 text-center">Vets</span>
                </Link>
                <Link
                  to={`/${farmId}/production/record`}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition-all border border-purple-200"
                >
                  <i className="fas fa-water text-purple-600 text-xl mb-2"></i>
                  <span className="text-xs font-semibold text-purple-800 text-center">Production</span>
                </Link>
                <Link
                  to={`/farms/${farmId}/update`}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg hover:shadow-md transition-all border border-red-200"
                >
                  <i className="fas fa-edit text-red-600 text-xl mb-2"></i>
                  <span className="text-xs font-semibold text-red-800 text-center">Update</span>
                </Link>
                <Link
                  to={`/farms/${farmId}/workers`}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg hover:shadow-md transition-all border border-orange-200"
                >
                  <i className="fas fa-users text-orange-600 text-xl mb-2"></i>
                  <span className="text-xs font-semibold text-orange-800 text-center">Workers</span>
                </Link>
                <Link
                  to={`/farms/${farmId}/financial`}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg hover:shadow-md transition-all border border-teal-200"
                >
                  <i className="fas fa-chart-pie text-teal-600 text-xl mb-2"></i>
                  <span className="text-xs font-semibold text-teal-800 text-center">Financial</span>
                </Link>
                <button
                  onClick={() => setShowLoanForm(true)}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg hover:shadow-md transition-all border border-emerald-200 cursor-pointer"
                >
                  <i className="fas fa-hand-holding-usd text-emerald-600 text-xl mb-2"></i>
                  <span className="text-xs font-semibold text-emerald-800 text-center">Apply Loan</span>
                </button>
                <Link
                  to={`/farms/${farmId}/feed-schedules`}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg hover:shadow-md transition-all border border-cyan-200"
                >
                  <i className="fas fa-calendar-plus text-cyan-600 text-xl mb-2"></i>
                  <span className="text-xs font-semibold text-cyan-800 text-center">Feed Schedule</span>
                </Link>
              </div>
            </div>

            {/* Farm Workers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Farm Workers</h2>
              </div>
              <div className="p-4">
                {farmWorkers?.length > 0 ? (
                  <div className="space-y-3">
                    {farmWorkers.slice(0, 5).map((worker: { _id: string; firstName: string; lastName: string; role: string; email: string }, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {worker.firstName?.charAt(0)}{worker.lastName?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {worker.firstName} {worker.lastName}
                            </p>
                            <p className="text-xs text-gray-600 capitalize">{worker.role || 'Worker'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <i className="fas fa-user-check text-blue-600"></i>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-users text-gray-300 text-3xl mb-2"></i>
                    <p className="text-sm text-gray-500">No farm workers</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notifications */}
            {stats.notifications?.unread > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center">
                      <i className="fas fa-bell text-red-600 mr-3"></i>
                      <span className="text-sm font-medium text-gray-900">Unread notifications</span>
                    </div>
                    <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {stats.notifications.unread}
                    </span>
                  </div>
                  <Link
                    to="/notifications"
                    className="mt-3 block text-center bg-gray-50 hover:bg-gray-100 rounded-lg py-2.5 text-sm font-medium text-gray-700 transition-colors"
                  >
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loan Request Form Modal */}
      {showLoanForm && farmId && (
        <LoanRequestForm
          farmId={farmId}
          onClose={() => setShowLoanForm(false)}
          onSuccess={() => {
            // Optionally refresh stats or show a success message
          }}
        />
      )}
    </div>
  );
};

export default FarmDashboard;