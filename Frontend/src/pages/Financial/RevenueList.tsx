import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/Api';
import { Revenue } from '../../types/financial';

const RevenueList: React.FC = () => {
    const { farmId } = useParams<{ farmId: string }>();
    const [revenues, setRevenues] = useState<Revenue[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        source: '',
        category: '',
        paymentStatus: '',
        startDate: '',
        endDate: ''
    });

    const fetchRevenues = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.source) params.append('source', filters.source);
            if (filters.category) params.append('category', filters.category);
            if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await api.get(`/revenues/farm/${farmId}?${params.toString()}`);
            setRevenues(response.data);
        } catch (error) {
            console.error('Error fetching revenues:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRevenues();
    }, [farmId, filters]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this revenue record?')) {
            try {
                await api.delete(`/revenues/${id}`);
                fetchRevenues();
            } catch (error) {
                console.error('Error deleting revenue:', error);
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

    const totalRevenue = revenues.reduce((sum, rev) => sum + rev.amount, 0);

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Revenue Records</h1>
                <Link
                    to={`/farms/${farmId}/revenues/new`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <i className="fas fa-plus mr-2"></i>
                    Add Revenue
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                        <select
                            value={filters.source}
                            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Sources</option>
                            <option value="livestock_sale">Livestock Sale</option>
                            <option value="milk_sale">Milk Sale</option>
                            <option value="egg_sale">Egg Sale</option>
                            <option value="wool_sale">Wool Sale</option>
                            <option value="meat_sale">Meat Sale</option>
                            <option value="breeding_fee">Breeding Fee</option>
                            <option value="service_income">Service Income</option>
                            <option value="grant">Grant</option>
                            <option value="subsidy">Subsidy</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Categories</option>
                            <option value="product_sale">Product Sale</option>
                            <option value="service">Service</option>
                            <option value="investment_return">Investment Return</option>
                            <option value="grant">Grant</option>
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
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 mb-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-green-100 text-sm">Total Revenue</p>
                        <p className="text-3xl font-bold">{formatCurrency(totalRevenue, revenues[0]?.currency)}</p>
                        <p className="text-green-100 text-sm mt-1">{revenues.length} transactions</p>
                    </div>
                    <i className="fas fa-coins text-6xl text-green-200 opacity-50"></i>
                </div>
            </div>

            {/* Revenue List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="text-center py-12">
                        <i className="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
                        <p className="text-gray-500 mt-4">Loading revenues...</p>
                    </div>
                ) : revenues.length === 0 ? (
                    <div className="text-center py-12">
                        <i className="fas fa-inbox text-4xl text-gray-400"></i>
                        <p className="text-gray-500 mt-4">No revenue records found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {revenues.map((revenue) => (
                                    <tr key={revenue._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(revenue.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900">
                                                {revenue.source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </span>
                                            {revenue.buyer && (
                                                <p className="text-xs text-gray-500">from {revenue.buyer}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {revenue.description || revenue.productType || '-'}
                                            {revenue.quantity && (
                                                <p className="text-xs text-gray-500">
                                                    {revenue.quantity} {revenue.unit}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-bold text-green-600">
                                                {formatCurrency(revenue.amount, revenue.currency)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(revenue.paymentStatus)}`}>
                                                {revenue.paymentStatus || 'completed'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Link
                                                to={`/farms/${farmId}/revenues/${revenue._id}/edit`}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(revenue._id)}
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

export default RevenueList;
