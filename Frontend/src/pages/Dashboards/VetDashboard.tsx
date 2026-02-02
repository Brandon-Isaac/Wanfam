import { useEffect } from "react";
import api from "../../utils/Api";
import { useState } from "react";
import { Link } from "react-router-dom";
import VetEarnings from "../../components/VetEarnings";

const VeterinaryDashboard = () => {
    const [stats, setStats] = useState<any>({});
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get("/dashboard/veterinary-dashboard");
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching veterinary dashboard data:", error);
            }
        };

        fetchData();
    }, []);

  return (
    <div>
      {/* Earnings Section */}
      <div className="mb-8">
        <VetEarnings />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link
          to="/treatment-schedules?filter=today"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-all hover:border hover:border-blue-400 cursor-pointer"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <i className="fas fa-calendar-check text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayAppointmentsCount || 0}</p>
            </div>
          </div>
        </Link>

        <Link
          to="/vaccinations"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-all hover:border hover:border-red-400 cursor-pointer"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <i className="fas fa-exclamation-triangle text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vaccination Cases</p>
              <p className="text-2xl font-bold text-gray-900">{stats.vaccinationCases || 0}</p>
            </div>
          </div>
        </Link>

        <Link
          to="/treatment-schedules?filter=upcoming"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-all hover:border hover:border-green-400 cursor-pointer"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <i className="fas fa-syringe text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Treatments Due</p>
              <p className="text-2xl font-bold text-gray-900">{stats.treatmentCases || 0}</p>
            </div>
          </div>
        </Link>

        <Link
          to="/treatment-schedules?filter=missed"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-all hover:border hover:border-orange-400 cursor-pointer"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <i className="fas fa-clock text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Missed Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.missedAppointments || 0}</p>
            </div>
          </div>
        </Link>
      </div>

<div className="flex flex-row justify-between space-x-6">
      <div className="bg-white rounded-lg shadow p-6 w-2/3">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Upcoming Appointments</h2>
        {/* Appointment list can be added here */}
        <div className="space-y-4">
            {stats.upcomingAppointments && stats.upcomingAppointments.length > 0 ? (
                stats.upcomingAppointments.map((appointment: any, index: number) => (
                    <div key={index} className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">Farm: {appointment.farmName}</p>
                        <p className="text-sm text-gray-600">Animal ID: {appointment.animalId}</p>
                        <p className="text-sm text-gray-600">Date: {new Date(appointment.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600">Purpose: {appointment.purpose}</p>
                        <p className="text-sm text-gray-600">Type: {appointment.type}</p>
                    </div>
                ))
            ) : (
                <p className="text-sm text-gray-600">No upcoming appointments.</p>
            )}
        </div>
        </div>
            <div className="space-y-6">
          {/* Quick Actions */}
         <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <Link
                to={`/treatment-schedules`}
                className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <i className="fas fa-briefcase-medical text-green-600 text-2xl mb-2"></i>
                <span className="text-sm font-medium text-green-800">Treatments</span>
              </Link>
              <Link
                to="/vaccinations"
                className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <i className="fas fa-syringe text-blue-600 text-2xl mb-2"></i>
                <span className="text-sm font-medium text-blue-800">Vaccinations</span>
              </Link>
              <Link
                to="/chatbot"
                className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <i className="fas fa-comments text-purple-600 text-2xl mb-2"></i>
                <span className="text-sm font-medium text-purple-800">Chatbot</span>
              </Link>
              <Link
                to="/profile"
                className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <i className="fas fa-user text-red-600 text-2xl mb-2"></i>
                <span className="text-sm font-medium text-red-800">User Profile</span>
              </Link>
            </div>
          </div>
          </div>
      </div>
    </div>
  );
};

export default VeterinaryDashboard;