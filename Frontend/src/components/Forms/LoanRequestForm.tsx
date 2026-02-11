import React, { useState, useEffect } from 'react';
import api from '../../utils/Api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

interface LoanRequestFormProps {
  farmId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const LoanRequestForm: React.FC<LoanRequestFormProps> = ({ farmId, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loanOfficers, setLoanOfficers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    repaymentTerm: '',
    employmentStatus: 'self-employed',
    collateralDetails: '',
    businessPlan: '',
    loanOfficerId: ''
  });

  useEffect(() => {
    fetchLoanOfficers();
  }, []);

  const fetchLoanOfficers = async () => {
    try {
      const response = await api.get('/loans/loan-officers');
      setLoanOfficers(response.data.loanOfficers || []);
    } catch (error) {
      console.error('Error fetching loan officers:', error);
      showToast('Failed to load loan officers', 'error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.amount || !formData.purpose || !formData.repaymentTerm || !formData.loanOfficerId) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      showToast('Loan amount must be greater than 0', 'error');
      return;
    }

    if (parseInt(formData.repaymentTerm) <= 0) {
      showToast('Repayment term must be greater than 0', 'error');
      return;
    }

    try {
      setLoading(true);
      
      // Use user from auth context
      if (!user?._id) {
        showToast('User not authenticated', 'error');
        return;
      }

      const payload = {
        userId: user._id,
        farmId,
        amountRequested: parseFloat(formData.amount),
        purpose: formData.purpose,
        repaymentPeriod: parseInt(formData.repaymentTerm),
        employmentStatus: formData.employmentStatus,
        collateralDetails: formData.collateralDetails,
        businessPlan: formData.businessPlan,
        loanOfficerId: formData.loanOfficerId
      };

      await api.post('/loans/create', payload);
      
      showToast('Loan request submitted successfully!', 'success');
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error submitting loan request:', error);
      showToast(error.response?.data?.message || 'Failed to submit loan request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Apply for Farm Loan</h2>
            <p className="text-sm text-blue-100 mt-1">Fill in the details to request a loan for your farm</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 rounded-full p-2 transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Loan Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Loan Amount (KES) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="e.g., 50000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Purpose of Loan <span className="text-red-500">*</span>
            </label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="Describe why you need this loan..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Repayment Term */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Repayment Term (Months) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="repaymentTerm"
              value={formData.repaymentTerm}
              onChange={handleChange}
              placeholder="e.g., 24"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Employment Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Employment Status <span className="text-red-500">*</span>
            </label>
            <select
              name="employmentStatus"
              value={formData.employmentStatus}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="self-employed">Self Employed</option>
              <option value="employed">Employed</option>
              <option value="unemployed">Unemployed</option>
            </select>
          </div>

          {/* Collateral Details */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Collateral Details <span className="text-red-500">*</span>
            </label>
            <textarea
              name="collateralDetails"
              value={formData.collateralDetails}
              onChange={handleChange}
              placeholder="Describe what you're offering as collateral (e.g., farm equipment, land, livestock)..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Business Plan */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Business Plan <span className="text-red-500">*</span>
            </label>
            <textarea
              name="businessPlan"
              value={formData.businessPlan}
              onChange={handleChange}
              placeholder="Describe your business plan and how you intend to repay the loan..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Loan Officer */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Loan Officer <span className="text-red-500">*</span>
            </label>
            <select
              name="loanOfficerId"
              value={formData.loanOfficerId}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">-- Select a loan officer --</option>
              {loanOfficers.map((officer: any) => {
                // Officers are now directly from User model
                const officerId = officer._id;
                const firstName = officer.firstName || 'Unknown';
                const lastName = officer.lastName || '';
                const email = officer.email || '';
                const phone = officer.phoneNumber || '';
                
                return (
                  <option key={officer._id} value={officerId}>
                    {firstName} {lastName}
                    {email ? ` (${email})` : ''}
                    {phone ? ` - ${phone}` : ''}
                  </option>
                );
              })}
            </select>
            {loanOfficers.length === 0 && (
              <p className="text-sm text-amber-600 mt-1">
                <i className="fas fa-exclamation-triangle mr-1"></i>
                No loan officers available. Please contact support.
              </p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <i className="fas fa-info-circle text-blue-600 mt-1 mr-3"></i>
              <div className="text-sm text-gray-700">
                <p className="font-semibold text-blue-900 mb-1">Important Information:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your loan request will be reviewed by the selected loan officer</li>
                  <li>Once approved, the loan amount will be automatically added to your farm revenue</li>
                  <li>You will receive notifications about the status of your application</li>
                  <li>Ensure all information provided is accurate and complete</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loanOfficers.length === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanRequestForm;
