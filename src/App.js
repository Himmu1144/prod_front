import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import HomePage from './pages/HomePage';
import EditPage from './pages/EditPage';
import LoginPage from './pages/LoginPage';
import GraphPage from './components/GraphPage';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<PublicRoute element={LoginPage} />} />
                    <Route path="/" element={<PrivateRoute element={HomePage} />} />
                    <Route path="/edit" element={<PrivateRoute element={EditPage} />} />
                    <Route path="/edit/:id?" element={<PrivateRoute element={EditPage} />} />
                    <Route path="/analytics" element={<GraphPage />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
