import api from "../../utils/Api";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext";

const MilkProduction = () => {
    const { animalId } = useParams();
    const { showToast } = useToast();
    const [animal, setAnimal] = useState<any>(null);
    const [milkData, setMilkData] = useState<{ animalId: string; date: string; amount:number; unit:'litres'| 'gallons'; timeOfDay: 'morning' | 'afternoon' | 'evening' }[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<{ [key: string]: number }>({});
    const navigate = useNavigate();
   
    useEffect(() => {
        const fetchAnimal = async () => {
            try {
                const response = await api.get(`/livestock/${animalId}`);
                setAnimal(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch animal:", error);
                setError(error instanceof Error ? error.message : "An unexpected error occurred");
                setLoading(false);
            }
        };

        fetchAnimal();
    }, [animalId]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>, animalId: string) => {
        const { value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [animalId]: Number(value),
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.FormEvent<HTMLButtonElement>, animalId: string) => {
        e.preventDefault();
        try {
            const milkEntry = {
                animalId: animalId,
                date: new Date().toISOString().split('T')[0],
                amount: formData[animalId],
                unit: 'liters',
                timeOfDay: 'morning',
            };
            await api.post(`/products/${animalId}/milk`, milkEntry);
            showToast("Milk production data submitted successfully.", "success");
            setFormData((prevData) => ({
                ...prevData,
                [animalId]: 0,
            }));
        }
        catch (error) {
            console.error("Failed to submit milk production data:", error);
            showToast("Failed to submit milk production data. Please try again.", "error");
        }
    };
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">Loading...</div>
        );
    }
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">Error: {error}</div>
        );
    }
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <div className="flex flex-row justify-between">
                    <h2 className="text-2xl font-bold mb-6 text-center">Milk Production</h2>
                     <Link
                        to={`/assigned-animals`}
                        className="text-gray-500 hover:text-red-100 transition-colors duration-200"
                        ><i className="fas fa-times text-xl"></i>

                        </Link>
                </div>
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4">{animal?.name}</h3>
                    <p className="text-sm text-gray-600 mb-6">Tag ID: {animal?.tagId}</p>
                   </div>

                <form onSubmit={(e) => handleSubmit(e, animalId!)}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2" htmlFor="milkAmount">
                            Milk Produced (litres)
                        </label>
                        <input
                            type="number"
                            id="milkAmount"
                            name="milkAmount"
                            value={formData[animalId!] || ''}
                            onChange={(e) => handleInputChange(e, animalId!)}
                            className="w-full border border-gray-300 rounded-md p-2"
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2" htmlFor="date">
                            Time of Entry
                        </label>
                        <select
                            id="timeOfDay"
                            name="timeOfDay"
                            className="w-full border border-gray-300 rounded-md p-2"
                        >
                            <option value="morning">Morning</option>
                            <option value="afternoon">Afternoon</option>
                            <option value="evening">Evening</option>
                        </select>
                    </div>
                    <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                            onClick={() => navigate(`/assigned-animals`)}
                            >Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default MilkProduction;