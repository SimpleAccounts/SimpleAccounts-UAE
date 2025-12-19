import {
  InitialLayout,
  AdminLayout
} from 'layouts'
import ProtectedRoute from '../components/ProtectedRoute'

// Wrap AdminLayout with ProtectedRoute
const ProtectedAdminLayout = () => (
  <ProtectedRoute>
    <AdminLayout />
  </ProtectedRoute>
)

const mainRoutes = [
  { path: '/admin/*', name: 'AdminLayout', component: ProtectedAdminLayout },
  { path: '/*', name: 'InitialLayout', component: InitialLayout }
]

export default mainRoutes
