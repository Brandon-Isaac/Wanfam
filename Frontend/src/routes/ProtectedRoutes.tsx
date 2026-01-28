import { Navigate } from "react-router-dom";
import { JSX } from "react/jsx-runtime";
import { useAuth } from "../contexts/AuthContext";
import FloatingChatbot from "../components/FloatingChatbot";

interface ProtectedRoutesProps {
  children: JSX.Element;
}

const ProtectedRoutes = ({ children }: ProtectedRoutesProps) => {
  const {user, loading} = useAuth();

  if (loading) {
    return (  
    <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
      );
  }

  return user ? (
    <>
      {children}
      <FloatingChatbot />
    </>
  ) : <Navigate to="/login" />;
};

export default ProtectedRoutes;