import { Header } from '@kvib/react';
import {
  Outlet,
  Link as ReactRouterLink,
  createBrowserRouter,
} from 'react-router-dom';
import FrontPage from './pages/FrontPage';
import { MainTableComponent } from './pages/TablePage';

const router = createBrowserRouter([
  {
    element: (
      <>
        <Header logoLinkProps={{ as: ReactRouterLink }} />
        <Outlet />
      </>
    ),
    children: [
      {
        path: '/team/:teamName',
        element: <MainTableComponent />,
      },
      {
        path: '/:teamName/:schemaid',
        element: <MainTableComponent />,
      },
      {
        path: '/',
        element: <FrontPage />,
      },
    ],
  },
]);

export default router;
