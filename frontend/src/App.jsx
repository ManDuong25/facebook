import { BrowserRouter, Route, Routes } from 'react-router';
import { ToastContainer } from 'react-toastify';
import { Fragment } from 'react';

import { publicRoutes } from './routes/publicRoutes';
import DefaultLayout from './layouts/DefaultLayout';
import RouteWrapper from './routes/RouteWrapper';
import RouteAuthenticated from './routes/RouteAuthenticated';
import { privateRoutes } from './routes/privateRoutes';

function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    {/* initial public routes */}
                    {publicRoutes.map((route, i) => {
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
                    })}

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
        </>
    );
}

export default App;
