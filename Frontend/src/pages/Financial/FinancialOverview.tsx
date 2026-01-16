import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/Api';
import { FinancialOverview } from '../../types/financial';

const FinancialOverviewPage: React.FC = () => {
    const { farmId } = useParams<{ farmId: string }>();
    const [overview, setOverview] = useState<FinancialOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    const fetchOverview = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (dateRange.startDate) params.append('startDate', dateRange.startDate);
            if (dateRange.endDate) params.append('endDate', dateRange.endDate);

            const response = await api.get(`/financial/farm/${farmId}/overview?${params.toString()}`);
            setOverview(response.data);
        } catch (error) {
            console.error('Error fetching financial overview:', error);
        } finally {
            setLoading(false);
        }
    }, [farmId, dateRange]);

    useEffect(() => {
        fetchOverview();
    }, [fetchOverview]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES' }).format(amount);
    };

    const getMonthName = (month: number) => {
        return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'short' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <i className="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
                    <p className="mt-4 text-gray-600">Loading financial overview...</p>
                </div>
            </div>
        );
    }

    if (!overview) {
        return <div className="text-center py-12">No financial data available</div>;
    }

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
                <div className="flex gap-3">
                    <Link
                        to={`/farms/${farmId}/revenues`}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <i className="fas fa-plus mr-2"></i>
                        Add Revenue
                    </Link>
                    <Link
                        to={`/farms/${farmId}/expenses`}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <i className="fas fa-plus mr-2"></i>
                        Add Expense
                    </Link>
                </div>
            </div>

            {/* Date Range Filter */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <button
                        onClick={fetchOverview}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <i className="fas fa-sync-alt mr-2"></i>
                        Refresh
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Total Revenue</p>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(overview.summary.totalRevenue)}</p>
                        </div>
                        <i className="fas fa-coins text-4xl text-green-200 opacity-50"></i>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100 text-sm">Total Expenses</p>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(overview.summary.totalExpenses)}</p>
                        </div>
                        <i className="fas fa-receipt text-4xl text-red-200 opacity-50"></i>
                    </div>
                </div>

                <div className={`bg-gradient-to-r ${overview.summary.netProfit >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} rounded-lg shadow p-6 text-white`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Net Profit</p>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(overview.summary.netProfit)}</p>
                        </div>
                        <i className={`fas ${overview.summary.netProfit >= 0 ? 'fa-chart-line' : 'fa-chart-line-down'} text-4xl text-blue-200 opacity-50`}></i>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">Profit Margin</p>
                            <p className="text-2xl font-bold mt-1">{overview.summary.profitMargin.toFixed(2)}%</p>
                        </div>
                        <i className="fas fa-percentage text-4xl text-purple-200 opacity-50"></i>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Revenue Breakdown */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        <i className="fas fa-chart-pie mr-2 text-green-600"></i>
                        Revenue by Source
                    </h2>
                    <div className="space-y-3">
                        {overview.revenue.bySource.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <span className="text-sm text-gray-700 capitalize">
                                    {item._id.replace(/_/g, ' ')}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-green-600">
                                        {formatCurrency(item.total)}
                                    </span>
                                    <span className="text-xs text-gray-500">({item.count})</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Link
                        to={`/farms/${farmId}/revenues`}
                        className="mt-4 block text-center text-blue-600 hover:text-blue-800 text-sm"
                    >
                        View All Revenues →
                    </Link>
                </div>

                {/* Expense Breakdown */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        <i className="fas fa-chart-pie mr-2 text-red-600"></i>
                        Expenses by Category
                    </h2>
                    <div className="space-y-3">
                        {overview.expenses.byCategory.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <span className="text-sm text-gray-700 capitalize">
                                    {item._id.replace(/_/g, ' ')}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-red-600">
                                        {formatCurrency(item.total)}
                                    </span>
                                    <span className="text-xs text-gray-500">({item.count})</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Link
                        to={`/farms/${farmId}/expenses`}
                        className="mt-4 block text-center text-blue-600 hover:text-blue-800 text-sm"
                    >
                        View All Expenses →
                    </Link>
                </div>
            </div>

            {/* Monthly Trends */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    <i className="fas fa-chart-line mr-2 text-blue-600"></i>
                    Monthly Trends
                </h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Month</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Revenue</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Expenses</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {overview.monthlyTrends.map((trend, index) => (
                                <tr key={index} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4 text-sm text-gray-900">
                                        {getMonthName(trend.month)} {trend.year}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-right font-semibold text-green-600">
                                        {formatCurrency(trend.revenue)}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-right font-semibold text-red-600">
                                        {formatCurrency(trend.expenses)}
                                    </td>
                                    <td className={`py-3 px-4 text-sm text-right font-bold ${trend.profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                        {formatCurrency(trend.profit)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Revenue */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        <i className="fas fa-clock mr-2 text-green-600"></i>
                        Recent Revenue
                    </h2>
                    <div className="space-y-3">
                        {overview.recentTransactions.revenue.slice(0, 5).map((rev) => (
                            <div key={rev._id} className="flex justify-between items-start p-3 bg-green-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 capitalize">
                                        {rev.source.replace(/_/g, ' ')}
                                    </p>
                                    <p className="text-xs text-gray-500">{new Date(rev.date).toLocaleDateString()}</p>
                                </div>
                                <span className="text-sm font-bold text-green-600">
                                    {formatCurrency(rev.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Expenses */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        <i className="fas fa-clock mr-2 text-red-600"></i>
                        Recent Expenses
                    </h2>
                    <div className="space-y-3">
                        {overview.recentTransactions.expenses.slice(0, 5).map((exp) => (
                            <div key={exp._id} className="flex justify-between items-start p-3 bg-red-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 capitalize">
                                        {exp.category.replace(/_/g, ' ')}
                                    </p>
                                    <p className="text-xs text-gray-500">{new Date(exp.date).toLocaleDateString()}</p>
                                </div>
                                <span className="text-sm font-bold text-red-600">
                                    {formatCurrency(exp.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialOverviewPage;
