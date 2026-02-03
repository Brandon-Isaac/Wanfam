import api from "../utils/Api";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";

interface AssignedAnimal {
  _id: string;
  tagId: string;
  name: string;
  species: string;
  breed: string;
  gender: string;
  age: number;
  healthStatus: string;
  weight: number;
}

const AssignedAnimals = () => {
  const { showToast } = useToast();
  const [assignedAnimals, setAssignedAnimals] = useState<AssignedAnimal[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [weight, setWeight] = useState<{ [key: string]: number }>({});
    const [healthStatus, setHealthStatus] = useState<{ [key: string]: string }>({});
    const [milkProducedToday, setMilkProducedToday] = useState<{ [key: string]: number | null }>({});
    const [revenueToday, setRevenueToday] = useState<{ [key: string]: number | null }>({});

       const fetchAssignedAnimals = async () => {
      try {
        const response = await api.get(`/livestock/assigned/`);
        setAssignedAnimals(response.data.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch assigned animals.");
        setLoading(false);
        }
    }; 

    const fetchMilkProducedToday = async (animalId: string) => {
        try {
            const response = await api.get(`/products/${animalId}/milk/today`);
            return {
                milk: response.data.data?.totalMilk?.amount || 0,
                revenue: response.data.data?.totalRevenue?.amount || 0
            };
        } catch (err) {
            console.error(`Failed to fetch milk produced today for animal ${animalId}:`, err);
            return { milk: 0, revenue: 0 };
        }
    };

  useEffect(() => {
    fetchAssignedAnimals();
  }, []);

  useEffect(() => {
    const fetchMilkData = async () => {
      for (const animal of assignedAnimals) {
        const milkData = await fetchMilkProducedToday(animal._id);
        setMilkProducedToday((prevState) => ({
          ...prevState,
          [animal._id]: milkData.milk,
        }));
        setRevenueToday((prevState) => ({
          ...prevState,
          [animal._id]: milkData.revenue,
        }));
      }
    };

    if (assignedAnimals.length > 0) {
      fetchMilkData();
    }
  }, [assignedAnimals]);

    const handleUpdate = async (animalId: string) => {
        try {
            const updatedData = {
                weight: weight[animalId],
                healthStatus: healthStatus[animalId],
            };
            await api.put(`livestock/${animalId}/`, updatedData);
            showToast("Animal data updated successfully.", "success");
        } catch (err) {
            showToast("Failed to update animal data.", "error");
        }
    };
    if (loading) {
        return(
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32 mb-4"></div>
                    <h2 className="text-xl font-semibold">Loading...</h2>
                    <p className="text-gray-500">Please wait while we fetch your assigned animals.</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600">Error</h2>
                    <p className="text-gray-500">{error}</p>
                </div>
            </div>
        )
    }

    return (
    <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold mb-4">Assigned Animals</h1>
        <Link to ="/dashboard" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Back to Dashboard
        </Link>
        </div>
      {assignedAnimals.length === 0 ? (
        <p>No animals assigned to you.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedAnimals.map((animal) => (
                <div key={animal._id} className="border rounded-lg p-4 shadow">
                    <h2 className="text-xl font-semibold mb-2">{animal.name.toLocaleUpperCase()} ({animal.tagId})</h2>
                    <p><strong>Species:</strong> {animal.species.toLocaleUpperCase()}</p>
                    <p><strong>Breed:</strong> {animal.breed.toLocaleUpperCase()}</p>
                    <div className="mb-2">
                        <label className="block font-medium mb-1">Weight (kg):</label>
                        <input
                            type="number"   
                            className="w-full border rounded px-2 py-1"
                            value={weight[animal._id] || animal.weight}
                            onChange={(e) => setWeight({ ...weight, [animal._id]: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block font-medium mb-1">Health Status:</label>
                        <select
                            className="w-full border rounded px-2 py-1"
                            value={healthStatus[animal._id] || animal.healthStatus}
                            onChange={(e) => setHealthStatus({ ...healthStatus, [animal._id]: e.target.value })}
                        >
                            <option value="healthy">Healthy</option>
                            <option value="sick">Sick</option>
                            <option value="quarantined">Quarantined</option>
                            <option value="deceased">Deceased</option>
                        </select>
                        {/* Possible statuses: 'healthy', 'sick', 'quarantined', 'deceased' */}
                    </div>
                    
                      {(animal.gender === 'female' && (animal.species.toLowerCase() === 'cattle' || animal.species.toLowerCase() === 'goat')) && (
                        <>
                        <div className="mb-2 p-2 bg-green-50 rounded border border-green-200">
                            <p className="text-sm font-medium text-gray-700">Today's Production:</p>
                            <p className="text-lg font-bold text-green-700">{milkProducedToday[animal._id] ?? 0} liters</p>
                            {revenueToday[animal._id] && revenueToday[animal._id]! > 0 && (
                                <p className="text-sm text-green-600">Revenue: KES {revenueToday[animal._id]?.toFixed(2)}</p>
                            )}
                        </div>
                       <Link to ={`/${animal._id}/milk-production`}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-2 inline-block"
                       >
                        Record Milk Production
                       </Link>
                       </>
                    )}
                    <br />
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                        onClick={() => handleUpdate(animal._id)}
                    >
                        Update
                    </button>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default AssignedAnimals;