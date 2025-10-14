import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import AuthLayout from '../layout/AuthLayout';
import Login from '../pages/auth/Login';
import DashboardPage from '../pages/dashboard/Dashboard';
import DashboardLayout from '../layout/DashboardLayout';
import CustomerPage from '../pages/customer/CustomerPage';
import PolicyPage from '../pages/policy/PolicyPage';
import CustomerSegmentPage from '../pages/segment/CustomerSegment';

// To have type-safe and error-free routing with nested layouts, prefer using `element` and JSX over `Component` with props.
// This approach matches RouteObject typings in react-router-dom.

const routes = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'auth',
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: <Login />,
          },
        ],
      },
      {
        path: 'dashboard',
        element: <DashboardLayout />,
        children: [
          {
            path: '',
            element: <DashboardPage />,
          },
          {
            path: 'customer',
            element: <CustomerPage />,
          },
          {
            path: 'policy',
            element: <PolicyPage />,
          },
          {
            path: 'segment',
            element: <CustomerSegmentPage />,
          },
        ],
      },
    ],
  },
];

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter(routes, {
  basename: import.meta.env.VITE_APP_BASE_NAME
});

export default router;
