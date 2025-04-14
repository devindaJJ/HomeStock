import React, { useState, Fragment, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import { motion } from 'framer-motion';
import { Menu, Transition } from '@headlessui/react';
import { FaShoppingCart, FaClipboardList, FaBox, FaBell, FaHome, FaUserCog, FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';
import styled from 'styled-components';

const TopNav = styled.div`
  width: 100%;
  background-color: transparent;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  transition: top 0.3s, background-color 0.3s;
`;

const Logo = styled.div`
  font-size: 1.5em;
  cursor: pointer;
`;

const NavItems = styled.div`
  display: flex;
  justify-content: center;
  flex-grow: 1;
`;

const TopNavItem = styled.div`
  margin: 0 15px;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #34495e;
  }
`;

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isAdmin = token ? jwt_decode(token).role === 'admin' : false;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsMenuOpen(false);
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path ? 
            "border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium no-underline" :
            "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium no-underline";
    };

    const features = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Shopping List', path: '/shopping-list' },
        { name: 'Inventory', path: '/inventory' },
        { name: 'Stock Management', path: '/stock-management' },
        { name: 'Reminders', path: '/reminders' },
    ];

    const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
    const [visible, setVisible] = useState(true);

    const handleScroll = () => {
        const currentScrollPos = window.pageYOffset;
        setVisible(prevScrollPos > currentScrollPos);
        setPrevScrollPos(currentScrollPos);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [prevScrollPos, visible, handleScroll]);

    const isDarkPage = features.some(feature => location.pathname === feature.path);

    return (
        <TopNav style={{ top: visible ? '0' : '-60px', color: isDarkPage ? 'black' : 'white' }}>
            <Logo onClick={() => navigate('/')}>HomeStock</Logo>
            <NavItems>
                {features.map((feature) => (
                    <TopNavItem key={feature.path} onClick={() => navigate(feature.path)}>
                        {feature.name}
                    </TopNavItem>
                ))}
            </NavItems>
        </TopNav>
    );
};

export default Navbar; 