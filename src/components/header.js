import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Container, Nav, Button, Dropdown } from 'react-bootstrap';
import { FaUser } from 'react-icons/fa';
import ProfileMenu from './ProfileMenu';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './header.css';

const Header = () => {
    const { token } = useContext(AuthContext);
    const [status, setStatus] = useState('Active');
    const [statusTime, setStatusTime] = useState(null);
    const [statusHistory, setStatusHistory] = useState({});
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Fetch initial status when component mounts
    useEffect(() => {
        fetchUserStatus();
    }, []);

    const fetchUserStatus = async () => {
        try {
            const response = await axios.get('https://obc.work.gd/api/user-status/', {
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
                'https://obc.work.gd/api/update-status/',
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
                            </Dropdown.Menu>
                        </Dropdown>

                    
                        <Button 
                            variant="outline-danger" 
                            className="ms-2 rounded-circle profile-btn"
                            style={{width: '40px', height: '40px', padding: '6px'}}
                            onClick={() => setShowProfileMenu(true)}
                        >
                            <FaUser />
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