import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaEdit, FaKey, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import axios from 'axios';

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
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 9999px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        background: rgba(255, 255, 255, 0.15);
    }
`;

const DropdownMenu = styled.div`
    position: absolute;
    top: 120%;
    right: 0;
    min-width: 200px;
    background: rgba(30, 30, 30, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    overflow: hidden;
    transition: all 0.2s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: ${props => props.isOpen ? 'block' : 'none'};
    opacity: ${props => props.isOpen ? '1' : '0'};
    transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(-10px)'};
`;

const MenuItem = styled.button`
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    color: white;
    font-size: 0.875rem;
    text-align: left;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.1);
    }

    &.danger:hover {
        background: rgba(220, 38, 38, 0.2);
        color: #fee2e2;
    }
`;

const Divider = styled.div`
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin: 0.25rem 0;
`;

const FormInput = styled.input`
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.375rem;
    color: white;
    font-size: 0.875rem;

    &::placeholder {
        color: rgba(255, 255, 255, 0.5);
    }

    &:focus {
        outline: none;
        border-color: rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.15);
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
`;

const UserProfileCorner = ({ userData }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const dropdownRef = useRef(null);
    const [formData, setFormData] = useState({
        name: userData?.name || '',
        username: userData?.username || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setIsEditingName(false);
                setIsEditingUsername(false);
                setIsChangingPassword(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const handleUpdateProfile = async (type) => {
        try {
            const token = localStorage.getItem('token');
            let endpoint = '';
            let data = {};

            switch (type) {
                case 'name':
                    endpoint = '/api/users/update-name';
                    data = { name: formData.name };
                    break;
                case 'username':
                    endpoint = '/api/users/update-username';
                    data = { username: formData.username };
                    break;
                case 'password':
                    if (formData.newPassword !== formData.confirmPassword) {
                        toast.error('New passwords do not match');
                        return;
                    }
                    endpoint = '/api/users/change-password';
                    data = {
                        currentPassword: formData.currentPassword,
                        newPassword: formData.newPassword
                    };
                    break;
                default:
                    return;
            }

            const response = await axios.post(`http://localhost:5000${endpoint}`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully`);
                if (type === 'username') {
                    const user = JSON.parse(localStorage.getItem('user'));
                    user.username = formData.username;
                    localStorage.setItem('user', JSON.stringify(user));
                }
                setIsEditingName(false);
                setIsEditingUsername(false);
                setIsChangingPassword(false);
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || `Failed to update ${type}`);
        }
    };

    return (
        <ProfileContainer ref={dropdownRef}>
            <ProfileButton onClick={() => setIsOpen(!isOpen)}>
                <FaUserCircle className="w-6 h-6 text-white" />
                <span className="text-white font-medium">
                    {userData?.username || 'User'}
                </span>
            </ProfileButton>
            <DropdownMenu isOpen={isOpen}>
                {isEditingName ? (
                    <div className="p-3">
                        <FormInput
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter new name"
                        />
                        <ButtonGroup>
                            <MenuItem onClick={() => handleUpdateProfile('name')}>Save</MenuItem>
                            <MenuItem onClick={() => setIsEditingName(false)}>Cancel</MenuItem>
                        </ButtonGroup>
                    </div>
                ) : (
                    <MenuItem onClick={() => setIsEditingName(true)}>
                        <FaEdit className="w-4 h-4" />
                        Edit Name
                    </MenuItem>
                )}

                {isEditingUsername ? (
                    <div className="p-3">
                        <FormInput
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder="Enter new username"
                        />
                        <ButtonGroup>
                            <MenuItem onClick={() => handleUpdateProfile('username')}>Save</MenuItem>
                            <MenuItem onClick={() => setIsEditingUsername(false)}>Cancel</MenuItem>
                        </ButtonGroup>
                    </div>
                ) : (
                    <MenuItem onClick={() => setIsEditingUsername(true)}>
                        <FaUser className="w-4 h-4" />
                        Change Username
                    </MenuItem>
                )}

                {isChangingPassword ? (
                    <div className="p-3">
                        <FormInput
                            type="password"
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                            placeholder="Current password"
                        />
                        <FormInput
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            placeholder="New password"
                        />
                        <FormInput
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            placeholder="Confirm new password"
                        />
                        <ButtonGroup>
                            <MenuItem onClick={() => handleUpdateProfile('password')}>Save</MenuItem>
                            <MenuItem onClick={() => setIsChangingPassword(false)}>Cancel</MenuItem>
                        </ButtonGroup>
                    </div>
                ) : (
                    <MenuItem onClick={() => setIsChangingPassword(true)}>
                        <FaKey className="w-4 h-4" />
                        Change Password
                    </MenuItem>
                )}

                <Divider />
                <MenuItem onClick={handleLogout} className="danger">
                    <FaSignOutAlt className="w-4 h-4" />
                    Logout
                </MenuItem>
            </DropdownMenu>
        </ProfileContainer>
    );
};

export default UserProfileCorner; 