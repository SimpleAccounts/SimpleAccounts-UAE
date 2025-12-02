import { LogIn, ResetPassword, Register, LogInTwo,NewPassword } from 'screens';

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
