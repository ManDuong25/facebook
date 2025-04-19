import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux'; // Thêm Provider từ react-redux
import store from './redux/store/store.js'; // Thêm store từ Redux
import App from './App.jsx';
import GlobalStyle from '~/components/GlobalStyle';
import './index.css'; // Import CSS để ngăn chặn swipe navigation

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider store={store}>
            {' '}
            {/* Bọc ứng dụng trong Provider */}
            <GlobalStyle>
                <App />
            </GlobalStyle>
        </Provider>
    </StrictMode>,
);
