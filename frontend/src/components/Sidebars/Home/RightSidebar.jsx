import React, { useState, useEffect } from 'react';
import images from '../../../assets/images';
import { getAvatarUrl, handleImageError } from '../../../utils/avatarUtils';
import { useChat } from '../../../contexts/ChatContext';
import testConversations from '../../../data/testConversations';
import { getFriends } from '~/services/friendService';
import { getCurrentUser } from '~/services/authService';

const ads = [
    {
        id: 1,
        title: 'VnShop',
        description: 'app.vnpay.vn',
        image: images.group1,
    },
    {
        id: 2,
        title: 'Khớp lệnh nhanh hơn? Hãy đến với Exness.',
        description: 'exness.com',
        image: images.group1,
    },
];

// Friend component that can be clicked to open a chat
const FriendCanChat = ({ friend, onOpenChat }) => (
    <div
        className="flex items-center relative cursor-pointer hover:bg-gray-200 transition-colors p-2 rounded-lg"
        onClick={() => onOpenChat(friend)}
    >
        <img
            src={getAvatarUrl(friend.avatar)}
            alt={friend.firstName || friend.name}
            className="w-10 h-10 rounded-full mr-3 object-cover"
            onError={handleImageError}
        />
        {friend && (
            <span className="absolute left-8 top-8 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
        )}
        <p className="text-sm text-[#65676B]">
            {friend.firstName} {friend.lastName}
        </p>
    </div>
);

const AdItem = ({ title, description, image }) => (
    <div className="flex items-center mb-3 cursor-pointer hover:bg-gray-200 transition-colors p-2 rounded-lg">
        <img
            src={image}
            alt={title}
            className="w-[120px] h-[120px] object-cover rounded-lg mr-3"
            onError={handleImageError}
        />
        <div className="flex flex-col justify-center">
            <h5 className="text-base font-bold text-black leading-5">{title}</h5>
            <p className="text-sm text-[#65676B]">{description}</p>
        </div>
    </div>
);

const RightSidebar = () => {
    const { handleSelectConversation } = useChat();
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFriends();
    }, []);

    const fetchFriends = async () => {
        try {
            setLoading(true);
            // Check if getCurrentUser() returns a valid user
            const currentUser = getCurrentUser();
            if (!currentUser || !currentUser.id) {
                console.error('No current user found or user has no ID');
                // Fallback to test data if no user is found
                setFriends(testConversations);
                return;
            }

            const response = await getFriends(currentUser.id);

            if (response && Array.isArray(response)) {
                setFriends(response);
                // Log the response, not the state (state won't update until next render)
            } else {
                console.error('Invalid friends data received:', response);
                // Fallback to test data if the response is invalid
                setFriends(testConversations);
            }
        } catch (error) {
            console.error('Error fetching friends:', error);
            // Fallback to test data if there's an error
            setFriends(testConversations);
        } finally {
            setLoading(false);
        }
    };

    const openChatWithFriend = (friend) => {
        // Convert friend data to conversation format
        // If friend from API doesn't have the required fields, adapt it
        const conversation = {
            id: friend.id,
            name: `${friend.firstName || ''} ${friend.lastName || ''}`.trim() || friend.name || 'Unknown',
            avatar: friend.avatar,
        };

        // Open chat window
        handleSelectConversation(conversation);
    };

    return (
        <div className="w-80 p-4 bg-gray-100 rounded-lg flex flex-col">
            {/* PHẦN QUẢNG CÁO */}
            <div className="mb-4 flex flex-col">
                <h3 className="text-base font-semibold text-[#65676B] mb-2">Được tài trợ</h3>
                {ads.map((ad) => (
                    <AdItem key={ad.id} {...ad} />
                ))}
                <hr className="border-t border-gray-500 my-3" />
            </div>

            {/* PHẦN SINH NHẬT */}
            <div className="mb-4 flex flex-col">
                <h3 className="text-base font-semibold text-[#65676B] mb-1">Sinh nhật</h3>
                <div className="flex items-center text-sm text-[#65676B] cursor-pointer hover:bg-gray-200 transition-colors p-2 rounded-lg">
                    <i className="bi bi-gift text-2xl text-[#1877F2] mr-2"></i>
                    <p>Hôm nay là sinh nhật của Hân Su.</p>
                </div>
                <hr className="border-t border-gray-500 my-3" />
            </div>

            {/* DANH SÁCH BẠN BÈ */}
            <div className="flex flex-col">
                <h4 className="text-base font-semibold text-[#65676B] mb-2">Danh sách bạn bè ({friends.length})</h4>
                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-4">
                            <i className="bi bi-hourglass-split text-2xl text-gray-400"></i>
                            <p className="text-sm text-gray-500 mt-2">Đang tải...</p>
                        </div>
                    ) : friends.length > 0 ? (
                        friends.map((friend) => (
                            <FriendCanChat key={friend.id} friend={friend} onOpenChat={openChatWithFriend} />
                        ))
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-sm text-gray-500">Không tìm thấy bạn bè</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RightSidebar;
