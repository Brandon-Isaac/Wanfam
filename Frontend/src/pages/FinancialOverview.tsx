import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/Api';

const FinancialOverview = () => {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState('365');
  const navigate = useNavigate();

  useEffect(() => {
    fetchFinancialData();
  }, [filterPeriod]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const farmsResponse = await api.get('/farms');
      const farms = farmsResponse.data.data || farmsResponse.data;

      let totalRevenue = 0;
      let totalExpenses = 0;

      const days = parseInt(filterPeriod);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      for (const farm of farms) {
        try {
          const [revenueRes, expenseRes] = await Promise.all([
            api.get(`/revenue/farm/${farm._id}`),
            api.get(`/expenses/farm/${farm._id}`)
          ]);

          const revenues = (revenueRes.data.data || []).filter((r: any) => 
            new Date(r.date) >= cutoffDate
          );
          const expenses = (expenseRes.data.data || []).filter((e: any) => 
            new Date(e.date) >= cutoffDate
          );

          totalRevenue += revenues.reduce((sum: number, r: any) => sum + r.amount, 0);
          totalExpenses += expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
        } catch (err) {
          console.error(`Error fetching financial data for farm ${farm._id}:`, err);
        }
      }

      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

      setStats({
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        totalFarms: farms.length
      });
      setError(null);
    } catch (err: any) {
      console.error('Error fetching financial data:', err);
      setError(err.response?.data?.message || 'Failed to fetch financial data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading financial overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>
              <p className="text-gray-600 mt-1">
                Complete financial summary across all your farms
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Period:</label>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle text-red-500 mr-3"></i>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            to="/revenue"
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <i className="fas fa-chart-line text-4xl opacity-80"></i>
            </div>
            <p className="text-green-100 text-sm uppercase tracking-wide mb-2">Total Revenue</p>
            <p className="text-3xl font-bold">KES {stats.totalRevenue?.toLocaleString() || 0}</p>
            <p className="text-green-100 text-sm mt-2">Last {filterPeriod} days</p>
          </Link>

          <Link
            to="/expenses"
            className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <i className="fas fa-receipt text-4xl opacity-80"></i>
            </div>
            <p className="text-red-100 text-sm uppercase tracking-wide mb-2">Total Expenses</p>
            <p className="text-3xl font-bold">KES {stats.totalExpenses?.toLocaleString() || 0}</p>
            <p className="text-red-100 text-sm mt-2">Last {filterPeriod} days</p>
          </Link>

          <div className={`bg-gradient-to-br ${(stats.netProfit || 0) >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} rounded-xl shadow-lg p-6 text-white`}>
            <div className="flex items-center justify-between mb-4">
              <i className="fas fa-coins text-4xl opacity-80"></i>
            </div>
            <p className={`${(stats.netProfit || 0) >= 0 ? 'text-blue-100' : 'text-orange-100'} text-sm uppercase tracking-wide mb-2`}>Net Profit</p>
            <p className="text-3xl font-bold">KES {stats.netProfit?.toLocaleString() || 0}</p>
            <p className={`${(stats.netProfit || 0) >= 0 ? 'text-blue-100' : 'text-orange-100'} text-sm mt-2`}>Last {filterPeriod} days</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <i className="fas fa-percentage text-4xl opacity-80"></i>
            </div>
            <p className="text-purple-100 text-sm uppercase tracking-wide mb-2">Profit Margin</p>
            <p className="text-3xl font-bold">{stats.profitMargin || 0}%</p>
            <p className="text-purple-100 text-sm mt-2">Revenue efficiency</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/revenue"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
            >
              <i className="fas fa-chart-line text-green-600 text-2xl mr-4"></i>
              <div>
                <p className="font-semibold text-gray-900">View Revenue Details</p>
                <p className="text-sm text-gray-600">See all income sources</p>
              </div>
            </Link>

            <Link
              to="/expenses"
              className="flex items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
            >
              <i className="fas fa-receipt text-red-600 text-2xl mr-4"></i>
              <div>
                <p className="font-semibold text-gray-900">View Expense Details</p>
                <p className="text-sm text-gray-600">Track all spending</p>
              </div>
            </Link>

            <Link
              to="/farms"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <i className="fas fa-home text-blue-600 text-2xl mr-4"></i>
              <div>
                <p className="font-semibold text-gray-900">Farm Details</p>
                <p className="text-sm text-gray-600">Manage {stats.totalFarms} farms</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialOverview;
