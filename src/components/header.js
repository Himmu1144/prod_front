import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Container, Nav, Button, Dropdown } from 'react-bootstrap';
import { FaUser } from 'react-icons/fa';
import ProfileMenu from './ProfileMenu';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './header.css';

// Import car images
import blueCarImg from '../assets/images/blue-car.png'; // Adjust path as needed
import yellowCarImg from '../assets/images/yellow-car.png'; // Adjust path as needed

const Header = () => {
    const { token, user } = useContext(AuthContext);    
    const [status, setStatus] = useState('Active');
    const [statusTime, setStatusTime] = useState(null);
    const [statusHistory, setStatusHistory] = useState({});
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [username, setUsername] = useState('');

    // Fetch initial status and user info when component mounts
    useEffect(() => {
        fetchUserStatus();
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        try {
            const response = await axios.get('https://admin.onlybigcars.com/api/leads/search/', {
                headers: { 'Authorization': `Token ${token}` }
            });
            setUsername(response.data.current_username.toLowerCase());
        } catch (error) {
            console.error('Error fetching user info:', error);
            // If the endpoint doesn't exist, try to get username from AuthContext
            if (user && user.username) {
                setUsername(user.username.toLowerCase());
            }
        }
    };

    const fetchUserStatus = async () => {
        try {
            const response = await axios.get('https://admin.onlybigcars.com/api/user-status/', {
                headers: { 'Authorization': `Token ${token}` }
            });
            setStatus(response.data.status);
            setStatusTime(new Date(response.data.timestamp));
            setStatusHistory(response.data.history);
        } catch (error) {
            console.error('Error fetching status:', error);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const response = await axios.post(
                'https://admin.onlybigcars.com/api/update-status/',
                { status: newStatus },
                { headers: { 'Authorization': `Token ${token}` }}
            );
            
            setStatus(newStatus);
            setStatusTime(new Date(response.data.timestamp));
            fetchUserStatus(); // Refresh status history
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    // Determine which icon to show based on username
    const renderProfileIcon = () => {
        if (username === 'shreyans') {
            return <img src={blueCarImg} alt="blue Car" style={{ width: '24px', height: '24px' }} />;
        } else if (username === 'shreya') {
            return <img src={yellowCarImg} alt="Yellow Car" style={{ width: '24px', height: '24px' }} />;
        } else {
            return <FaUser />;
        }
    };

    return (
        <>
            <Navbar bg="light" variant="light" expand="lg" sticky="top">
                <Container fluid>
                    <Navbar.Brand as={Link} to="/">
                        <img
                            src="https://onlybigcars.com/wp-content/uploads/2024/11/OnlyBigCars-Logo.png"
                            width="210"
                            className="d-inline-block align-top"
                            alt="OnlyBigCars"
                        />
                    </Navbar.Brand>
                    
                    <Nav className="me-auto"></Nav>

                    <Dropdown className="drop-down-container">
                        <Dropdown.Toggle 
                            variant={status === 'Active' ? 'danger' : 'warning'} 
                            id="dropdown-basic" 
                            className='dropdown-btn'
                        >
                            {status} 
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item 
                                onClick={() => handleStatusChange('Active')}
                                active={status === 'Active'}
                            >
                                Active
                            </Dropdown.Item>
                            <Dropdown.Item 
                                onClick={() => handleStatusChange('Break')}
                                active={status === 'Break'}
                            >
                                Break
                            </Dropdown.Item>
                            <Dropdown.Item 
                                onClick={() => handleStatusChange('Lunch')}
                                active={status === 'Lunch'}
                            >
                                Lunch
                            </Dropdown.Item>
                            <Dropdown.Item 
                                onClick={() => handleStatusChange('Training')}
                                active={status === 'Training'}
                            >
                                Training
                            </Dropdown.Item>
                            <Dropdown.Item 
                                onClick={() => handleStatusChange('Meeting')}
                                active={status === 'Meeting'}
                            >
                                Meeting
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                
                    <Button 
                        variant="outline-danger" 
                        className="ms-2 rounded-circle profile-btn"
                        style={{width: '40px', height: '40px', padding: '6px'}}
                        onClick={() => setShowProfileMenu(true)}
                    >
                        {renderProfileIcon()}
                    </Button>
                </Container>
            </Navbar>

            <ProfileMenu 
                show={showProfileMenu} 
                handleClose={() => setShowProfileMenu(false)} 
            />
        </>
    );
};

// Helper function to format timestamp
const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

export default Header;