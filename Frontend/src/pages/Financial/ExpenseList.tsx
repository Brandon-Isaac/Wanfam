import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/Api';
import { Expense } from '../../types/financial';

const ExpenseList: React.FC = () => {
    const { farmId } = useParams<{ farmId: string }>();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: '',
        paymentStatus: '',
        isRecurring: '',
        startDate: '',
        endDate: ''
    });

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
            if (filters.isRecurring) params.append('isRecurring', filters.isRecurring);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await api.get(`/expenses/farm/${farmId}?${params.toString()}`);
            setExpenses(response.data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [farmId, filters]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this expense record?')) {
            try {
                await api.delete(`/expenses/${id}`);
                fetchExpenses();
            } catch (error) {
                console.error('Error deleting expense:', error);
            }
        }
    };

    const formatCurrency = (amount: number, currency: string = 'KES') => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'partial': return 'bg-blue-100 text-blue-800';
            case 'overdue': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Expense Records</h1>
                <Link
                    to={`/farms/${farmId}/expenses/new`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <i className="fas fa-plus mr-2"></i>
                    Add Expense
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Categories</option>
                            <option value="feed">Feed</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="labor">Labor</option>
                            <option value="equipment">Equipment</option>
                            <option value="infrastructure">Infrastructure</option>
                            <option value="utilities">Utilities</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="insurance">Insurance</option>
                            <option value="transportation">Transportation</option>
                            <option value="marketing">Marketing</option>
                            <option value="administrative">Administrative</option>
                            <option value="loan_repayment">Loan Repayment</option>
                            <option value="taxes">Taxes</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                        <select
                            value={filters.paymentStatus}
                            onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="partial">Partial</option>
                            <option value="overdue">Overdue</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                            value={filters.isRecurring}
                            onChange={(e) => setFilters({ ...filters, isRecurring: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Types</option>
                            <option value="true">Recurring</option>
                            <option value="false">One-time</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow p-6 mb-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-red-100 text-sm">Total Expenses</p>
                        <p className="text-3xl font-bold">{formatCurrency(totalExpenses, expenses[0]?.currency)}</p>
                        <p className="text-red-100 text-sm mt-1">{expenses.length} transactions</p>
                    </div>
                    <i className="fas fa-receipt text-6xl text-red-200 opacity-50"></i>
                </div>
            </div>

            {/* Expense List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="text-center py-12">
                        <i className="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
                        <p className="text-gray-500 mt-4">Loading expenses...</p>
                    </div>
                ) : expenses.length === 0 ? (
                    <div className="text-center py-12">
                        <i className="fas fa-inbox text-4xl text-gray-400"></i>
                        <p className="text-gray-500 mt-4">No expense records found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {expenses.map((expense) => (
                                    <tr key={expense._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(expense.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900">
                                                {expense.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </span>
                                            {expense.isRecurring && (
                                                <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                                                    <i className="fas fa-sync-alt mr-1"></i>
                                                    {expense.recurringFrequency}
                                                </span>
                                            )}
                                            {expense.vendor && (
                                                <p className="text-xs text-gray-500">to {expense.vendor}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {expense.description || expense.subcategory || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-bold text-red-600">
                                                {formatCurrency(expense.amount, expense.currency)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(expense.paymentStatus)}`}>
                                                {expense.paymentStatus || 'completed'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Link
                                                to={`/farms/${farmId}/expenses/${expense._id}/edit`}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(expense._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpenseList;
