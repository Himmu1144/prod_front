import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ element: Component, ...rest }) => {
  const { token } = useContext(AuthContext);

  return token ? <Component {...rest} /> : <Navigate to="/login" />;
};

export default PrivateRoute;
