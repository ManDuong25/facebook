import React, { useState, useEffect } from 'react';
import { getFriends } from '~/services/friendService';
import { createChatRoom } from '~/services/chatRoomService';
import { addMember } from '~/services/chatRoomMemberService';
import { getCurrentUser } from '~/services/authService';
import { getAvatarUrl, handleImageError } from '~/utils/avatarUtils';

const CreateChatRoomModal = ({ isOpen, onClose }) => {
    const [roomName, setRoomName] = useState('');
    const [friends, setFriends] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchFriends();
        }
    }, [isOpen]);

    const fetchFriends = async () => {
        try {
            const currentUser = getCurrentUser();
            if (!currentUser?.id) return;

            const friendsList = await getFriends(currentUser.id);
            setFriends(friendsList);
        } catch (error) {
            console.error('Error fetching friends:', error);
            setError('Không thể tải danh sách bạn bè');
        }
    };

    const handleFriendSelect = (friendId) => {
        setSelectedFriends((prev) => {
            if (prev.includes(friendId)) {
                return prev.filter((id) => id !== friendId);
            } else {
                return [...prev, friendId];
            }
        });
    };

    const formatDateTime = (date) => {
        return date.toISOString().slice(0, 19).replace('T', ' '); // Format: "YYYY-MM-DD HH:mm:ss"
    };

    const handleCreateRoom = async () => {
        if (!roomName.trim()) {
            setError('Vui lòng nhập tên nhóm');
            return;
        }

        if (selectedFriends.length === 0) {
            setError('Vui lòng chọn ít nhất một thành viên');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const currentUser = getCurrentUser();
            if (!currentUser?.id) {
                throw new Error('Không tìm thấy thông tin người dùng');
            }

            const now = new Date();
            // Tạo phòng chat mới với dữ liệu đúng định dạng
            const newRoom = await createChatRoom({
                name: roomName.trim(),
                avatar: null,
                createdAt: formatDateTime(now),
                updatedAt: formatDateTime(now),
            });

            // Thêm người tạo vào nhóm với vai trò LEADER
            await addMember(newRoom.id, currentUser.id, 'ADMIN');

            // Thêm các thành viên đã chọn
            for (const friendId of selectedFriends) {
                await addMember(newRoom.id, friendId, 'MEMBER');
            }

            onClose(true); // true để thông báo tạo thành công
        } catch (error) {
            console.error('Error creating chat room:', error);
            setError(error.message || 'Không thể tạo nhóm chat');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-[500px] max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <button onClick={() => onClose(false)} className="text-gray-600 hover:text-gray-800">
                        Hủy
                    </button>
                    <h2 className="text-xl font-semibold">Tạo nhóm chat mới</h2>
                    <button
                        onClick={handleCreateRoom}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                    >
                        {loading ? 'Đang tạo...' : 'Tạo'}
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 overflow-y-auto">
                    {/* Room Name Input */}
                    <div className="mb-4">
                        <input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder="Nhập tên nhóm"
                            className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Error Message */}
                    {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

                    {/* Friends List */}
                    <div className="space-y-2">
                        <h3 className="font-semibold mb-2">Chọn thành viên</h3>
                        {friends.map((friend) => (
                            <div
                                key={friend.id}
                                className="flex items-center p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                                onClick={() => handleFriendSelect(friend.id)}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedFriends.includes(friend.id)}
                                    onChange={() => {}}
                                    className="mr-3"
                                />
                                <img
                                    src={getAvatarUrl(friend.avatar)}
                                    alt={`${friend.firstName} ${friend.lastName}`}
                                    className="w-10 h-10 rounded-full mr-3 object-cover"
                                    onError={handleImageError}
                                />
                                <span className="text-gray-800">
                                    {friend.firstName} {friend.lastName}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateChatRoomModal;
