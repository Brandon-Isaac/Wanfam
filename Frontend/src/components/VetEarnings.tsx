import React, { useState, useEffect } from "react";
import api from "../utils/Api";

interface EarningsData {
    name: string;
    earnings: {
        totalEarnings: number;
        vaccinationEarnings: number;
        treatmentEarnings: number;
        lastUpdated: Date;
    };
}

interface ServiceRecord {
    id: string;
    type: 'vaccination' | 'treatment';
    vaccineName?: string;
    treatmentGiven?: string;
    animal: {
        name: string;
        tagId: string;
        species: string;
        breed: string;
    };
    farm?: {
        name: string;
    };
    cost: number;
    date: Date;
    healthStatus?: string;
    createdAt: Date;
}

const VetEarnings = () => {
    const [earnings, setEarnings] = useState<EarningsData | null>(null);
    const [serviceRecords, setServiceRecords] = useState<{
        vaccinations: ServiceRecord[];
        treatments: ServiceRecord[];
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDetails, setShowDetails] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'vaccinations' | 'treatments'>('all');

    useEffect(() => {
        fetchEarnings();
    }, []);

    const fetchEarnings = async () => {
        try {
            const response = await api.get('/vets/earnings/summary');
            setEarnings(response.data.data);
        } catch (error) {
            console.error('Error fetching earnings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchServiceRecords = async () => {
        try {
            const response = await api.get('/vets/earnings/records');
            setServiceRecords(response.data.data);
            setShowDetails(true);
        } catch (error) {
            console.error('Error fetching service records:', error);
        }
    };

    const handleViewDetails = () => {
        if (!showDetails && !serviceRecords) {
            fetchServiceRecords();
        } else {
            setShowDetails(!showDetails);
        }
    };

    const getAllRecords = () => {
        if (!serviceRecords) return [];
        return [...serviceRecords.vaccinations, ...serviceRecords.treatments].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    };

    const getFilteredRecords = () => {
        if (!serviceRecords) return [];
        switch (activeTab) {
            case 'vaccinations':
                return serviceRecords.vaccinations;
            case 'treatments':
                return serviceRecords.treatments;
            default:
                return getAllRecords();
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    if (!earnings) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500">Unable to load earnings data</p>
            </div>
        );
    }

    const filteredRecords = getFilteredRecords();

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Earnings Summary Card */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">My Earnings</h2>
                    <div className="flex items-center text-xs text-gray-500">
                        <i className="fas fa-clock mr-1"></i>
                        Last updated: {new Date(earnings.earnings.lastUpdated).toLocaleDateString()}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                        <p className="text-sm font-medium text-green-800">Total Earnings</p>
                        <p className="text-3xl font-bold text-green-900 mt-2">
                            KES {earnings.earnings.totalEarnings.toLocaleString()}
                        </p>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">Vaccination Earnings</p>
                        <p className="text-2xl font-bold text-blue-900 mt-2">
                            KES {earnings.earnings.vaccinationEarnings.toLocaleString()}
                        </p>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                        <p className="text-sm font-medium text-purple-800">Treatment Earnings</p>
                        <p className="text-2xl font-bold text-purple-900 mt-2">
                            KES {earnings.earnings.treatmentEarnings.toLocaleString()}
                        </p>
                    </div>
                </div>
                
                <button
                    onClick={handleViewDetails}
                    className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                    <i className={`fas fa-${showDetails ? 'eye-slash' : 'eye'} mr-2`}></i>
                    {showDetails ? 'Hide Details' : 'View Detailed Records'}
                </button>
            </div>

            {/* Detailed Records Table */}
            {showDetails && serviceRecords && (
                <div className="p-6">
                    <h3 className="text-md font-semibold text-gray-900 mb-4">Service Records</h3>
                    
                    {/* Tabs */}
                    <div className="flex space-x-2 mb-4 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'all'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            All ({getAllRecords().length})
                        </button>
                        <button
                            onClick={() => setActiveTab('vaccinations')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'vaccinations'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Vaccinations ({serviceRecords.vaccinations.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('treatments')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'treatments'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Treatments ({serviceRecords.treatments.length})
                        </button>
                    </div>

                    {filteredRecords.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <i className="fas fa-inbox text-4xl mb-2"></i>
                            <p>No records found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Service
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Animal
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Farm
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cost
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredRecords.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(record.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    record.type === 'vaccination'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                    {record.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {record.vaccineName || record.treatmentGiven || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {record.animal ? (
                                                    <div>
                                                        <p className="font-medium">{record.animal.name || 'Unknown'}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {record.animal.tagId} - {record.animal.species}
                                                        </p>
                                                    </div>
                                                ) : 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {record.farm?.name || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-right text-green-600">
                                                KES {record.cost.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan={5} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                                            Total:
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-right text-green-700">
                                            KES {filteredRecords.reduce((sum, record) => sum + record.cost, 0).toLocaleString()}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VetEarnings;
