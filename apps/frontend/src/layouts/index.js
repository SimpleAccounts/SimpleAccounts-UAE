import lazyLoad from '../utils/lazyLoad';

const InitialLayout = lazyLoad(() => import('./initial'));
const AdminLayout = lazyLoad(() => import('./admin'));

export {
  InitialLayout,
  AdminLayout
}