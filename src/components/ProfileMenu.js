import React, { useContext, useEffect, useState } from 'react';
import { Offcanvas } from 'react-bootstrap';
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// Import car images - same as in header.js
import loknath from '../assets/images/loknath.jpg'; // Adjust path as needed
import anjali from '../assets/images/anjali.jpg'; // Adjust path as needed

const ProfileMenu = ({ show, handleClose }) => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const { logout, token, user } = useContext(AuthContext);
    
    // Fetch the current username from API when component mounts
    useEffect(() => {
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        try {
            const response = await axios.get('https://admin.onlybigcars.com/api/leads/search/', {
                headers: { 'Authorization': `Token ${token}` }
            });
            setUsername(response.data.current_username);
        } catch (error) {
            console.error('Error fetching user info:', error);
            // Fallback to localStorage if API fails
            const localUser = JSON.parse(localStorage.getItem('user') || '{}');
            setUsername(localUser.username || 'User');
        }
    };

    const renderProfileIcon = () => {
        const lowerUsername = username.toLowerCase();
        const imageStyle = {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%'
        };
        
        if (lowerUsername === 'loknath') {
            return <img src={loknath} alt="loknath" style={imageStyle} />;
        } else if (lowerUsername === 'anjali') {
            return <img src={anjali} alt="anjali" style={imageStyle} />;
        } else {
            return <FaUser size={40} className="text-gray-500" />;
        }
    };
    
    const handleLogout = async () => {
        try {
            await axios.post('https://admin.onlybigcars.com/api/token/logout/', {}, {
                headers: {
                    Authorization: `Token ${localStorage.getItem('token')}`
                }
            });
            logout();
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    return (
        <Offcanvas show={show} onHide={handleClose} placement="end">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Profile</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        {renderProfileIcon()}
                    </div>
                    <h5 className="text-lg font-semibold">{username || 'User'}</h5>
                </div>

                <div className="space-y-4">
                    <button className="w-full text-left px-4 py-2 flex items-center space-x-3 hover:bg-gray-100 rounded-lg">
                        <FaUser className="text-gray-600" />
                        <span>My Profile</span>
                    </button>
                    <button className="w-full text-left px-4 py-2 flex items-center space-x-3 hover:bg-gray-100 rounded-lg">
                        <FaCog className="text-gray-600" />
                        <span>Settings</span>
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 flex items-center space-x-3 hover:bg-gray-100 rounded-lg text-red-500"
                    >
                        <FaSignOutAlt />
                        <span>Logout</span>
                    </button>
                </div>
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default ProfileMenu;
