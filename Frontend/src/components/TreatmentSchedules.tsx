import React,{useState, useEffect} from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/Api";

const TreatmentSchedules = () => {
    const [TreatmentScheduled, setTreatmentScheduled] = useState<any>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get("/treatments/schedules/assigned");
                setTreatmentScheduled(response.data.data);
            } catch (error) {
                console.error("Error fetching treatment schedules:", error);
                setError("Failed to load treatment schedules.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if(loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
            </div>
        );
    }

    if(error) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold mb-4">Treatment Schedules</h2>
            <button
                onClick={() => navigate("/dashboard")}
                className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            >
              Back To Dashboard
          </button>
          </div>
            {TreatmentScheduled.length === 0 ? (
                <p>No treatment schedules available.</p>
            ) : (
               <div className="space-y-4">
                   {TreatmentScheduled.map((schedule: any) => (
                       <div key={schedule._id} className="p-4 border rounded-lg shadow-sm">
                            <h3 className="text-lg font-medium mb-2">Animal name: {schedule.animalId.name}</h3>
                            <p className="mb-1 text-gray-600">Species: {schedule.animalId.breed} {schedule.animalId.species}</p>
                            <p className="mb-1 text-gray-600">Treatment: {schedule.scheduleName}</p>
                            <p className="mb-1 text-gray-600">Scheduled Date: {new Date(schedule.scheduledDate).toLocaleDateString()}</p>
                            <p className="mb-1 text-gray-600">Status: {schedule.status}</p>
                             <button
                              onClick={() => navigate(`/treatment-schedules/treat/${schedule._id}`)}
                              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                              Treat Animal
                          </button>
                          </div>
                         
                     ))}
                </div>
            )}
        </div>
    );
}

export default TreatmentSchedules;