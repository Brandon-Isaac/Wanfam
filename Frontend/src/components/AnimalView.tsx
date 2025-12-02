import api from "../utils/Api";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";

const AnimalView = () => {
const [animal,setAnimal]=useState<any>(null);
const [loading,setLoading]=useState(true);
const [error,setError]=useState<string | null>(null);
const navigate=useNavigate();
const { farmId, animalId } = useParams();


useEffect(()=>{
    fetchAnimal();
},[]);

const fetchAnimal=async()=>{
    try{
        const response=await api.get(`/livestock/${farmId}/animals/${animalId}`);
        setAnimal(response.data.data);
        setLoading(false);
    }catch(error){
        console.error('Failed to fetch animal:',error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        setLoading(false);
    }
};

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <div className="flex flex-row justify-between">
                <h2 className="text-2xl font-bold mb-6 text-center">Animal Details</h2>
             <button
              onClick={() => navigate(`/${farmId}/livestock`)}
              className="text-gray-500 hover:text-red-100 transition-colors duration-200"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
            </div>
                {loading ? (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading profile...</p>
                    </div>
                ) : error ? (
                    <div className="text-center">
                        <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                        <p className="text-gray-600">{error}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <strong>Name:</strong> {animal?.name}
                        </div>
                        <div>
                            <strong>Species:</strong> {animal?.species}
                        </div>
                        <div>
                            <strong>Health Status:</strong> {animal?.healthStatus}
                        </div>
                        <div>
                            <strong>Breed:</strong> {animal?.breed}
                        </div>
                        <div>
                            <strong>Gender:</strong> {animal?.gender}
                        </div>
                        <div>
                            <strong>Weight:</strong> {animal?.weight} kg
                        </div>
                        <div>
                            <strong>Age:</strong> {animal?.age} years
                        </div>
                        <div>
                            <strong>Assigned Worker:</strong> {animal?.assignedWorker ? `${animal.assignedWorker.firstName} ${animal.assignedWorker.lastName}` : 'Unassigned'}
                        </div>
                        <hr />
                        <button onClick={()=>navigate(`/${farmId}/livestock/${animalId}/edit`)}
                         className="text-blue-500 hover:text-blue-900 transition-colors duration-200">
                            <i className="fas fa-user-edit"></i> Update Animal
                        </button>
                        <br/>
                        <button onClick={()=>navigate(`/${farmId}/livestock/${animalId}/vaccinate`)}
                         className="text-purple-500 hover:text-purple-900 transition-colors duration-200">
                            <i className="fas fa-plus-circle"></i> Vaccinate
                        </button>
                     
                    </div>
                
                )}
            </div>
        </div>
    );
};

export default AnimalView;