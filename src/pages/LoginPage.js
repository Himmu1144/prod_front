import React, { useState, useContext } from 'react';
import { Card, Form, Button, Container, Alert } from 'react-bootstrap';
import { User, Lock } from "lucide-react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import obcLogo from '../assets/images/OBC-logo_main.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any existing errors
    try {
      const response = await axios.post('https://admin.onlybigcars.com/api/token/login/', formData);
      
      if (response.data.token) {
        // Store token and user info
        login(response.data.token);
        localStorage.setItem('user', JSON.stringify({
          username: formData.username
        }));

        // Set initial active status
        await axios.post(
          'https://admin.onlybigcars.com/api/update-status/',
          { status: 'active' },
          { headers: { 'Authorization': `Token ${response.data.token}` }}
      );

        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.status === 400) {
        setError('Invalid username or password');
      } else if (err.response?.data?.non_field_errors) {
        setError(err.response.data.non_field_errors[0]);
      } else {
        setError('An error occurred during login. Please try again.');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Container 
      className="d-flex align-items-center justify-content-center px-2 px-sm-3" 
      style={{ minHeight: '100vh' }}
    >
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: '450px',
          minHeight: 'auto'
        }} 
        className="shadow"
      >
        <Card.Body className="p-4 p-sm-5">
          {/* Logo */}
          <div className="text-center mb-4 mb-sm-5">
            <img
              src={obcLogo}
              style={{
                width: '100%',
                maxWidth: '200px',
                height: 'auto'
              }}
              className="d-inline-block align-top"
              alt="OnlyBigCars"
            />
          </div>

          <h2 
            className="text-center mb-3" 
            style={{ 
              fontSize: 'clamp(1.8rem, 5vw, 2.2rem)',
              fontWeight: '600'
            }}
          >
            Welcome Back
          </h2>
          <p 
            className="text-center text-muted mb-4 mb-sm-5"
            style={{ 
              fontSize: 'clamp(1rem, 3.5vw, 1.1rem)'
            }}
          >
            Please sign in to continue
          </p>

          {error && <Alert variant="danger" className="mb-4" style={{ fontSize: 'clamp(0.9rem, 3vw, 1rem)' }}>{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4 position-relative">
              <div className="position-relative">
                <Form.Control
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  style={{ 
                    paddingLeft: '50px',
                    fontSize: 'clamp(1rem, 4vw, 1.1rem)',
                    height: 'clamp(50px, 12vw, 56px)',
                    borderRadius: '8px'
                  }}
                  required
                />
                <User 
                  className="position-absolute text-muted"
                  size={window.innerWidth <= 576 ? 20 : 24}
                  style={{ 
                    left: '15px', 
                    top: '50%', 
                    transform: 'translateY(-50%)' 
                  }}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-4 mb-sm-5 position-relative">
              <div className="position-relative">
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ 
                    paddingLeft: '50px',
                    fontSize: 'clamp(1rem, 4vw, 1.1rem)',
                    height: 'clamp(50px, 12vw, 56px)',
                    borderRadius: '8px'
                  }}
                  required
                />
                <Lock 
                  className="position-absolute text-muted"
                  size={window.innerWidth <= 576 ? 20 : 24}
                  style={{ 
                    left: '15px', 
                    top: '50%', 
                    transform: 'translateY(-50%)' 
                  }}
                />
              </div>
            </Form.Group>

            <Button 
              type="submit" 
              variant='dark' 
              className="w-100"
              style={{
                fontSize: 'clamp(1.1rem, 4vw, 1.2rem)',
                height: 'clamp(52px, 13vw, 58px)',
                fontWeight: '600',
                borderRadius: '8px'
              }}
            >
              Sign In
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <style jsx>{`
        @media (max-width: 576px) {
          .container {
            padding-left: 12px;
            padding-right: 12px;
          }
        }
      `}</style>
    </Container>
  );
};

export default LoginPage;