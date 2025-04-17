// src/components/Header/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser, logout } from '../../redux/features/authSlice';
import ChatSidebar from './ChatSidebar';
import images from '../../assets/images';
import { getAvatarUrl, handleImageError } from '../../utils/avatarUtils';
import axios from 'axios';

function Header() {
    const [activeTab, setActiveTab] = useState('home');
    const [showChatSidebar, setShowChatSidebar] = useState(false);
    const [activeRightIcon, setActiveRightIcon] = useState('');
    const avatarRef = useRef(null);
    const [chatPosition, setChatPosition] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    // Thêm state để lưu trữ URL avatar sau khi xử lý
    const [processedAvatarUrl, setProcessedAvatarUrl] = useState('');
    const [avatarError, setAvatarError] = useState(null);

    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();

    // Kiểm tra xem có đang ở trang profile hay không
    useEffect(() => {
        const path = location.pathname;
        // Nếu đang ở trang profile, không đánh dấu tab nào là active
        if (path === '/profile' || path.startsWith('/profile/')) {
            setActiveTab('');
        } else if (path === '/') {
            setActiveTab('home');
        }
    }, [location.pathname]);

    // Lấy thông tin user từ API (thông tin mới nhất, không phụ thuộc vào localStorage)
    useEffect(() => {
        // Chỉ fetch khi đã có user trong Redux (đã đăng nhập)
        if (user && user.id) {
            const fetchLatestUserData = async () => {
                try {
                    // Gọi API để lấy thông tin user mới nhất
                    const response = await axios.get(`http://localhost:8080/api/users/${user.id}`);

                    if (response.data && response.data.data) {
                        console.log('[HEADER] Latest user data from API:', response.data.data);

                        // Cập nhật Redux store và localStorage với dữ liệu mới từ API
                        dispatch(updateUser(response.data.data));
                    }
                } catch (error) {
                    console.error('[HEADER] Error fetching latest user data:', error);
                }
            };

            fetchLatestUserData();
        }
    }, [user?.id, dispatch]);

    // Debug log để xem thông tin avatar
    useEffect(() => {
        console.log('[HEADER] User data:', user);
        if (user && user.avatar) {
            console.log('[HEADER] Raw avatar URL:', user.avatar);
            const avatarUrl = getAvatarUrl(user.avatar);
            console.log('[HEADER] Processed avatar URL:', avatarUrl);
            setProcessedAvatarUrl(avatarUrl);
        } else {
            console.log('[HEADER] No avatar found in user data');
        }
    }, [user]);

    // Hàm xử lý lỗi avatar tùy chỉnh
    const customHandleImageError = (e) => {
        console.error('[HEADER] Image error occurred!');
        console.error('[HEADER] Failed URL:', e.target.src);
        setAvatarError(`Failed to load: ${e.target.src}`);

        // Gọi hàm xử lý lỗi gốc
        handleImageError(e);

        // Log ra thông tin chi tiết sau khi xử lý lỗi
        console.log('[HEADER] Image URL after error handling:', e.target.src);
    };

    const rightIcons = ['bi-grid-3x3-gap', 'bi-messenger', 'bi-bell'];

    const handleRightIconClick = (icon) => {
        if (icon === 'bi-messenger') {
            if (activeRightIcon === 'bi-messenger') {
                setActiveRightIcon('');
                setShowChatSidebar(false);
            } else {
                setActiveRightIcon('bi-messenger');
                setShowChatSidebar(true);
            }
        } else {
            setShowChatSidebar(false);
            if (activeRightIcon === icon) {
                setActiveRightIcon('');
            } else {
                setActiveRightIcon(icon);
            }
        }
    };

    // Hàm xử lý khi nhấn vào logo Facebook
    const handleLogoClick = () => {
        navigate('/');
        setActiveTab('home');
    };

    // Hàm xử lý khi nhấn vào các tab
    const handleTabClick = (id, path) => {
        // Nếu tab đang ở trang profile, không đánh dấu tab này là active
        if (path.startsWith('/profile')) {
            setActiveTab('');
        } else {
            setActiveTab(id);
        }
        if (path) navigate(path);
    };

    // Tính toán vị trí chat dựa trên avatarRef
    useEffect(() => {
        if (avatarRef.current) {
            const rect = avatarRef.current.getBoundingClientRect();
            setChatPosition(window.innerWidth - rect.right);
        }
    }, [showChatSidebar]);

    // Hàm xử lý khi đăng xuất
    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    // Profile click handler
    const handleProfileClick = () => {
        navigate('/profile');
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
            <nav className="w-full">
                <div className="flex items-center h-14 w-full">
                    <div className="hidden lg:flex lg:w-1/4 px-4 items-center gap-3">
                        <div onClick={handleLogoClick} className="cursor-pointer">
                            <img src={images.logo} alt="Facebook Logo" className="w-11 h-18" />
                        </div>
                        <div className="flex items-center h-10 px-3 rounded-full bg-[#f0f2f5] hover:bg-[#e4e6eb] transition">
                            <i className="bi bi-search text-gray-500 text-[18px]"></i>
                            <input
                                type="text"
                                placeholder="Tìm kiếm trên Facebook"
                                className="bg-transparent outline-none text-base text-gray-700 placeholder-[#65676b] ml-2 w-54"
                            />
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2 flex justify-center">
                        <div className="relative w-[496px] flex items-center gap-16">
                            {[
                                { id: 'home', icon: 'bi-house-door', path: '/' },
                                { id: 'watch', icon: 'bi-tv', path: '/' },
                                { id: 'market', icon: 'bi-shop', path: '/' },
                                { id: 'group', icon: 'bi-people', path: '/' },
                                { id: 'gaming', icon: 'bi-controller', path: '/' },
                            ].map(({ id, icon, path }) => (
                                <div
                                    key={id}
                                    className={`relative w-12 h-12 flex items-center justify-center rounded-md cursor-pointer transition ${
                                        activeTab === id ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                    onClick={() => handleTabClick(id, path)}
                                >
                                    <i className={`bi ${icon} text-[28px]`}></i>
                                    {activeTab === id && (
                                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[150%] h-[2px] bg-blue-500 rounded-full" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="hidden lg:flex lg:w-1/4 px-4 items-center gap-3 justify-end">
                        {rightIcons.map((icon) => (
                            <div
                                key={icon}
                                onClick={() => handleRightIconClick(icon)}
                                className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#e4e6eb] transition cursor-pointer ${
                                    activeRightIcon === icon ? 'text-blue-500' : 'text-gray-600'
                                }`}
                            >
                                <i className={`bi ${icon} text-[22px]`}></i>
                            </div>
                        ))}
                        <div
                            className="w-10 h-10 rounded-full overflow-hidden cursor-pointer"
                            onClick={handleProfileClick}
                            ref={avatarRef}
                        >
                            <img
                                src={getAvatarUrl(user?.avatar)}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={customHandleImageError}
                            />
                        </div>
                        <div
                            onClick={handleLogout}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-100 transition cursor-pointer text-red-500"
                            title="Đăng xuất"
                        >
                            <i className="bi bi-box-arrow-right text-[22px]"></i>
                        </div>
                    </div>
                </div>
            </nav>
            {showChatSidebar && <ChatSidebar right={chatPosition} />}
        </div>
    );
}

export default Header;
