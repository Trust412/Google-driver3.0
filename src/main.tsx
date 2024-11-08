import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App.tsx';
// import AuthWrapper from './components/AuthWrapper.tsx';
import PrivateRoute from './components/PrivateRoute.tsx';
import './index.css';
import { BrowserRouter as Router } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-5m8b0eg42lx56rov.us.auth0.com"
      clientId="8d7bbb639VsmNL7aw0qTLAAsF9OYNdVQ"
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
      <Router>
        <App />
      </Router>
    </Auth0Provider>
  </StrictMode>
);