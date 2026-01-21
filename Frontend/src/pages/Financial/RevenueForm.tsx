import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/Api';
import { Revenue } from '../../types/financial';
import { useToast } from '../../contexts/ToastContext';

interface RevenueFormProps {
    isEdit?: boolean;
}

const RevenueForm: React.FC<RevenueFormProps> = ({ isEdit = false }) => {
    const { farmId, revenueId } = useParams<{ farmId: string; revenueId?: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [animals, setAnimals] = useState<any[]>([]);
    
    const [formData, setFormData] = useState<Partial<Revenue>>({
        farmId: farmId,
        source: 'milk_sale',
        category: 'product_sale',
        amount: 0,
        currency: 'KES',
        date: new Date().toISOString().split('T')[0],
        paymentStatus: 'completed',
        paymentMethod: 'cash'
    });

    useEffect(() => {
        // Fetch animals for the dropdown
        const fetchAnimals = async () => {
            try {
                const response = await api.get(`/livestock/farm/${farmId}`);
                setAnimals(response.data);
            } catch (error) {
                console.error('Error fetching animals:', error);
            }
        };
        fetchAnimals();

        // If editing, fetch the revenue data
        if (isEdit && revenueId) {
            const fetchRevenue = async () => {
                try {
                    const response = await api.get(`/revenues/${revenueId}`);
                    setFormData({
                        ...response.data,
                        date: new Date(response.data.date).toISOString().split('T')[0],
                        animalId: response.data.animalId?._id
                    });
                } catch (error) {
                    console.error('Error fetching revenue:', error);
                }
            };
            fetchRevenue();
        }
    }, [farmId, isEdit, revenueId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit && revenueId) {
                await api.put(`/revenues/${revenueId}`, formData);
            } else {
                await api.post('/revenues', formData);
            }
            navigate(`/farms/${farmId}/revenues`);
        } catch (error) {
            console.error('Error saving revenue:', error);
            showToast('Failed to save revenue record', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev: Partial<Revenue>) => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    {isEdit ? 'Edit Revenue Record' : 'Add New Revenue'}
                </h1>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Source <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="source"
                                    value={formData.source}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                >
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
                                    <option value="product_sale">Product Sale</option>
                                    <option value="service">Service</option>
                                    <option value="investment_return">Investment Return</option>
                                    <option value="grant">Grant</option>
                                    <option value="other">Other</option>
                                </select>
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

                    {/* Product Details */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Details (Optional)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Animal (if applicable)</label>
                                <select
                                    name="animalId"
                                    value={typeof formData.animalId === 'string' ? formData.animalId : (formData.animalId as any)?._id || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select animal (optional)</option>
                                    {animals.map(animal => (
                                        <option key={animal._id} value={animal._id}>
                                            {animal.tagId} - {animal.name} ({animal.species})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                                <input
                                    type="text"
                                    name="productType"
                                    value={formData.productType || ''}
                                    onChange={handleChange}
                                    placeholder="e.g., Milk, Eggs, Wool"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity || ''}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                <input
                                    type="text"
                                    name="unit"
                                    value={formData.unit || ''}
                                    onChange={handleChange}
                                    placeholder="e.g., liters, kg, units"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Unit</label>
                                <input
                                    type="number"
                                    name="pricePerUnit"
                                    value={formData.pricePerUnit || ''}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Buyer/Customer</label>
                                <input
                                    type="text"
                                    name="buyer"
                                    value={formData.buyer || ''}
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
                            onClick={() => navigate(`/farms/${farmId}/revenues`)}
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
                                    {isEdit ? 'Update Revenue' : 'Save Revenue'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RevenueForm;
