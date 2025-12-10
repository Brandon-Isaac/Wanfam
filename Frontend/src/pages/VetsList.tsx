import api from "../utils/Api";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import React from "react";

interface VET {
    _id: string;
    firstName: string;
    lastName: string;
    licenseNumber: string;
    specialization: string;
    phone: string;
    email: string;
    employeeId: string;
}

const VetsList = () => {
    const [vets, setVets] = useState<VET[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { farmId } = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        const fetchVets = async () => {
            try {
                const response = await api.get(`/vets/${farmId}`);
                setVets(response.data.data);
                setLoading(false);
            } catch (err: any) {
                setError(err.message || "Error fetching vets");
                setLoading(false);
            }
        };

        fetchVets();
    }, [farmId]);
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
                <div className="text-center text-red-500">{error}</div>
            </div>
        );
    }
    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold mb-4">Assigned Vets</h2>
            <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => navigate(`/farms/${farmId}/assign-vet`)}>
                Add Vet
            </button>
            <button className="mb-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={() => navigate(`/farms/${farmId}/dashboard`)}>
                Go to Dashboard
            </button> 
            </div>

            {vets.length === 0 ? (
                <p className="text-gray-600">No vets assigned to this farm.</p>
            ) : (
                <ul className="space-y-4">
                    {vets.map((vet: VET) => (
                        <li key={vet._id} className="p-4 border rounded-lg">
                            <h3 className="text-xl font-bold">{vet.firstName} {vet.lastName} </h3>
                            <p className="text-gray-600">License Number: {vet.licenseNumber}</p>
                            <p className="text-gray-600">Specialization: {vet.specialization}</p>
                            <p className="text-gray-600">Contact: {vet.phone} <br/> {vet.email}</p>
                            <p className="text-gray-600">Employee ID: {vet.employeeId}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
export default VetsList;