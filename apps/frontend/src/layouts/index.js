import lazyLoad from '../utils/lazyLoad';

const InitialLayout = lazyLoad(() => import('./initial/index.js'));
const AdminLayout = lazyLoad(() => import('./admin/index.js'));

export { InitialLayout, AdminLayout };
