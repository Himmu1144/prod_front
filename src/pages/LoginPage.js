import React, { useState, useContext } from 'react';
import { Card, Form, Button, Container, Alert } from 'react-bootstrap';
import { User, Lock } from "lucide-react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

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
      const response = await axios.post('https://obc.work.gd/api/token/login/', formData);
      
      if (response.data.token) {
        // Store token and user info
        login(response.data.token);
        localStorage.setItem('user', JSON.stringify({
          username: formData.username
        }));
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
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '400px' }} className="shadow">
        <Card.Body className="p-4">
          {/* Logo */}
          <div className="text-center mb-4">
            <img
              src="https://onlybigcars.com/wp-content/uploads/2024/11/OnlyBigCars-Logo.png"
              width="210"
              className="d-inline-block align-top"
              alt="OnlyBigCars"
            />
          </div>

          <h2 className="text-center mb-2">Welcome Back</h2>
          <p className="text-center text-muted mb-4">Please sign in to continue</p>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3 position-relative">
              <div className="position-relative">
                <Form.Control
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  style={{ paddingLeft: '40px' }}
                  required
                />
                <User 
                  className="position-absolute text-muted"
                  size={20}
                  style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-4 position-relative">
              <div className="position-relative">
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ paddingLeft: '40px' }}
                  required
                />
                <Lock 
                  className="position-absolute text-muted"
                  size={20}
                  style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </Form.Group>

            <Button type="submit" variant='dark' className="w-100">
              Sign In
            </Button>
          </Form>

         
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginPage;