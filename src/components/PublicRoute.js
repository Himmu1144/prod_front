import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PublicRoute = ({ element: Component, ...rest }) => {
  const { token } = useContext(AuthContext);

  return !token ? <Component {...rest} /> : <Navigate to="/" />;
};

export default PublicRoute;
