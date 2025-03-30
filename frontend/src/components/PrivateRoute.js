import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const PrivateRoute = ({ children, adminOnly = false }) => {
    const navigate = useNavigate();
    const [isValidating, setIsValidating] = useState(true);
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setIsValidating(false);
                return;
            }

            try {
                // Set the token in axios headers
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                // Verify token with backend
                const response = await axios.get('http://localhost:5000/auth/verify-token');
                
                // Update user data from backend response
                if (response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
            } catch (error) {
                console.error('Token validation failed:', error);
                toast.error('Your session has expired. Please log in again.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                delete axios.defaults.headers.common['Authorization'];
                navigate('/login');
            } finally {
                setIsValidating(false);
            }
        };

        validateToken();
    }, [token, navigate]);

    if (isValidating) {
        return <div>Loading...</div>; // Or a loading spinner
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Check admin access if required
    if (adminOnly && user.role !== 'admin') {
        console.log('User role:', user.role); // Debug log
        toast.error('Access denied. Admin privileges required.');
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default PrivateRoute; 