import api from "../../utils/Api";
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import worker from "../../types/Worker";
import { useToast } from "../../contexts/ToastContext";

const UpdateAnimal = () => {
    const { showToast } = useToast();
    const [workers, setWorkers] = useState<worker[]>([]);
    const [animal, setAnimal] = useState<any>({});
        const { farmId, animalId } = useParams();
    const [formData, setFormData] = useState({
        name: '',
        assignedWorker: '',
        weight: '',
        healthStatus: '',
        notes: '',
        dateOfBirth: '',
        dateOfPurchase: '',
        species: '',
        breed: '',
        gender: ''
    });
    const fetchAnimal = async () => {
        try {
            const response = await api.get(`/livestock/${farmId}/animals/${animalId}`);
            setAnimal(response.data.data);
            setFormData({
                name: response.data.data.name || '',
                assignedWorker: response.data.data.assignedWorker || '',
                weight: response.data.data.weight || '',
                healthStatus: response.data.data.healthStatus || '',
                notes: response.data.data.notes || '',
                dateOfBirth: response.data.data.dateOfBirth ? response.data.data.dateOfBirth.split('T')[0] : '',
                dateOfPurchase: response.data.data.dateOfPurchase ? response.data.data.dateOfPurchase.split('T')[0] : '',
                species: response.data.data.species || '',
                breed: response.data.data.breed || '',
                gender: response.data.data.gender || ''
            });
        } catch (error) {
            console.error('Failed to fetch animal:', error);
            showToast('Failed to fetch animal. Please try again.', 'error');
        }
    };
        useEffect(() => {
        fetchWorkers();
        fetchAnimal();
    }, [farmId, animalId]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>| React.ChangeEvent<HTMLSelectElement>| React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put(`/livestock/${farmId}/animals/${animalId}`, formData);
            showToast('Animal updated successfully!', 'success');
            navigate(`/${farmId}/livestock/${animalId}`);
        } catch (error) {
            console.error('Failed to update animal:', error);
            showToast('Failed to update animal. Please try again.', 'error');
        }
    };
    const navigate = useNavigate();
   
    const fetchWorkers = async () => {
        try {
            const response = await api.get(`/workers/${farmId}`);
            setWorkers(response.data.data);
        } catch (error) {
            console.error('Failed to fetch workers:', error);
            showToast('Failed to fetch workers. Please try again.', 'error');
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="ttext-2xl font-bold mb-6 text-center">Update Animal</h2>
            <form onSubmit={handleSubmit} autoComplete="off">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="assignedWorker">Assigned Worker</label>
                    <select
                        id="assignedWorker"
                        name="assignedWorker"
                        value={formData.assignedWorker}
                        onChange={handleChange}
                         className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    >
                        <option value="">Select a worker</option>
                        {workers.map(worker => (
                            <option key={worker._id} value={worker._id}>
                                {worker.firstName} {worker.lastName}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="weight">Weight (kg)</label>
                    <input
                        type="number"
                        id="weight"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                         className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="healthStatus">Health Status</label>
                    <select
                        id="healthStatus"
                        name="healthStatus"
                        value={formData.healthStatus}
                        onChange={handleChange}
                         className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    >
                        <option value="">Select Health Status</option>
                        <option value="healthy">Healthy</option>
                        <option value="sick">Sick</option>
                        <option value="treatment">Treatment</option>
                        <option value="recovery">Recovery</option>
                        <option value="quarantined">Quarantined</option>
                        <option value="deceased">Deceased</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="notes">Notes</label>
                    <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="dateOfBirth">Birth Date</label>
                    <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                         className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="dateOfPurchase">Purchase Date</label>
                    <input
                        type="date"
                        id="dateOfPurchase"
                        name="dateOfPurchase"
                        value={formData.dateOfPurchase}
                        onChange={handleChange}
                         className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="type">Type</label>
                    <input
                        type="text"
                        id="species"
                        name="species"
                        value={formData.species}
                        onChange={handleChange}
                         className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="breed">Breed</label>
                    <input
                        type="text"
                        id="breed"
                        name="breed"
                        value={formData.breed}
                        onChange={handleChange}
                         className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="gender">
                        Gender
                    </label>
                    <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                         className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
                <div className="flex items-center justify-between">
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Update Animal
                </button>
                  <Link to ={`/${farmId}/livestock/${animalId}`}
                   className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                    Cancel
                </Link>
                </div>
            </form>
        </div>
    );
};
export default UpdateAnimal;