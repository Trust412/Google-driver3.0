import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const location = useLocation();

  // Loading state
  if (isLoading) {
    return <div>Loading...</div>; // You can also add a spinner or skeleton here
  }

  // Check if user is not authenticated
  if (!isAuthenticated) {
    // Redirect to login, storing the intended path
    loginWithRedirect({
      appState: {
        returnTo: location.pathname + location.search, // Save current URL
      },
    });

    // Show a message or a loading state while redirecting
    return <div>Redirecting to login...</div>; // Optional user feedback
  }

  // If authenticated, render the children
  return <>{children}</>;
};

export default PrivateRoute;
