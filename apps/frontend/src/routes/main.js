import { InitialLayout, AdminLayout } from 'layouts';
import ProtectedRoute from '../components/ProtectedRoute';

// Wrap AdminLayout with ProtectedRoute
const AdminLayoutComponent = AdminLayout.screen;
const ProtectedAdminLayout = () => (
  <ProtectedRoute>
    <AdminLayoutComponent />
  </ProtectedRoute>
);

const mainRoutes = [
  { path: '/admin/*', name: 'AdminLayout', component: ProtectedAdminLayout },
  { path: '/*', name: 'InitialLayout', component: InitialLayout.screen },
];

export default mainRoutes;
