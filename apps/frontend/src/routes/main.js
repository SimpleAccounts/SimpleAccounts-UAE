import { InitialLayout, AdminLayout } from 'layouts';
import ProtectedRoute from '../components/ProtectedRoute';
import { ComponentLibrary } from 'screens';

// Wrap AdminLayout with ProtectedRoute
const AdminLayoutComponent = AdminLayout.screen;
const ProtectedAdminLayout = () => (
  <ProtectedRoute>
    <AdminLayoutComponent />
  </ProtectedRoute>
);

const mainRoutes = [
  // Standalone theme reference page (no layout)
  { path: '/theme-reference', name: 'ThemeReference', component: ComponentLibrary.screen },
  { path: '/admin/*', name: 'AdminLayout', component: ProtectedAdminLayout },
  { path: '/*', name: 'InitialLayout', component: InitialLayout.screen },
];

export default mainRoutes;
