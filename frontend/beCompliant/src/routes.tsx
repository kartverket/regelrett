import { Box, Header } from '@kvib/react';
import {
  Outlet,
  Link as ReactRouterLink,
  createBrowserRouter,
} from 'react-router-dom';
import { ActivityPage } from './pages/ActivityPage';
import FrontPage from './pages/FrontPage';

const router = createBrowserRouter([
  {
    element: (
      <Box backgroundColor={'gray.50'} height={'100vh'}>
        <Header logoLinkProps={{ as: ReactRouterLink, marginLeft: '2' }} />
        <Outlet />
      </Box>
    ),
    children: [
      {
        path: '/team/:teamName',
        element: <ActivityPage />,
      },
      {
        path: '/table/:tableId/:teamName',
        element: <ActivityPage />,
      },
      {
        path: '/',
        element: <FrontPage />,
      },
    ],
  },
]);

export default router;
