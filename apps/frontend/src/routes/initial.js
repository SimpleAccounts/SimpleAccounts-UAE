// Import lazy-loaded components for routes
import { LogInTwo } from 'screens';
// Import module objects (not lazy-loaded) to access .screen property
import { LogIn, ResetPassword, Register, NewPassword } from 'screens/routes';

const initialRoutes = [
  {
    path: '/login',
    name: 'LogIn',
    component: LogIn.screen,
  },
  {
    path: '/logout',
    name: 'LogInTwo',
    component: LogInTwo,
  },
  {
    path: '/reset-password',
    name: 'Reset Password',
    component: ResetPassword.screen,
  },
  {
    path: '/new-password',
    name: 'New Password',
    component: NewPassword.screen,
  },
  {
    path: '/register',
    name: 'Register',
    component: Register.screen,
  },
  {
    redirect: true,
    path: '/',
    pathTo: '/login',
    name: 'Initial',
  },
];

export default initialRoutes;
