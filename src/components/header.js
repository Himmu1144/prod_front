import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Container, Nav, Button, Dropdown } from 'react-bootstrap';
import { FaUser } from 'react-icons/fa';
import ProfileMenu from './ProfileMenu';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './header.css';

// Import car images
import loknath from '../assets/images/loknath.jpg'; // Adjust path as needed
import anjali from '../assets/images/anjali.jpg'; // Adjust path as needed

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
            const response = await axios.get('http://localhost:8000/api/leads/search/', {
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
            const response = await axios.get('http://localhost:8000/api/user-status/', {
                headers: { 'Authorization': `Token ${token}` }
            });
            setStatus(response.data.status);
            setStatusTime(new Date(response.data.timestamp));
            setStatusHistory(response.data.history);
        } catch (error) {
            console.error('Error fetching status:', error);
        }
    };

    // const handleStatusChange = async (newStatus) => {
    //     try {
    //         const response = await axios.post(
    //             'http://localhost:8000/api/update-status/',
    //             { status: newStatus },
    //             { headers: { 'Authorization': `Token ${token}` }}
    //         );
            
    //         setStatus(newStatus);
    //         setStatusTime(new Date(response.data.timestamp));
    //         fetchUserStatus(); // Refresh status history
    //     } catch (error) {
    //         console.error('Error updating status:', error);
    //     }
    // };

    const handleStatusChange = async (newStatus) => {
        try {
            const response = await axios.post(
                'http://localhost:8000/api/update-status/',
                { status: newStatus },
                { headers: { 'Authorization': `Token ${token}` }}
            );
            
            // Check if response message is 'invalid_count'
            if (response.data.count === 'invalid_count') {
                alert(response.data.message);
            } else {
                // Refresh the page instead of showing alert
                window.location.reload();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            
            // Handle errors
            if (error.response && error.response.data) {
                if (error.response.data.message) {
                    alert(error.response.data.message);
                } else {
                    alert('Failed to update status');
                }
            }
        }
    };
    // Determine which icon to show based on username
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
                    <Navbar.Toggle aria-controls="navbarScroll" />
                    <Navbar.Collapse id="navbarScroll">
                        <Nav
                            className="me-auto my-2 my-lg-0"
                            style={{ maxHeight: '100px' }}
                            navbarScroll
                        >  
                        </Nav>

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
                    </Navbar.Collapse>
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