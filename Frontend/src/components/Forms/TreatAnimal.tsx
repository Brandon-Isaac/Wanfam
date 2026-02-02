import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/Api";

const TreatAnimal = () => {
    const { scheduleId } = useParams<{ scheduleId: string }>();
    const [treatmentDetails, setTreatmentDetails] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        scheduleId: scheduleId || "",
        animalId: "",
        treatmentGiven: "",
        healthStatus: "",
        notes: "",
        dosage: "",
        date: "",
        status: "treated",
        cost: ""
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTreatmentDetails = async () => {
            try {
                const response = await api.get(`/treatments/schedules/${scheduleId}`);
                setTreatmentDetails(response.data.data);
                setFormData(prevState => ({
                    ...prevState,
                    animalId: response.data.data.animalId._id
                }));
            } catch (error) {
                setError("Failed to load treatment details.");
            } finally {
                setLoading(false);
            }
        };

        fetchTreatmentDetails();
    }, [scheduleId]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post(`/treatments/record/`, formData);
            await api.put(`/livestock/${treatmentDetails.animalId._id}/health-status/`, { healthStatus: formData.healthStatus });
            navigate("/treatment-schedules");
        } catch (error) {
            setError("Failed to submit treatment.");
        }
    };
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }
    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <div>
            <h2 className="text-2xl font-semibold mb-4">Treat Animal: {treatmentDetails.animalId.name} {treatmentDetails.animalId.breed} {treatmentDetails.animalId.species}</h2>
           <p className="text-gray-700">Schedule: {treatmentDetails.scheduleName} </p>
            <p className="text-gray-700 text-xs">Scheduled Date: {new Date(treatmentDetails.scheduledDate).toLocaleDateString()} </p>
           </div>
            <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
            >
                Back
            </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Treatment Given</label>
                    <input
                        type="text"
                        name="treatmentGiven"
                        value={formData.treatmentGiven}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Dosage in a day</label>
                    <input
                        type="text"
                        name="dosage"
                        value={formData.dosage}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Treatment Cost (KES) <span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        name="cost"
                        value={formData.cost}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="Enter treatment cost"
                        min="0"
                        step="0.01"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Health Status</label>
                    <select
                        name="healthStatus"
                        value={formData.healthStatus}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    >
                        <option value="">Select Status</option>
                        <option value="recovery">Recovery</option>
                        <option value="quarantined">Quarantined</option>
                        <option value="deceased">Deceased</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        rows={4}
                    ></textarea>
                </div>
                <div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Submit Treatment
                    </button>
                </div>
            </form>
        </div>
    );
}
export default TreatAnimal;