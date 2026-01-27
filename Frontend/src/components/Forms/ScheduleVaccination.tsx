import api from "../../utils/Api";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ScheduleVaccination = () => {
    const { farmId, animalId } = useParams();
    const [formData, setFormData] = useState({
        vaccineName: "",
        scheduledDate: "",
        veterinarianId: "",
        cost: "",
        notes: "",
        selfAdministered: false
    });
    const [vets, setVets] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingVets, setFetchingVets] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchVets = async () => {
            try {
                const response = await api.get(`vets/${farmId}`);
                const vetsList = response.data.data || [];
                setVets(vetsList);
            } catch (error) {
                console.error("Error fetching veterinarians:", error);
            } finally {
                setFetchingVets(false);
            }
        };
        
        fetchVets();
    }, [farmId]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await api.post(`/vaccination/${farmId}/schedule`, {
                animalId,
                vaccineName: formData.vaccineName,
                scheduledDate: formData.scheduledDate,
                veterinarianId: formData.selfAdministered ? null : formData.veterinarianId,
                cost: formData.selfAdministered ? formData.cost : undefined,
                notes: formData.notes,
                selfAdministered: formData.selfAdministered
            });
            navigate(`/${farmId}/livestock/${animalId}`);
        } catch (error) {
            setError(error instanceof Error ? error.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"> 
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Schedule Vaccination</h2>
                    <button
                        onClick={() => navigate(`/${farmId}/livestock/${animalId}`)}
                        className="text-gray-500 hover:text-red-500 transition-colors duration-200"
                    >
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700">Vaccine Name</label>
                        <input
                            type="text"
                            name="vaccineName"
                            value={formData.vaccineName}
                            onChange={handleChange}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-gray-700">Scheduled Date</label>
                        <input  
                            type="date"
                            name="scheduledDate"
                            value={formData.scheduledDate}
                            onChange={handleChange}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                            required    
                        />
                    </div>
                    
                    {/* Self-administered checkbox */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="selfAdministered"
                            checked={formData.selfAdministered}
                            onChange={handleChange}
                            className="h-4 w-4 text-green-600 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-gray-700">
                            I will administer this vaccination myself
                        </label>
                    </div>
                    
                    {/* Veterinarian Selection - only shown if NOT self-administered */}
                    {!formData.selfAdministered && !fetchingVets && vets.length > 0 && (
                        <div>
                            <label className="block text-gray-700">Assign Veterinarian</label>
                            <select
                                name="veterinarianId"
                                value={formData.veterinarianId}
                                onChange={handleChange}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                required
                            >
                                <option value="">Select a veterinarian</option>
                                {vets.map((vet) => (
                                    <option key={vet._id} value={vet._id}>
                                        {vet.firstName} {vet.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    
                    {/* No vets available message */}
                    {!formData.selfAdministered && !fetchingVets && vets.length === 0 && (
                        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                            <p className="text-sm text-yellow-800">
                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                No veterinarians available. Please check "self-administered" or assign a vet to your farm first.
                            </p>
                        </div>
                    )}
                    
                    {/* Cost field - only shown if self-administered */}
                    {formData.selfAdministered && (
                        <div>
                            <label className="block text-gray-700">Vaccination Cost</label>
                            <input
                                type="number"
                                name="cost"
                                value={formData.cost}
                                onChange={handleChange}
                                placeholder="Enter estimated cost"
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-gray-700">Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                            rows={3}
                            placeholder="Additional notes or instructions"
                        ></textarea>
                    </div>
                    
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    
                    <button
                        type="submit"
                        className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition-colors duration-200"
                        disabled={loading}
                    >
                        {loading ? "Scheduling..." : "Schedule Vaccination"}   
                    </button>
                    
                    {/* Navigate to Record Vaccination */}
                    <button
                        type="button"
                        onClick={() => navigate(`/${farmId}/livestock/${animalId}/vaccinate`)}
                        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors duration-200 mt-2"
                    >
                        <i className="fas fa-syringe mr-2"></i>
                        Record Vaccination Now
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ScheduleVaccination;
