import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import styled from 'styled-components';

const ProfileContainer = styled.div`
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 1100;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const ProfileButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: white;
    border: none;
    border-radius: 9999px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
`;

const LogoutButton = styled.button`
    position: absolute;
    top: 120%;
    right: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);

    ${ProfileContainer}:hover & {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }

    &:hover {
        background-color: #fee2e2;
        color: #dc2626;
    }
`;

const UserProfileCorner = ({ userData }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <ProfileContainer>
            <ProfileButton>
                <FaUserCircle className="w-6 h-6 text-gray-600" />
                <span className="text-gray-700 font-medium">
                    {userData?.username || 'User'}
                </span>
            </ProfileButton>
            <LogoutButton onClick={handleLogout}>
                <FaSignOutAlt className="w-5 h-5" />
                <span>Logout</span>
            </LogoutButton>
        </ProfileContainer>
    );
};

export default UserProfileCorner; 