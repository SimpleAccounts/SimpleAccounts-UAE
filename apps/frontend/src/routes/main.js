import {
  InitialLayout,
  AdminLayout
} from 'layouts'

const mainRoutes = [
  { path: '/admin', name: 'AdminLayout', component: AdminLayout },
  { path: '/', name: 'InitialLayout', component: InitialLayout }
]

export default mainRoutes
