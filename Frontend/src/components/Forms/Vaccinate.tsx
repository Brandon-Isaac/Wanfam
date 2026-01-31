import api from "../../utils/Api";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext";

const Vaccinate = () => {
    const { farmId, animalId } = useParams();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        vaccineName: "",
        dateAdministered: "",
        veterinarian: "",
        veterinarianName: "",
        cost: "",
        notes: ""
    });
    const [vets, setVets] = useState<any[]>([]);
    const [useExternalVet, setUseExternalVet] = useState(false);
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
                if (vetsList.length === 0) {
                    setUseExternalVet(true);
                }
            } catch (error) {
                console.error("Error fetching veterinarians:", error);
                setUseExternalVet(true); // Fallback to external vet on error
            } finally {
                setFetchingVets(false);
            }
        };
        
        fetchVets();
    }, [farmId]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const payload = {
                farmId,
                animalId,
                vaccineName: formData.vaccineName,
                scheduledDate: formData.dateAdministered,
                notes: formData.notes,
                ...(useExternalVet ? {
                    veterinarianName: formData.veterinarianName,
                    vaccination_cost: formData.cost
                } : {
                    veterinarianId: formData.veterinarian
                })
            };
            await api.post(`/vaccination/records`, payload);
            showToast('Vaccination recorded successfully!', 'success');
            setTimeout(() => {
                navigate(`/${farmId}/livestock/${animalId}`);
            }, 1500);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to record vaccination";
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"> 
                <h2 className="text-2xl font-bold mb-6 text-center">Record Vaccination</h2>
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
                        <label className="block text-gray-700">Date Administered</label>
                        <input  
                            type="date"
                            name="dateAdministered"
                            value={formData.dateAdministered}
                            onChange={handleChange}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                            required    
                        />
                    </div>
                    
                    {/* Veterinarian Selection */}
                    {!fetchingVets && vets.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-gray-700">Veterinarian</label>
                                <button
                                    type="button"
                                    onClick={() => setUseExternalVet(!useExternalVet)}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    {useExternalVet ? "Use system vet" : "Use external vet"}
                                </button>
                            </div>
                            {!useExternalVet ? (
                                <select
                                    name="veterinarian"
                                    value={formData.veterinarian}
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
                            ) : (
                                <input
                                    type="text"
                                    name="veterinarianName"
                                    value={formData.veterinarianName}
                                    onChange={handleChange}
                                    placeholder="Enter veterinarian name"
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                    required
                                />
                            )}
                        </div>
                    )}
                    
                    {/* External Vet Only - No system vets available */}
                    {!fetchingVets && vets.length === 0 && (
                        <div>
                            <label className="block text-gray-700">Veterinarian Name</label>
                            <input
                                type="text"
                                name="veterinarianName"
                                value={formData.veterinarianName}
                                onChange={handleChange}
                                placeholder="Enter veterinarian name"
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                required
                            />
                            <p className="text-sm text-gray-500 mt-1">No veterinarians available in the system</p>
                        </div>
                    )}
                    
                    {/* Cost field - shown only when using external vet (with system vets available) or no system vets */}
                    {!fetchingVets && ((useExternalVet && vets.length > 0) || vets.length === 0) && (
                        <div>
                            <label className="block text-gray-700">Vaccination Cost</label>
                            <input
                                type="number"
                                name="cost"
                                value={formData.cost}
                                onChange={handleChange}
                                placeholder="Enter cost"
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
                        ></textarea>
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition-colors duration-200"
                        disabled={loading}
                    >
                        {loading ? "Recording..." : "Record Vaccination"}   
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Vaccinate;