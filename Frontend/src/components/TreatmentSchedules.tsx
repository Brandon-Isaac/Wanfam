import React,{useState, useEffect} from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/Api";

const TreatmentSchedules = () => {
    const [searchParams] = useSearchParams();
    const [TreatmentScheduled, setTreatmentScheduled] = useState<any>({});
    const [filteredSchedules, setFilteredSchedules] = useState<any>([]);
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get("/treatments/schedules/assigned");
                setTreatmentScheduled(response.data.data);
                
                // Get filter from URL params
                const filterParam = searchParams.get('filter') || 'all';
                setActiveFilter(filterParam);
                applyFilter(response.data.data, filterParam);
            } catch (error) {
                setError("Failed to load treatment schedules.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [searchParams]);

    const applyFilter = (schedules: any[], filter: string) => {
        if (!schedules || schedules.length === 0) {
            setFilteredSchedules([]);
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Backend status values: 'scheduled', 'treated', 'missed'
        const completedStatuses = ['treated', 'missed'];

        let filtered = [];

        switch(filter) {
            case 'today':
                filtered = schedules.filter((schedule: any) => {
                    const scheduleDate = new Date(schedule.scheduledDate);
                    scheduleDate.setHours(0, 0, 0, 0);
                    const isScheduled = schedule.status?.toLowerCase() === 'scheduled';
                    return scheduleDate.getTime() === today.getTime() && isScheduled;
                });
                break;
            case 'missed':
                filtered = schedules.filter((schedule: any) => {
                    const scheduleDate = new Date(schedule.scheduledDate);
                    const isScheduled = schedule.status?.toLowerCase() === 'scheduled';
                    return scheduleDate < today && isScheduled;
                });
                break;
            case 'upcoming':
                filtered = schedules.filter((schedule: any) => {
                    const scheduleDate = new Date(schedule.scheduledDate);
                    const isScheduled = schedule.status?.toLowerCase() === 'scheduled';
                    return scheduleDate >= tomorrow && isScheduled;
                });
                break;
            case 'all':
            default:
                filtered = schedules;
                break;
        }

        setFilteredSchedules(filtered);
    };

    const handleFilterChange = (filter: string) => {
        setActiveFilter(filter);
        applyFilter(TreatmentScheduled, filter);
        navigate(`/treatment-schedules?filter=${filter}`);
    };

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
          
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
                onClick={() => handleFilterChange('all')}
                className={`px-4 py-2 font-medium transition-colors ${
                    activeFilter === 'all'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-blue-600'
                }`}
            >
                All ({TreatmentScheduled.length || 0})
            </button>
            <button
                onClick={() => handleFilterChange('today')}
                className={`px-4 py-2 font-medium transition-colors ${
                    activeFilter === 'today'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-blue-600'
                }`}
            >
                Today's Appointments
            </button>
            <button
                onClick={() => handleFilterChange('missed')}
                className={`px-4 py-2 font-medium transition-colors ${
                    activeFilter === 'missed'
                        ? 'border-b-2 border-orange-600 text-orange-600'
                        : 'text-gray-600 hover:text-orange-600'
                }`}
            >
                Missed
            </button>
            <button
                onClick={() => handleFilterChange('upcoming')}
                className={`px-4 py-2 font-medium transition-colors ${
                    activeFilter === 'upcoming'
                        ? 'border-b-2 border-green-600 text-green-600'
                        : 'text-gray-600 hover:text-green-600'
                }`}
            >
                Upcoming
            </button>
          </div>
          
            {filteredSchedules.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                    {activeFilter === 'all' ? 'No treatment schedules available.' : `No ${activeFilter} appointments.`}
                </p>
            ) : (
               <div className="space-y-4">
                   {filteredSchedules.map((schedule: any) => (
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