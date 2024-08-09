import { useAuthCheck } from '../../hooks/useAuthCheck';
import { Box, Header } from '@kvib/react';
import { Link as ReactRouterLink, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { API_URL_LOGIN } from '../../api/apiConfig';

export const ProtectedRoute = () => {
  const isAuthenticated = useAuthCheck();

  useEffect(() => {
    if (isAuthenticated === false) {
      window.location.href = API_URL_LOGIN;
    }
  }, [isAuthenticated]);

  if (isAuthenticated === null || !isAuthenticated) {
    return null;
  }

  return (
    <Box backgroundColor={'gray.50'} height={'100vh'}>
      <Header logoLinkProps={{ as: ReactRouterLink }} />
      <Outlet />
    </Box>
  );
};
