import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/Api';

const FinancialOverview = () => {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState('365');
  const [generatingRecommendations, setGeneratingRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFinancialData();
  }, [filterPeriod]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const farmsResponse = await api.get('/farms');
      const farms = farmsResponse.data.data || farmsResponse.data;

      // Set the first farm as selected by default
      if (farms.length > 0 && !selectedFarmId) {
        setSelectedFarmId(farms[0]._id);
      }

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

  const generateRecommendations = async () => {
    if (!selectedFarmId) {
      alert('Please select a farm first');
      return;
    }

    try {
      setGeneratingRecommendations(true);
      setError(null);
      
      const days = parseInt(filterPeriod);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const response = await api.post(`/revenue/${selectedFarmId}/recommendations`, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        additionalContext: `Analysis period: Last ${filterPeriod} days`
      });

      setRecommendations(response.data.data.recommendations);
      setShowRecommendations(true);
    } catch (err: any) {
      console.error('Error generating recommendations:', err);
      setError(err.response?.data?.message || 'Failed to generate recommendations');
    } finally {
      setGeneratingRecommendations(false);
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
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

        {/* AI Recommendations Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI-Powered Financial Recommendations</h2>
              <p className="text-sm text-gray-600 mt-1">Get personalized insights to maximize profitability</p>
            </div>
            <button
              onClick={generateRecommendations}
              disabled={generatingRecommendations}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingRecommendations ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Generating...
                </>
              ) : (
                <>
                  <i className="fas fa-magic mr-2"></i>
                  Generate Recommendations
                </>
              )}
            </button>
          </div>

          {showRecommendations && recommendations && (
            <div className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                  Your Personalized Recommendations
                </h3>
                <button
                  onClick={() => setShowRecommendations(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="prose max-w-none">
                <div 
                  className="text-gray-800 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: recommendations.replace(/\n/g, '<br/>') }}
                />
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(recommendations);
                      alert('Recommendations copied to clipboard!');
                    } catch (err) {
                      console.error('Failed to copy to clipboard:', err);
                      alert('Failed to copy to clipboard. Please try again or check browser permissions.');
                    }
                  }}
                  className="px-4 py-2 bg-white text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <i className="fas fa-copy mr-2"></i>
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => {
                    try {
                      const blob = new Blob([recommendations], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `financial-recommendations-${new Date().toISOString().split('T')[0]}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    } catch (err) {
                      console.error('Failed to download report:', err);
                      alert('Failed to download report. Please try again.');
                    }
                  }}
                  className="px-4 py-2 bg-white text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <i className="fas fa-download mr-2"></i>
                  Download Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialOverview;
