import api from "../../utils/Api";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ScheduleTreatment = () => {
    const { farmId, animalId } = useParams();
    const [treatmentDetails, setTreatmentDetails] = useState({
        animalId: animalId || "",
        scheduleName: "",
        scheduleDate: "",
        veterinarianId: "",
        notes: "",
    });
    const [healthStatus, setHealthStatus] = useState("treatment");
    const [veterinarians, setVeterinarians] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVeterinarians = async () => {
            try {
                const response = await api.get(`/vets/${farmId}`);
                setVeterinarians(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch veterinarians:", error);
                setError(error instanceof Error ? error.message : "An unexpected error occurred");
                setLoading(false);
            }
        };
        fetchVeterinarians();
    }, [farmId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTreatmentDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setHealthStatus("treatment")
            await api.post(`/treatments/${farmId}/schedule`, treatmentDetails);
            await api.put(`/livestock/${animalId}/health-status`, { healthStatus });
            navigate(`/farms/${farmId}/animals/sick`);
        } catch (error) {
            console.error("Failed to schedule treatment:", error);
            setError(error instanceof Error ? error.message : "An unexpected error occurred");
        }
    };

    if (loading) {
        return (
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading veterinarians...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center">
                <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                <p className="text-gray-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto bg-white p-8 rounded shadow">
            <h2 className="text-2xl font-bold mb-6 text-center">Schedule Treatment</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Treatment Name</label>
                    <input
                        type="text"
                        name="scheduleName"
                        value={treatmentDetails.scheduleName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Schedule Date</label>
                    <input
                        type="date"
                        name="scheduleDate"
                        value={treatmentDetails.scheduleDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Assign Veterinarian</label>
                    <select
                        name="veterinarianId"
                        value={treatmentDetails.veterinarianId}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded"
                        required
                    >
                        <option value="">Select a Veterinarian</option>
                        {veterinarians.map((vet) => (
                            <option key={vet._id} value={vet._id}>
                                {vet.firstName} {vet.lastName}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Notes</label>
                    <textarea
                        name="notes"
                        value={treatmentDetails.notes}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded"
                        rows={4}
                    ></textarea>
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Schedule Treatment
                </button>
            </form>
        </div>
    );
}
export default ScheduleTreatment;