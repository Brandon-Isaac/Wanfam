import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/Api';
import { Expense } from '../../types/financial';
import { useToast } from '../../contexts/ToastContext';

interface ExpenseFormProps {
    isEdit?: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ isEdit = false }) => {
    const { farmId, expenseId } = useParams<{ farmId: string; expenseId?: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [animals, setAnimals] = useState<any[]>([]);
    const [workers, setWorkers] = useState<any[]>([]);
    
    const [formData, setFormData] = useState<Partial<Expense>>({
        farmId: farmId,
        category: 'feed',
        amount: 0,
        currency: 'KES',
        date: new Date().toISOString().split('T')[0],
        paymentStatus: 'completed',
        paymentMethod: 'cash',
        isRecurring: false
    });

    useEffect(() => {
        // Fetch animals and workers for dropdowns
        const fetchData = async () => {
            try {
                const [animalsRes, workersRes] = await Promise.all([
                    api.get(`/livestock/farm/${farmId}`),
                    api.get(`/workers/farm/${farmId}`)
                ]);
                setAnimals(animalsRes.data);
                setWorkers(workersRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();

        // If editing, fetch the expense data
        if (isEdit && expenseId) {
            const fetchExpense = async () => {
                try {
                    const response = await api.get(`/expenses/${expenseId}`);
                    setFormData({
                        ...response.data,
                        date: new Date(response.data.date).toISOString().split('T')[0],
                        animalId: response.data.animalId?._id,
                        workerId: response.data.workerId?._id
                    });
                } catch (error) {
                    console.error('Error fetching expense:', error);
                }
            };
            fetchExpense();
        }
    }, [farmId, isEdit, expenseId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit && expenseId) {
                await api.put(`/expenses/${expenseId}`, formData);
            } else {
                await api.post('/expenses', formData);
            }
            navigate(`/farms/${farmId}/expenses`);
        } catch (error) {
            console.error('Error saving expense:', error);
            showToast('Failed to save expense record', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev: Partial<Expense>) => ({ ...prev, [name]: checked }));
        } else {
            setFormData((prev: Partial<Expense>) => ({
                ...prev,
                [name]: type === 'number' ? parseFloat(value) : value
            }));
        }
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    {isEdit ? 'Edit Expense Record' : 'Add New Expense'}
                </h1>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                >
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                                <input
                                    type="text"
                                    name="subcategory"
                                    value={formData.subcategory || ''}
                                    onChange={handleChange}
                                    placeholder="e.g., Hay, Veterinary"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Currency <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="KES">KES</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                    <option value="TZS">TZS</option>
                                    <option value="UGX">UGX</option>
                                    <option value="RWF">RWF</option>
                                    <option value="ZAR">ZAR</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date as string}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Related Entities */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Related To (Optional)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Animal</label>
                                <select
                                    name="animalId"
                                    value={typeof formData.animalId === 'string' ? formData.animalId : (formData.animalId as any)?._id || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select animal (optional)</option>
                                    {animals.map(animal => (
                                        <option key={animal._id} value={animal._id}>
                                            {animal.tagId} - {animal.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Worker</label>
                                <select
                                    name="workerId"
                                    value={typeof formData.workerId === 'string' ? formData.workerId : (formData.workerId as any)?._id || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select worker (optional)</option>
                                    {workers.map(worker => (
                                        <option key={worker._id} value={worker._id}>
                                            {worker.firstName} {worker.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor/Supplier</label>
                                <input
                                    type="text"
                                    name="vendor"
                                    value={formData.vendor || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                <select
                                    name="paymentMethod"
                                    value={formData.paymentMethod}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="mobile_money">Mobile Money</option>
                                    <option value="check">Check</option>
                                    <option value="credit">Credit</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                                <select
                                    name="paymentStatus"
                                    value={formData.paymentStatus}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                    <option value="partial">Partial</option>
                                    <option value="overdue">Overdue</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                                <input
                                    type="text"
                                    name="invoiceNumber"
                                    value={formData.invoiceNumber || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
                                <input
                                    type="text"
                                    name="receiptNumber"
                                    value={formData.receiptNumber || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Recurring */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recurring Expense</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isRecurring"
                                    checked={formData.isRecurring || false}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    This is a recurring expense
                                </label>
                            </div>

                            {formData.isRecurring && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                                    <select
                                        name="recurringFrequency"
                                        value={formData.recurringFrequency || ''}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select frequency</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes || ''}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(`/farms/${farmId}/expenses`)}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-2"></i>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save mr-2"></i>
                                    {isEdit ? 'Update Expense' : 'Save Expense'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExpenseForm;
