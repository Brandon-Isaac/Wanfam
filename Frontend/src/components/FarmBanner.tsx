import { useAuth } from '../contexts/AuthContext';

const FarmBanner = ({ userRole, farmDetails }: { userRole: string; farmDetails: any }) => {
    const { user } = useAuth();
    return (
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 mb-8 text-white">
          <i >
            {user?.firstName} {user?.lastName}!
          </i>
        <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900">Welcome to {farmDetails.farmName} dashboard!</h2>
        <p className="text-gray-600">Here you can monitor and manage all aspects of your farm.</p>
        </div>
        </div>
    );
};

export default FarmBanner;