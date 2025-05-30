import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux'; // Thêm Provider từ react-redux
import store from './redux/store/store.js'; // Thêm store từ Redux
import App from './App.jsx';
import GlobalStyle from '~/components/GlobalStyle';
import './index.css'; // Import CSS để ngăn chặn swipe navigation

// Thêm xử lý lỗi Promise không được bắt
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);

    // Xử lý lỗi SOURCE_LANG_VI
    if (event.reason && event.reason.error === 'SOURCE_LANG_VI') {
        console.log('Đã bắt được lỗi SOURCE_LANG_VI ở mức global');
        // Ngăn chặn lỗi hiển thị trong console
        event.preventDefault();
    }
});

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
