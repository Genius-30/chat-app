import { useEffect } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  console.log(isAuthenticated, user.isVerified);

  useEffect(() => {
    if (!isAuthenticated || !user.isVerified) {
      toast.error("Please login and verify to access this page.");
    }
  }, [isAuthenticated, user.isVerified]);

  if (!isAuthenticated || !user.isVerified) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
