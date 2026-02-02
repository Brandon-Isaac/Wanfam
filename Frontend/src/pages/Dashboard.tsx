import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/Api';
import FarmerDashboard from '../pages/Dashboards/FarmerDashboard';
import VeterinaryDashboard from '../pages/Dashboards/VetDashboard';
import WorkerDashboard from '../pages/Dashboards/WorkerDashboard';
import LoanOfficerDashboard from '../pages/Dashboards/LoanOfficerDashboard';
import AdminDashboard from '../pages/Dashboards/AdminDashboard';
import WelcomeBanner from '../components/WelcomeBanner';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [stats, setStats] = useState({});
  const [farmDetails, setFarmDetails] = useState({});

  const params = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Fetch user role and additional data
      const response = await api.get('/auth/profile');
      const userData = response.data;
     
      
      setUserRole(userData.user.role || 'farmer');

       
      // If user is a farmer and no farmId, redirect to farm selection
    //   if (userData.user.role === 'farmer' && !farmId) {
    //     navigate('/farms/select');
    //     return;
    //   }
      
      // // Fetch farm details if farmId exists
      // if (farmId) {
      //   try {
      //     const farmResponse = await api.get(`/farms/${farmId}`);
      //     setFarmDetails(farmResponse.data.data);
      //   } catch (error) {
      //     console.error('Error fetching farm details:', error);
      //   }
      // }
      
      // Fetch role-specific stats
      let statsResponse;
      if (userData.user.role === 'farmer') {
        statsResponse = await api.get(`/dashboard/farmer-dashboard/`);
      } else {
        statsResponse = await api.get(`/dashboard/${userData.user.role}-dashboard/`);
      }
      setStats(statsResponse.data);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };


  const renderRoleDashboard = () => {
    
    switch (userRole) {
      case 'veterinary':
        return <VeterinaryDashboard />;
      case 'worker':
        return <WorkerDashboard/>;
      case 'loanOfficer':
        return <LoanOfficerDashboard />;
      case 'admin':
        return <AdminDashboard/>;
      case 'farmer':
      default:
        return <FarmerDashboard/>;
    }
  };

  if (loading) {
 return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       <WelcomeBanner userRole={userRole} farmDetails={farmDetails} />
        {/* Role-specific Dashboard Content */}
        {renderRoleDashboard()}
      </main>
    </div>
  );
};

export default Dashboard;