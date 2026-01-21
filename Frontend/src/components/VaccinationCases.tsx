import api from "../utils/Api";
import { useEffect, useState } from "react";
import VaccinationSchedule from "../types/VaccinationTypes";

const VaccinationCases = () => {
    const [vaccinationCases, setVaccinationCases] = useState<VaccinationSchedule[]>([]);
    const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState<boolean>(false);
    const [selectedSchedule, setSelectedSchedule] = useState<VaccinationSchedule | null>(null);
    const [recordData, setRecordData] = useState({
        vaccineName: "",
        vaccinationDate: "",
        administrationSite: "",
        notes: "",
        sideEffects: ""
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>("");
    useEffect(() => {
        const fetchVaccinationCases = async () => {
            try {
                const response = await api.get('/vaccination/schedules/veterinarian');
                setVaccinationCases(response.data.schedules);
            } catch (err) {
                setError('Failed to fetch vaccination cases');
            } finally {
                setLoading(false);
            }   

        };
        fetchVaccinationCases();
    }, []);

    const vaccinations = [...vaccinationCases];
    
    const handleOpenModal = (schedule: VaccinationSchedule) => {
        setSelectedSchedule(schedule);
        setRecordData({
            vaccineName: schedule.scheduleName || "",
            vaccinationDate: new Date().toISOString().split('T')[0],
            administrationSite: "",
            notes: schedule.notes || "",
            sideEffects: ""
        });
        setUpdateStatusModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setRecordData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!selectedSchedule) return;
        setSubmitting(true);
        setFormError(null);
        try {
            const animalId = typeof selectedSchedule.animalId === 'object' 
                ? selectedSchedule.animalId._id 
                : selectedSchedule.animalId;

            const animalName = typeof selectedSchedule.animalId === 'object'
                ? selectedSchedule.animalId.name
                : 'Animal';

            // Create vaccination record
            await api.post(`/vaccination/records/${animalId}`, {
                farmId: selectedSchedule.farmId,
                ...recordData
            });

            // Update schedule status to completed
            await api.put(`/vaccination/schedules/${selectedSchedule._id}`, {
                status: 'completed'
            });

            // Update local state
            setVaccinationCases(prev => 
                prev.map(item => 
                    item._id === selectedSchedule._id 
                        ? { ...item, status: 'completed' } 
                        : item
                )
            );

            // Show success message
            setSuccessMessage(`Vaccination record for ${animalName} has been successfully saved!`);
            setShowSuccess(true);

            // Auto-close modal and show toast after 2 seconds
            setTimeout(() => {
                setUpdateStatusModalOpen(false);
                setSelectedSchedule(null);
                setShowSuccess(false);
            }, 2000);

            // Hide toast after 5 seconds
            setTimeout(() => {
                setSuccessMessage("");
            }, 5000);

        } catch (err) {
            console.error("Failed to record vaccination:", err);
            setFormError("Failed to record vaccination details. Please try again.");
        } finally {
            setSubmitting(false);
        };
    }
    if (loading) {
          return (
            <div className="flex justify-center items-center h-64">
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
            </div>
        );
    }
    if(error){
        return(
             <div className="flex justify-center items-center h-64">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Success Toast Notification */}
            {successMessage && (
                <div className="fixed top-4 right-4 z-[60] animate-slide-in">
                    <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md">
                        <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="font-semibold">Success!</p>
                            <p className="text-sm">{successMessage}</p>
                        </div>
                        <button 
                            onClick={() => setSuccessMessage("")}
                            className="ml-auto text-white hover:text-gray-200"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <h2 className="text-2xl font-semibold mb-6">Vaccination Cases Assigned to You</h2>
            {vaccinations.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <p className="text-gray-600">No vaccination cases assigned to you.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vaccinations.map((caseItem) => (
                        <div 
                            key={caseItem._id} 
                            className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                                caseItem.status === 'completed' 
                                    ? 'border-green-500' 
                                    : caseItem.status === 'missed' 
                                    ? 'border-red-500' 
                                    : 'border-blue-500'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {caseItem.scheduleName}
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    caseItem.status === 'completed' 
                                        ? 'bg-green-100 text-green-800' 
                                        : caseItem.status === 'missed' 
                                        ? 'bg-red-100 text-red-800' 
                                        : 'bg-blue-100 text-blue-800'
                                }`}>
                                    {caseItem.status.toUpperCase()}
                                </span>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-gray-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <div>
                                        <p className="text-xs text-gray-500">Animal</p>
                                        <p className="text-sm font-medium text-gray-800">
                                            {typeof caseItem.animalId === 'object' 
                                                ? `${caseItem.animalId.name} (${caseItem.animalId.tagId || 'No Tag'})` 
                                                : caseItem.animalId}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-gray-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <div>
                                        <p className="text-xs text-gray-500">Scheduled Date</p>
                                        <p className="text-sm font-medium text-gray-800">
                                            {new Date(caseItem.vaccinationTime).toLocaleDateString('en-US', { 
                                                weekday: 'short', 
                                                year: 'numeric', 
                                                month: 'short', 
                                                day: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {caseItem.notes && (
                                    <div className="flex items-start">
                                        <svg className="w-5 h-5 text-gray-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <div>
                                            <p className="text-xs text-gray-500">Notes</p>
                                            <p className="text-sm text-gray-700">{caseItem.notes}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button 
                                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium"
                                onClick={() => handleOpenModal(caseItem)}
                            >
                                Record Vaccination
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {updateStatusModalOpen && selectedSchedule && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {showSuccess ? (
                            // Success View
                            <div className="text-center py-8">
                                <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-800 mb-2">Vaccination Recorded!</h3>
                                <p className="text-gray-600">
                                    The vaccination details have been successfully saved.
                                </p>
                                <div className="mt-6">
                                    <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        Closing automatically...
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Form View
                            <>
                                <h3 className="text-xl font-semibold mb-4">Record Vaccination Details</h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    Recording vaccination for: <span className="font-medium">{selectedSchedule.scheduleName}</span>
                                </p>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="vaccineName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Vaccine Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="vaccineName"
                                            name="vaccineName"
                                            value={recordData.vaccineName}
                                            onChange={handleInputChange}
                                            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="vaccinationDate" className="block text-sm font-medium text-gray-700 mb-1">
                                            Vaccination Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            id="vaccinationDate"
                                            name="vaccinationDate"
                                            value={recordData.vaccinationDate}
                                            onChange={handleInputChange}
                                            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="administrationSite" className="block text-sm font-medium text-gray-700 mb-1">
                                            Administration Site <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="administrationSite"
                                            name="administrationSite"
                                            value={recordData.administrationSite}
                                            onChange={handleInputChange}
                                            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                            disabled={submitting}
                                        >
                                            <option value="">Select administration site</option>
                                            <option value="left front leg">Left Front Leg</option>
                                            <option value="right front leg">Right Front Leg</option>
                                            <option value="left hind leg">Left Hind Leg</option>
                                            <option value="right hind leg">Right Hind Leg</option>
                                            <option value="neck">Neck</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                            Notes
                                        </label>
                                        <textarea
                                            id="notes"
                                            name="notes"
                                            value={recordData.notes}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Any additional notes about the vaccination..."
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="sideEffects" className="block text-sm font-medium text-gray-700 mb-1">
                                            Side Effects (if any)
                                        </label>
                                        <textarea
                                            id="sideEffects"
                                            name="sideEffects"
                                            value={recordData.sideEffects}
                                            onChange={handleInputChange}
                                            rows={2}
                                            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Describe any observed side effects..."
                                            disabled={submitting}
                                        />
                                    </div>
                                </div>

                                {formError && (
                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2">
                                        <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-red-600">{formError}</p>
                                    </div>
                                )}

                                <div className="flex gap-3 mt-6">
                                    <button 
                                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-200 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                                        onClick={handleSubmit}
                                        disabled={submitting || !recordData.vaccineName || !recordData.vaccinationDate || !recordData.administrationSite}
                                    >
                                        {submitting && (
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        )}
                                        {submitting ? "Recording..." : "Record Vaccination"}
                                    </button>
                                    <button 
                                        className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors duration-200 font-medium disabled:opacity-50" 
                                        onClick={() => {
                                            setUpdateStatusModalOpen(false);
                                            setSelectedSchedule(null);
                                            setFormError(null);
                                        }}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default VaccinationCases;