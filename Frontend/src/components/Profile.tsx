import api from "../utils/Api";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    type profile = {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        preferredLanguage: string;
        role: string;
    };
const [profile,setProfile]=useState<profile | null>(null);
const user =useAuth();
const [loading,setLoading]=useState(true);
const [error,setError]=useState<string | null>(null);
const navigate=useNavigate();

useEffect(()=>{
    fetchProfile();
},[]);

const fetchProfile=async()=>{
    try{
        const response=await api.get('/auth/profile');
        setProfile(response.data.user);
        setLoading(false);
    }catch(error){
        console.error('Failed to fetch profile:',error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        setLoading(false);
    }
};

    return (
        <div className="flex justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <div className="flex flex-row justify-between">
                <h2 className="text-2xl font-bold mb-6 text-center">User Profile</h2>
             <button
              onClick={() => navigate('/dashboard')}
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
                            <strong>Full Name:</strong> {profile?.firstName} {profile?.lastName}
                        </div>
                        <div>
                            <strong>Email:</strong> {profile?.email}
                        </div>
                        <div>
                            <strong>Phone:</strong> {profile?.phone}
                        </div>
                        <div>
                            <strong>Preferred Language:</strong> {profile?.preferredLanguage}
                        </div>
                        <div>
                            <strong>Role:</strong> {profile?.role}
                        </div>
                        <button onClick={()=>navigate('/profile/edit')}
                         className="text-blue-500 hover:text-blue-900 transition-colors duration-200">
                            <i className="fas fa-user-edit"></i> Update Profile
                        </button>
                    </div>
                
                )}
            </div>
        </div>
    );
};

export default Profile;