import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { axiosFetch } from '../api/Fetch';
import { API_URL_AUTH_STATUS } from '../api/apiConfig';

type AuthStatus = {
  authenticated: boolean;
};

export const useAuthCheck = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();
  const authStatusUrl = API_URL_AUTH_STATUS;

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axiosFetch<AuthStatus>({
          url: authStatusUrl,
        });
        setIsAuthenticated(response.data.authenticated);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, [location]);

  return isAuthenticated;
};
