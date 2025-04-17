import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import images from '../../../assets/images';
import { getAvatarUrl, handleImageError as globalHandleImageError } from '../../../utils/avatarUtils';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { acceptFriendRequest, rejectFriendRequest, getMutualFriendDetails } from '~/services/friendService';
import { toast } from 'react-toastify';

const FriendRequests = ({ requests, currentUserId, onRequestUpdated }) => {
    const [pendingRequests, setPendingRequests] = useState(requests);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mutualFriends, setMutualFriends] = useState({});

    console.log('Requests: ', requests);

    useEffect(() => {
        // Fetch mutual friends for each request
        const fetchMutualFriends = async () => {
            const mutualFriendsData = {};

            for (const request of pendingRequests) {
                try {
                    const response = await getMutualFriendDetails(currentUserId, request.sender.id);
                    if (response && response.data && response.data.data) {
                        mutualFriendsData[request.sender.id] = response.data.data;
                    } else if (response && response.data) {
                        mutualFriendsData[request.sender.id] = response.data;
                    } else {
                        mutualFriendsData[request.sender.id] = [];
                    }
                } catch (err) {
                    console.error(`Error fetching mutual friends for user ${request.sender.id}:`, err);
                    mutualFriendsData[request.sender.id] = [];
                }
            }

            setMutualFriends(mutualFriendsData);
        };

        if (pendingRequests.length > 0) {
            fetchMutualFriends();
        }
    }, [pendingRequests, currentUserId]);

    // Hàm format thời gian
    const formatTime = (dateString) => {
        if (!dateString) return '';
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: vi });
        } catch (error) {
            return dateString;
        }
    };

    // Xử lý chấp nhận lời mời
    const handleAccept = async (requestId) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await acceptFriendRequest(requestId, currentUserId);

            if (response.EC === 0) {
                // Xóa yêu cầu đã chấp nhận khỏi danh sách
                const updatedRequests = pendingRequests.filter((req) => req.id !== requestId);
                setPendingRequests(updatedRequests);

                // Gọi callback để thông báo cho component cha biết có sự thay đổi
                if (onRequestUpdated) {
                    onRequestUpdated('accept', requestId);
                }
            } else {
                setError(response.message || 'Không thể chấp nhận lời mời kết bạn');
            }
        } catch (err) {
            console.error('Error accepting friend request:', err);
            setError('Không thể chấp nhận lời mời kết bạn. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý từ chối lời mời
    const handleReject = async (requestId) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await rejectFriendRequest(requestId, currentUserId);

            if (response.EC === 0) {
                // Xóa yêu cầu đã từ chối khỏi danh sách
                const updatedRequests = pendingRequests.filter((req) => req.id !== requestId);
                setPendingRequests(updatedRequests);

                // Gọi callback để thông báo cho component cha biết có sự thay đổi
                if (onRequestUpdated) {
                    onRequestUpdated('reject', requestId);
                }
            } else {
                setError(response.message || 'Không thể từ chối lời mời kết bạn');
            }
        } catch (err) {
            console.error('Error rejecting friend request:', err);
            setError('Không thể từ chối lời mời kết bạn. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    // Nếu không còn yêu cầu nào sau khi xử lý
    if (pendingRequests.length === 0) {
        return (
            <div className="text-center py-12">
                <i className="bi bi-envelope text-4xl text-gray-400 mb-3 block"></i>
                <p className="text-gray-500">Không có lời mời kết bạn nào</p>
            </div>
        );
    }

    return (
        <div>
            {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded-md">{error}</div>}

            <div className="space-y-4">
                {pendingRequests.map((request) => {
                    const sender = request.sender;
                    const fullName = `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || sender.username;
                    return (
                        <div key={request.id} className="bg-white p-4 rounded-lg shadow border flex items-center">
                            <Link to={`/profile/${request.userId}`} className="flex-shrink-0">
                                <img
                                    src={getAvatarUrl(request.avatar)}
                                    alt={request.name}
                                    className="w-16 h-16 rounded-full object-cover"
                                    onError={(e) => globalHandleImageError(e)}
                                />
                            </Link>

                            <div className="ml-4 flex-grow">
                                <Link to={`/profile/${request.userId}`} className="font-medium hover:underline">
                                    {fullName}
                                </Link>

                                <p className="text-gray-600 mt-1">Đã gửi lời mời</p>

                                {mutualFriends[sender.id] && mutualFriends[sender.id].length > 0 && (
                                    <p className="text-gray-600 text-sm mt-1">
                                        {mutualFriends[sender.id].length} bạn chung
                                    </p>
                                )}

                                <p className="text-gray-500 text-sm">{formatTime(request.createdAt)}</p>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleAccept(request.id)}
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                                >
                                    Chấp nhận
                                </button>

                                <button
                                    onClick={() => handleReject(request.id)}
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                                >
                                    Từ chối
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

FriendRequests.propTypes = {
    requests: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string.isRequired,
            avatar: PropTypes.string,
            mutualFriends: PropTypes.number,
            sentAt: PropTypes.string,
        }),
    ).isRequired,
    currentUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onRequestUpdated: PropTypes.func,
};

export default FriendRequests;
