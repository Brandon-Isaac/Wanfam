import api from "../../utils/Api";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Veterinarian {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
}

interface VaccinationSchedule {
    _id: string;
    scheduleName: string;
    vaccinationTime: string;
    veterinarianId?: string;
    veterinarianName?: string;
    notes?: string;
    status: 'scheduled' | 'completed' | 'missed';
    createdAt: string;
    animalId?: string | { _id: string; name: string; [key: string]: any };
}

const Vaccinate = () => {
    const { farmId, animalId } = useParams();
    const [formData, setFormData] = useState({
        scheduleName: "",
        vaccinationTime: "",
        veterinarianId: "",
        veterinarianName: "",
        notes: ""
    });
    const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
    const [scheduledVaccinations, setScheduledVaccinations] = useState<VaccinationSchedule[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fetchingVets, setFetchingVets] = useState(true);
    const [fetchingSchedules, setFetchingSchedules] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVeterinarians = async () => {
            try {
                const response = await api.get(`/vets/${farmId}`);
                setVeterinarians(response.data.data || []);
            } catch (error) {
                console.error("Failed to fetch veterinarians:", error);
            } finally {
                setFetchingVets(false);
            }
        };

        const fetchScheduledVaccinations = async () => {
            try {
                const response = await api.get(`/vaccination/schedules/${farmId}`);
                const allSchedules = response.data.schedules || [];
                // Filter schedules for this specific animal
                const animalSchedules = allSchedules.filter((schedule: any) => {
                    const scheduleAnimalId = typeof schedule.animalId === 'object' 
                        ? schedule.animalId?._id 
                        : schedule.animalId;
                    return scheduleAnimalId === animalId;
                });
                setScheduledVaccinations(animalSchedules);
            } catch (error) {
                console.error("Failed to fetch vaccination schedules:", error);
            } finally {
                setFetchingSchedules(false);
            }
        };

        fetchVeterinarians();
        fetchScheduledVaccinations();
    }, [farmId, animalId]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "veterinarianId") {
            if (value === "my-own-vet") {
                setFormData(prev => ({ ...prev, veterinarianId: "", veterinarianName: "" }));
            } else {
                const selectedVet = veterinarians.find(v => v._id === value);
                setFormData(prev => ({ 
                    ...prev, 
                    veterinarianId: value,
                    veterinarianName: selectedVet ? `${selectedVet.firstName} ${selectedVet.lastName}` : ""
                }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await api.post(`/vaccination/schedules/${farmId}/${animalId}`, formData);
            navigate(`/${farmId}/livestock/${animalId}`);
        } catch (error) {
            setError(error instanceof Error ? error.message : "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Scheduled Vaccinations Section */}
                {fetchingSchedules ? (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <p className="text-gray-600">No scheduled vaccinations</p>
                    </div>
                ) : scheduledVaccinations.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <h2 className="text-xl font-bold mb-4">Scheduled Vaccinations</h2>
                        <div className="space-y-3">
                            {scheduledVaccinations.map((schedule) => (
                                <div 
                                    key={schedule._id} 
                                    className={`p-4 rounded-lg border-2 ${
                                        schedule.status === 'completed' 
                                            ? 'border-green-300 bg-green-50' 
                                            : schedule.status === 'missed' 
                                            ? 'border-red-300 bg-red-50' 
                                            : 'border-blue-300 bg-blue-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg">{schedule.scheduleName}</h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                <span className="font-medium">Date:</span> {new Date(schedule.vaccinationTime).toLocaleDateString()}
                                            </p>
                                            {schedule.veterinarianName && (
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Veterinarian:</span> {schedule.veterinarianName}
                                                </p>
                                            )}
                                            {schedule.notes && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    <span className="font-medium">Notes:</span> {schedule.notes}
                                                </p>
                                            )}
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            schedule.status === 'completed' 
                                                ? 'bg-green-500 text-white' 
                                                : schedule.status === 'missed' 
                                                ? 'bg-red-500 text-white' 
                                                : 'bg-blue-500 text-white'
                                        }`}>
                                            {schedule.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* New Vaccination Form */}
                <div className="bg-white p-8 rounded-lg shadow-md"> 
                <h2 className="text-2xl font-bold mb-6 text-center">Schedule Vaccination</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700">Schedule Name</label>
                        <input
                            type="text"
                            name="scheduleName"
                            value={formData.scheduleName}
                            onChange={handleChange}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Date</label>
                        <input  
                            type="date"
                            name="vaccinationTime"
                            value={formData.vaccinationTime}
                            onChange={handleChange}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                            required    
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Veterinarian</label>
                        <select
                            name="veterinarianId"
                            value={formData.veterinarianId || (formData.veterinarianName && !formData.veterinarianId ? "my-own-vet" : "")}
                            onChange={handleChange}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                            disabled={fetchingVets}
                        >
                            <option value="">
                                {fetchingVets ? "Loading veterinarians..." : "Select a veterinarian"}
                            </option>
                            {veterinarians.map((vet) => (
                                <option key={vet._id} value={vet._id}>
                                    {vet.firstName} {vet.lastName} - {vet.email}
                                </option>
                            ))}
                            <option value="my-own-vet">My Own Vet</option>
                        </select>
                    </div>
                    {!formData.veterinarianId && (
                        <div>
                            <label className="block text-gray-700">Vet Name</label>
                            <input
                                type="text"
                                name="veterinarianName"
                                value={formData.veterinarianName}
                                onChange={handleChange}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                placeholder="Enter your vet's name"
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
        </div>
    );
}

export default Vaccinate;