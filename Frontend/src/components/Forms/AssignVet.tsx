import React from "react";
import api from "../../utils/Api";
import { useState,useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const AssignVet = () => {
    const [vets, setVets] = useState([]);
    const [selectedVet, setSelectedVet] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const {farmId} = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVets = async () => {
            try {
                const response = await api.get("/vets/available");
                setVets(response.data.data);
                setLoading(false);
            } catch (err: any) {
                setError(err.message || "Error fetching vets");
                setLoading(false);
            }
        };

        fetchVets();
    }, []);

    const handleAssignVet = async (e: React.FormEvent, selectedVet: string, farmId: string | undefined) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage("");
        try {
            await api.post(`/vets/add-farm`, { vetId: selectedVet, farmId });
            setSuccessMessage("Vet assigned successfully!");
            navigate(`/${farmId}/vets`);
        } catch (err: any) {
            setError(err.message || "Error assigning vet");
        }
    };

        if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                </div>
            </div>
        );
    }
        if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center text-red-500">
                    <p>Error: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Assign Vet to Farm</h2>
            {successMessage && (
                <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
                    {successMessage}
                </div>
            )}
            {vets.length === 0 && (
                <div className="mb-4 p-4 bg-yellow-100 text-yellow-700 rounded">
                    No available vets to assign.
                </div>
            )}
            <form onSubmit={(e)=>{
                handleAssignVet(e, selectedVet, farmId);
            }}
            className="space-y-4">
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="vet">
                        Select Vet:
                    </label>
                    <select
                        id="vet"
                        value={selectedVet}
                        onChange={(e) => setSelectedVet(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        disabled={vets.length === 0}
                    >
                        <option value="">Select a vet</option>
                        {vets.map((vet: any) => (
                            <option key={vet._id} value={vet._id}
                            className="p-2 border-b border-gray-200">
                                {vet.firstName} {vet.lastName}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={vets.length === 0 || !selectedVet}
                    className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
                >
                    Assign Vet
                </button>
            </form>
            <button
                onClick={() => navigate(`/${farmId}/vets`)}
                className="w-full mt-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
            >
                Cancel
            </button>
        </div>
    );
};

export default AssignVet;