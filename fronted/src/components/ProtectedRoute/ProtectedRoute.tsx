import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: number;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    const verifyAuth = async () => {
      if (!token) {
        setIsAuthorized(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/me/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          
          if (!requiredRole || userData.role_id === requiredRole) {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        setIsAuthorized(false);
      }
    };

    verifyAuth();
  }, [token, requiredRole]);

  if (isAuthorized === null) {
    return <div>Loading...</div>; 
  }

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;