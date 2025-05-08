import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Fragment } from 'react';
import { publicRoutes } from './routes/publicRoutes';
import DefaultLayout from './layouts/DefaultLayout';
import RouteWrapper from './routes/RouteWrapper';
import RouteAuthenticated from './routes/RouteAuthenticated';
import RouteProtected from './routes/RouteProtected';
import RouteAdmin from './routes/RouteAdmin';
import RouteAdminLogin from './routes/RouteAdminLogin';
import { privateRoutes } from './routes/privateRoutes';
import { adminRoutes } from './routes/adminRoutes';
import HomeLayout from './layouts/HomeLayout';
import Content from './components/Content/HomeContent/HomeContent';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import { ChatProvider } from './contexts/ChatContext';
import { ChatWindowContainer } from './components/Chat';
import Chatbot from './components/Chatbot/Chatbot';
import './App.css';

function App() {
    return (
        <ChatProvider>
            <>
                <BrowserRouter>
                    <Routes>
                        {/* Route trang chủ */}
                        <Route path="/" element={<RouteAuthenticated layout={HomeLayout} component={Content} />} />
                        {/* Route đăng nhập và đăng ký */}
                        <Route path="/login" element={<RouteProtected layout={null} component={LoginPage} />} />
                        <Route path="/register" element={<RouteProtected layout={null} component={RegisterPage} />} />

                        {/* Route admin login - Sử dụng RouteAdminLogin thay vì RouteProtected */}
                        <Route
                            path="/admin/login"
                            element={<RouteAdminLogin layout={null} component={AdminLoginPage} />}
                        />

                        {/* Admin routes */}
                        {adminRoutes.map((route, i) => {
                            const Page = route.component;
                            let Layout = route.layout;
                            if (route.layout === null) {
                                Layout = Fragment;
                            }
                            return (
                                <Route
                                    key={`admin-${i}`}
                                    path={route.path}
                                    element={<RouteAdmin layout={Layout} component={Page} />}
                                />
                            );
                        })}

                        {/* Private routes */}
                        {privateRoutes.map((route, i) => {
                            const Page = route.component;
                            let Layout = DefaultLayout;
                            if (route.layout) {
                                Layout = route.layout;
                            } else if (route.layout === null) {
                                Layout = Fragment;
                            }
                            return (
                                <Route
                                    key={i}
                                    path={route.path}
                                    element={<RouteAuthenticated layout={Layout} component={Page} />}
                                />
                            );
                        })}
                    </Routes>
                </BrowserRouter>
                {/* Thông báo */}
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                />

                {/* Chat windows container */}
                <ChatWindowContainer />

                {/* AI Chatbot */}
                <Chatbot />
            </>
        </ChatProvider>
    );
}

export default App;
