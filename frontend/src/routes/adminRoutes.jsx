import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import PostManagementPage from '../pages/admin/PostManagementPage';
import AdminLayout from '../layouts/AdminLayout';

export const adminRoutes = [
  {
    path: '/admin',
    component: AdminDashboardPage,
    layout: AdminLayout,
  },
  {
    path: '/admin/users',
    component: UserManagementPage,
    layout: AdminLayout,
  },
  {
    path: '/admin/posts',
    component: PostManagementPage,
    layout: AdminLayout,
  },
];
