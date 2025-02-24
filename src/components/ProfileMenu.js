import React, { useContext } from 'react';
import { Offcanvas } from 'react-bootstrap';
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const ProfileMenu = ({ show, handleClose }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const { logout } = useContext(AuthContext);

    const handleLogout = async () => {
        try {
            await axios.post('https://obc.work.gd/api/token/logout/', {}, {
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
                        <FaUser size={40} className="text-gray-500" />
                    </div>
                    <h5 className="text-lg font-semibold">{user.username || 'User'}</h5>
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
