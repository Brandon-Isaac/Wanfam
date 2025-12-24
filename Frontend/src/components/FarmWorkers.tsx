import React, {useState, useEffect} from "react";
import api from "../utils/Api";
import { useParams } from "react-router-dom";

const FarmWorkers = () => {
    const { farmId } = useParams();
    const [workers, setWorkers] = useState([]);

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const response = await api.get(`/workers/${farmId}`);
                setWorkers(response.data.data);
                console.log(response.data.data);
            } catch (error) {
                console.error("Error fetching workers:", error);
            }
        };

        fetchWorkers();
    }, [farmId]);

    return (
        <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6 flex justify-end">
         <button 
                onClick={() => window.location.href = `/farms/${farmId}/workers/employ`}
                className="mt-6 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
                Employ Worker
            </button>

            <button 
                onClick={() => window.location.href = `/farms/${farmId}/workers/create`}
                className="ml-4 mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
                Create Worker
            </button>

            <button
                onClick={() => window.location.href = `/farms/${farmId}/workers/dismiss`}
                className="ml-4 mt-6 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
                Dismiss Worker
            </button>

        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
       
            <h2 className="text-2xl font-semibold mb-4">Farm Workers</h2>
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">First Name</th>
                        <th className="py-2 px-4 border-b">Last Name</th>
                        <th className="py-2 px-4 border-b">Email</th>
                        <th className="py-2 px-4 border-b">Phone</th>
                    </tr>
                </thead>
                <tbody>
                    {workers.map((worker: any) => (
                        <tr key={worker.id}>
                            <td className="py-2 px-4 border-b">{worker.firstName}</td>
                            <td className="py-2 px-4 border-b">{worker.lastName}</td>
                            <td className="py-2 px-4 border-b">{worker.email}</td>
                            <td className="py-2 px-4 border-b">{worker.phone}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </div>
    );
};

export default FarmWorkers;