import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/Api';

interface ExpenseItem {
  _id: string;
  farmId: {
    _id: string;
    name: string;
  };
  category: string;
  subcategory: string;
  amount: number;
  currency: string;
  date: string;
  description: string;
  paymentStatus: string;
}

const Expenses = () => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState('365');
  const [totalExpenses, setTotalExpenses] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpenses();
  }, [filterPeriod]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const farmsResponse = await api.get('/farms');
      const farms = farmsResponse.data.data || farmsResponse.data;

      const allExpensesPromises = farms.map((farm: any) =>
        api.get(`/expenses/farm/${farm._id}`)
      );

      const expensesResponses = await Promise.all(allExpensesPromises);
      
      const combinedExpenses = expensesResponses.flatMap((response, index) => {
        const farmExpenses = response.data.data || [];
        return farmExpenses.map((expense: any) => ({
          ...expense,
          farmId: {
            _id: farms[index]._id,
            name: farms[index].name
          }
        }));
      });

      // Filter by period
      const days = parseInt(filterPeriod);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const filteredExpenses = combinedExpenses.filter((exp: any) => 
        new Date(exp.date) >= cutoffDate
      );

      setExpenses(filteredExpenses);
      setTotalExpenses(filteredExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0));
      setError(null);
    } catch (err: any) {
      console.error('Error fetching expenses:', err);
      setError(err.response?.data?.message || 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'feed': return 'bg-orange-100 text-orange-800';
      case 'medical': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      case 'labor': return 'bg-purple-100 text-purple-800';
      case 'utilities': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading expenses...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Expenses Overview</h1>
              <p className="text-gray-600 mt-1">
                Track your spending across all farms
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

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm uppercase tracking-wide mb-2">Total Expenses</p>
              <p className="text-5xl font-bold">KES {totalExpenses.toLocaleString()}</p>
              <p className="text-purple-100 mt-2">Last {filterPeriod} days</p>
            </div>
            <div className="p-4 bg-white bg-opacity-20 rounded-lg">
              <i className="fas fa-receipt text-6xl"></i>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Period:</label>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

        {/* Expenses List */}
        {expenses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <i className="fas fa-receipt text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No expense records</h3>
            <p className="text-gray-600">No expenses have been recorded for the selected period</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farm</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((expense) => (
                    <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{expense.farmId.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(expense.category)}`}>
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {expense.description || expense.subcategory}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(expense.paymentStatus)}`}>
                          {expense.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-red-600">
                        {expense.currency} {expense.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                      Total:
                    </td>
                    <td className="px-6 py-4 text-right text-lg font-bold text-red-600">
                      KES {totalExpenses.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;
