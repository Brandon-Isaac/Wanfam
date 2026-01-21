import api from "../../utils/Api";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Vaccinate = () => {
    const { farmId, animalId } = useParams();
    const [formData, setFormData] = useState({
        vaccineName: "",
        dateAdministered: "",
        veterinarian: "",
        notes: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await api.post(`/livestock/${farmId}/animals/${animalId}/vaccinations`, formData);
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
                    <div>
                        <label className="block text-gray-700">Veterinarian</label>
                       <input
                            type="text"
                            name="veterinarian"
                            value={formData.veterinarian}
                            onChange={handleChange}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
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