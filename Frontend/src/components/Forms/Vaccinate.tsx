import api from "../../utils/Api";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext";

const Vaccinate = () => {
    const { farmId, animalId } = useParams();
    const { showToast } = useToast();
    const [recordType, setRecordType] = useState<'scheduled' | 'new'>('scheduled');
    const [formData, setFormData] = useState({
        scheduleId: "",
        vaccineName: "",
        dateAdministered: "",
        veterinarian: "",
        veterinarianName: "",
        cost: "",
        notes: ""
    });
    const [vets, setVets] = useState<any[]>([]);
    const [schedules, setSchedules] = useState<any[]>([]);
    const [useExternalVet, setUseExternalVet] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetchingVets, setFetchingVets] = useState(true);
    const [fetchingSchedules, setFetchingSchedules] = useState(true);
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
                setUseExternalVet(true);
            } finally {
                setFetchingVets(false);
            }
        };
        
        const fetchSchedules = async () => {
            try {
                const response = await api.get(`/vaccination/schedules/${farmId}/${animalId}`);
                const schedulesList = response.data.schedules || [];
                const pendingSchedules = schedulesList.filter((s: any) => s.status === 'scheduled');
                setSchedules(pendingSchedules);
                if (pendingSchedules.length === 0) {
                    setRecordType('new');
                }
            } catch (error) {
                console.error("Error fetching vaccination schedules:", error);
                setRecordType('new');
            } finally {
                setFetchingSchedules(false);
            }
        };
        
        fetchVets();
        fetchSchedules();
    }, [farmId, animalId]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleScheduleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const scheduleId = e.target.value;
        const selectedSchedule = schedules.find((s: any) => s._id === scheduleId);
        if (selectedSchedule) {
            setFormData(prev => ({
                ...prev,
                scheduleId,
                vaccineName: selectedSchedule.vaccineName,
                dateAdministered: new Date(selectedSchedule.scheduledDate).toISOString().split('T')[0],
                veterinarian: selectedSchedule.veterinarianId || "",
                notes: selectedSchedule.notes || ""
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (recordType === 'scheduled' && formData.scheduleId) {
                await api.post(`/vaccination/schedules/${formData.scheduleId}/execute`, {
                    notes: formData.notes
                });
                showToast('Scheduled vaccination completed successfully!', 'success');
            } else {
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
            }
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
                
                {fetchingSchedules && (
                    <div className="text-center py-4">
                        <p className="text-gray-600">Loading vaccination schedules...</p>
                    </div>
                )}

                {!fetchingSchedules && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {schedules.length > 0 && (
                            <div className="flex gap-4 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setRecordType('scheduled')}
                                    className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                                        recordType === 'scheduled'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Record Scheduled
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRecordType('new')}
                                    className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                                        recordType === 'new'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Add New Record
                                </button>
                            </div>
                        )}

                        {recordType === 'scheduled' && schedules.length > 0 && (
                            <div>
                                <label className="block text-gray-700">Select Scheduled Vaccination</label>
                                <select
                                    name="scheduleId"
                                    value={formData.scheduleId}
                                    onChange={handleScheduleChange}
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                    required
                                >
                                    <option value="">Choose a vaccination schedule</option>
                                    {schedules.map((schedule: any) => (
                                        <option key={schedule._id} value={schedule._id}>
                                            {schedule.vaccineName} - {new Date(schedule.scheduledDate).toLocaleDateString()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {recordType === 'new' && (
                            <div>
                                <label className="block text-gray-700">Vaccine/Infection/Prevention</label>
                                <input
                                    type="text"
                                    name="vaccineName"
                                    value={formData.vaccineName}
                                    onChange={handleChange}
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-gray-700">Date Administered</label>
                            <input  
                                type="date"
                                name="dateAdministered"
                                value={formData.dateAdministered}
                                onChange={handleChange}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                disabled={recordType === 'scheduled' && formData.scheduleId !== ""}
                                required    
                            />
                        </div>

                        {recordType === 'new' && !fetchingVets && vets.length > 0 && (
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

                        {recordType === 'new' && !fetchingVets && vets.length === 0 && (
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

                        {recordType === 'new' && !fetchingVets && ((useExternalVet && vets.length > 0) || vets.length === 0) && (
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
                            {loading ? "Recording..." : recordType === 'scheduled' ? "Complete Vaccination" : "Record Vaccination"}   
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Vaccinate;