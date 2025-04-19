import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Fragment } from 'react';
import { publicRoutes } from './routes/publicRoutes';
import DefaultLayout from './layouts/DefaultLayout';
import RouteWrapper from './routes/RouteWrapper';
import RouteAuthenticated from './routes/RouteAuthenticated';
import RouteProtected from './routes/RouteProtected';
import { privateRoutes } from './routes/privateRoutes';
import HomeLayout from './layouts/HomeLayout';
import Content from './components/Content/HomeContent/HomeContent';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { ChatProvider } from './contexts/ChatContext';
import { ChatWindowContainer } from './components/Chat';
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
                        {/* initial public routes */}
                        {/* {publicRoutes.map((route, i) => {
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
                  element={<RouteWrapper layout={Layout} component={Page} />}
                />
              );
            })} */}
                        {/* initial private routes */}
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
            </>
        </ChatProvider>
    );
}

export default App;
