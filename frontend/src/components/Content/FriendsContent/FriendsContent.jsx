import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import images from '../../../assets/images';
import FriendsList from './FriendsList';
import FriendRequests from './FriendRequests';
import FindFriends from './FindFriends';
import {
    getFriends,
    getFriendRequests,
    getFriendSuggestions,
    acceptFriendRequest,
    rejectFriendRequest,
    sendFriendRequest,
    removeFriend,
    getPendingRequestsReceived,
} from '../../../services/friendService';
import { getAvatarUrl } from '../../../utils/avatarUtils';
import { toast } from 'react-toastify';

const FriendsContent = ({ userId }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');

    const currentUser = useSelector((state) => state.auth.user);
    const [activeTab, setActiveTab] = useState(tabParam || 'all');
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [suggestedFriends, setSuggestedFriends] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dataFetched, setDataFetched] = useState(false);

    // Theo dõi URL params để cập nhật active tab
    useEffect(() => {
        if (tabParam && ['all', 'requests', 'suggestions'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    // Cập nhật URL khi tab thay đổi
    useEffect(() => {
        const currentParams = new URLSearchParams(location.search);
        currentParams.set('tab', activeTab);
        navigate(`${location.pathname}?${currentParams.toString()}`, { replace: true });
    }, [activeTab, location.pathname, navigate]);

    useEffect(() => {
        // Sử dụng ID người dùng từ Redux nếu không có prop
        const currentUserId = userId || currentUser?.id;
        if (!currentUserId) return;

        setIsLoading(true);
        fetchData(currentUserId);
    }, [userId, currentUser]);

    // Thêm hiệu ứng để đảm bảo loading ít nhất 1 giây
    useEffect(() => {
        if (dataFetched) {
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [dataFetched]);

    // Lấy dữ liệu từ API
    const fetchDataFriends = async (userId) => {
        try {
            const res = await getFriends(userId);
            console.log('Friends: ', res);
            setFriends(res);
            return true;
        } catch (err) {
            console.error('Error fetching friends:', err);
            setError('Không thể tải danh sách bạn bè');
            return false;
        }
    };

    const fetchDataFriendRequests = async (userId) => {
        try {
            const res = await getPendingRequestsReceived(userId);
            console.log('Friend request: ', res);
            if (res && res.EC == 0) {
                setFriendRequests(res.data);
                return true;
            } else {
                toast.error(res.message);
                return false;
            }
        } catch (err) {
            console.error('Error fetching friend requests:', err);
            toast.error('Không thể tải danh sách lời mời kết bạn');
            return false;
        }
    };

    const fetchDataFriendSuggestion = async (userId) => {
        try {
            const res = await getFriendSuggestions(userId);
            console.log('Friend suggestion: ', res);
            setSuggestedFriends(res);
            return true;
        } catch (err) {
            console.error('Error fetching friend suggestions:', err);
            setError('Không thể tải gợi ý kết bạn');
            return false;
        }
    };

    const fetchData = async (userId) => {
        setIsLoading(true);
        setDataFetched(false);
        setError(null);

        try {
            // Chạy song song cả 3 API gọi
            const results = await Promise.all([
                fetchDataFriends(userId),
                fetchDataFriendRequests(userId),
                fetchDataFriendSuggestion(userId),
            ]);

            // Nếu tất cả đều thành công
            setDataFetched(true);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Đã xảy ra lỗi khi tải dữ liệu');
            setDataFetched(true); // Vẫn set dataFetched = true để thoát trạng thái loading
        }
    };

    // Làm mới dữ liệu
    const handleRefresh = () => {
        const currentUserId = userId || currentUser?.id;
        if (currentUserId) {
            fetchData(currentUserId);
        }
    };

    // Thêm phương thức xử lý cập nhật request
    const handleRequestUpdated = (action, requestId) => {
        // Nếu là chấp nhận, cần thêm vào danh sách bạn bè
        if (action === 'accept') {
            // Tìm request được chấp nhận
            const acceptedRequest = friendRequests.find((req) => req.id === requestId);
            if (acceptedRequest && acceptedRequest.sender) {
                const sender = acceptedRequest.sender;

                // Thêm vào danh sách bạn bè với đầy đủ thông tin
                setFriends((prevFriends) => [
                    ...prevFriends,
                    {
                        id: sender.id,
                        username: sender.username || '',
                        firstName: sender.firstName || '',
                        lastName: sender.lastName || '',
                        avatar: sender.avatar || null,
                    },
                ]);

                // Thông báo thành công
                toast.success('Đã chấp nhận lời mời kết bạn');
            }
        }

        if (action === 'reject') {
            // Tìm request được chấp nhận
            const rejectedRequest = friendRequests.find((req) => req.id === requestId);
            if (rejectedRequest && rejectedRequest.sender) {
                toast.warning('Đã từ chối lời mời kết bạn!');
            }
        }

        // Cập nhật danh sách lời mời kết bạn
        setFriendRequests((prevRequests) => prevRequests.filter((req) => req.id !== requestId));
    };

    // Hàm xử lý cập nhật UI sau khi hủy kết bạn
    const handleFriendRemoved = (removedFriendId) => {
        // Cập nhật danh sách bạn bè bằng cách loại bỏ người bạn đã hủy kết bạn
        setFriends((prevFriends) =>
            prevFriends.filter((friend) => friend.id !== removedFriendId && friend.userId !== removedFriendId),
        );
    };

    // Hiển thị trạng thái loading
    const renderLoading = () => {
        return (
            <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    };

    // Hiển thị thông báo lỗi
    const renderError = () => {
        return (
            <div className="text-center py-10">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Thử lại
                </button>
            </div>
        );
    };

    // Hiển thị nội dung trống khi không có dữ liệu
    const renderEmptyContent = (tab) => {
        let icon = 'bi-people';
        let message = 'Không có dữ liệu';

        switch (tab) {
            case 'all':
                message = 'Bạn chưa có bạn bè nào';
                break;
            case 'requests':
                icon = 'bi-envelope';
                message = 'Không có lời mời kết bạn nào';
                break;
            case 'suggestions':
                icon = 'bi-person-plus';
                message = 'Không có gợi ý kết bạn nào';
                break;
            default:
                break;
        }

        return (
            <div className="text-center py-12">
                <i className={`bi ${icon} text-4xl text-gray-400 mb-3 block`}></i>
                <p className="text-gray-500">{message}</p>

                {tab === 'all' && (
                    <Link
                        to="/friends?tab=suggestions"
                        className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition mt-4"
                        onClick={() => setActiveTab('suggestions')}
                    >
                        <i className="bi bi-person-plus mr-2"></i>
                        Tìm bạn mới
                    </Link>
                )}
            </div>
        );
    };

    // JSX phần hiển thị tab content
    const renderTabContent = () => {
        if (isLoading) {
            return renderLoading();
        }

        if (error) {
            return renderError();
        }

        // Hiển thị nội dung dựa trên tab đang chọn
        switch (activeTab) {
            case 'all':
                if (friends.length === 0) {
                    return renderEmptyContent('all');
                }
                return <FriendsList friends={friends} onFriendRemoved={handleFriendRemoved} />;

            case 'requests':
                if (friendRequests.length === 0) {
                    return renderEmptyContent('requests');
                }
                return (
                    <FriendRequests
                        requests={friendRequests}
                        currentUserId={currentUser?.id}
                        onRequestUpdated={handleRequestUpdated}
                    />
                );

            case 'suggestions':
                if (suggestedFriends.length === 0) {
                    return renderEmptyContent('suggestions');
                }
                return <FindFriends suggestions={suggestedFriends} />;

            default:
                return renderEmptyContent('all');
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-5xl">
            <div className="bg-white rounded-lg shadow">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Bạn bè</h1>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center text-sm"
                        disabled={isLoading}
                    >
                        <i className="bi bi-arrow-clockwise mr-2"></i>
                        Làm mới
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        className={`py-3 px-4 font-medium ${
                            activeTab === 'all' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600'
                        }`}
                        onClick={() => setActiveTab('all')}
                    >
                        Tất cả bạn bè
                    </button>
                    <button
                        className={`py-3 px-4 font-medium ${
                            activeTab === 'requests' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600'
                        }`}
                        onClick={() => setActiveTab('requests')}
                    >
                        Lời mời kết bạn
                        {friendRequests.length > 0 && (
                            <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                                {friendRequests.length}
                            </span>
                        )}
                    </button>
                    <button
                        className={`py-3 px-4 font-medium ${
                            activeTab === 'suggestions' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600'
                        }`}
                        onClick={() => setActiveTab('suggestions')}
                    >
                        Gợi ý
                    </button>
                </div>

                {/* Content based on active tab */}
                <div className="p-4">{renderTabContent()}</div>
            </div>
        </div>
    );
};

FriendsContent.propTypes = {
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default FriendsContent;
