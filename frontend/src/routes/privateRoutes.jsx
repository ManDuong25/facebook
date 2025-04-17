import ProfilePage from '../pages/ProfilePage';
import FriendsPage from '../pages/FriendsPage';
import DefaultLayout from '../layouts/DefaultLayout';
import HomeLayout from '../layouts/HomeLayout';

export const privateRoutes = [
    {
        path: '/profile',
        component: ProfilePage,
        layout: DefaultLayout,
    },
    {
        path: '/profile/:id',
        component: ProfilePage,
        layout: DefaultLayout,
    },
    {
        path: '/friends',
        component: FriendsPage,
        layout: HomeLayout,
    },
];
