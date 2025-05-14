import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAvatarUrl, handleImageError } from '../../utils/avatarUtils';
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadNotificationCount,
} from '../../services/notificationService';
import websocketService from '../../services/websocketService';

const NotificationDropdown = ({ onClose, onNotificationCountChange }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications(user.id);
            setNotifications(data);
            console.log('Thong bao la: ', data);
            // Cập nhật số lượng thông báo chưa đọc từ API
            const count = await getUnreadNotificationCount(user.id);
            setUnreadCount(count);
            // Gọi callback để cập nhật số lượng ở Header
            onNotificationCountChange?.(count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Subscribe to WebSocket notifications
        if (user?.id) {
            const topic = `/topic/notifications/${user.id}`;

            const handleNewNotification = async (notification) => {
                // Kiểm tra xem thông báo đã tồn tại chưa
                setNotifications((prev) => {
                    // Nếu thông báo đã tồn tại, không thêm vào nữa
                    if (prev.some((n) => n.id === notification.id)) {
                        return prev;
                    }
                    // Thêm thông báo mới vào đầu danh sách
                    return [notification, ...prev];
                });
                // Tăng số lượng thông báo chưa đọc
                const newCount = unreadCount + 1;
                setUnreadCount(newCount);
                // Cập nhật số lượng ở Header
                onNotificationCountChange?.(newCount);
            };

            // Subscribe to notifications
            websocketService.subscribe(topic, handleNewNotification);

            // Cleanup subscription when component unmounts
            return () => {
                websocketService.unsubscribe(topic);
            };
        }
    }, [user?.id, onNotificationCountChange]);

    const handleNotificationClick = async (notification) => {
        console.log('Notification clicked:', notification); // Debug log

        if (!notification.isRead) {
            try {
                await markNotificationAsRead(notification.id);
                setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)));
                const newCount = unreadCount - 1;
                setUnreadCount(newCount);
                onNotificationCountChange?.(newCount);
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        }

        // Xử lý click dựa vào type
        console.log('Notification type:', notification.type); // Debug log
        switch (notification.type) {
            case 'COMMENT':
            case 'POST':
            case 'SHARE':
                // if (notification.postId) {
                //     navigate(`/post/${notification.postId}`);
                // }
                break;
            case 'FRIEND_REQUEST':
                console.log('Handling FRIEND_REQUEST notification'); // Debug log
                // Kiểm tra nếu đang ở trang friends với tab requests
                if (
                    window.location.pathname === '/friends' &&
                    new URLSearchParams(window.location.search).get('tab') === 'requests'
                ) {
                    console.log('Refreshing current page'); // Debug log
                    window.location.reload();
                } else {
                    console.log('Navigating to friends page'); // Debug log
                    navigate('/friends?tab=requests', { replace: true });
                }
                break;
            default:
                console.log('Unknown notification type:', notification.type); // Debug log
                break;
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead(user.id);
            // Cập nhật trạng thái đã đọc cho tất cả thông báo
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            // Đặt số lượng thông báo chưa đọc về 0
            setUnreadCount(0);
            // Cập nhật số lượng ở Header
            onNotificationCountChange?.(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const handleDeleteNotification = async (notificationId, e) => {
        e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài
        try {
            await deleteNotification(notificationId);
            // Xóa thông báo khỏi state
            setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
            // Giảm số lượng thông báo chưa đọc nếu thông báo chưa đọc
            const deletedNotification = notifications.find((n) => n.id === notificationId);
            if (deletedNotification && !deletedNotification.isRead) {
                const newCount = unreadCount - 1;
                setUnreadCount(newCount);
                // Cập nhật số lượng ở Header
                onNotificationCountChange?.(newCount);
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    return (
        <div className="absolute right-[20px] mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Thông báo</h3>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                    >
                        Đánh dấu tất cả đã đọc
                    </button>
                )}
            </div>
            <div className="divide-y divide-gray-100">
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-3 hover:bg-gray-50 cursor-pointer ${
                                !notification.isRead ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className="flex items-start gap-3">
                                <img
                                    src={getAvatarUrl(notification.sender?.avatar)}
                                    alt="avatar"
                                    className="w-10 h-10 rounded-full object-cover"
                                    onError={handleImageError}
                                />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-800">{notification.content}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => handleDeleteNotification(notification.id, e)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    title="Xóa thông báo"
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-4 text-center text-gray-500">Không có thông báo mới</div>
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;
