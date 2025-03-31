import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import api from '@/apis/axiosInterceptor';

const PrivateRoutes = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirectToLogin, setRedirectToLogin] = useState<boolean>(false);
  const location = useLocation(); // Get the current route/path

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await api.get(`/auth/token/verify`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        if (response.data.role) {
          setUserRole(response.data.role); // Assuming your backend sends the role
        } else {
          setRedirectToLogin(true);
        }
      } catch (error) {
        console.log('Error fetching role:', error);
        alert('Failed to fetch user role.');
        setRedirectToLogin(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (redirectToLogin !== false) {
    const currentPath = location.pathname;
    if (currentPath.startsWith('/secure-sehan-admin')) {
      return <Navigate to="/secure-sehan-admin/login" />;
    } else {
      return <Navigate to="/login" />;
    }
  }

  // Check route-based authorization
  const isTeacherPage = location.pathname.startsWith('/secure-sehan-admin');

  // If user accesses teacher page but role not teacher
  if (isTeacherPage && userRole !== 'teacher') {
    return <Navigate to="/secure-sehan-admin/login" />;
  }

  if (!isTeacherPage && userRole !== 'student') {
    // If user is not a student
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default PrivateRoutes;
