import { useAuth } from '../contexts/AuthContext';

const WelcomeBanner = ({ userRole, farmDetails }: { userRole: string; farmDetails: any }) => {
    const { user } = useAuth();
    return (
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 mb-8 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome, {user?.firstName}!
          </h1>
          <p className="opacity-90">
            {userRole === 'farmer' && farmDetails && 'Manage your livestock and track farm productivity.'}
            {userRole === 'veterinary' && 'Monitor animal health and schedule appointments.'}
            {userRole === 'worker' && 'View your assigned tasks and update progress.'}
            {userRole === 'loan_officer' && 'Review loan applications and farmer records.'}
            {userRole === 'admin' && 'Manage system users and monitor platform performance.'}
          </p>
        </div>
    );
};

export default WelcomeBanner;