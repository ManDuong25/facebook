import React, { useState, useEffect } from 'react';
import { getFriends, searchUsers } from '~/services/friendService';
import { getAvatarUrl, handleImageError } from '~/utils/avatarUtils';
import { getRoomMembers } from '~/services/chatRoomMemberService';
import { isMember } from '~/services/chatRoomMemberService';

const AddMembersModal = ({ isOpen, onClose, onComplete, roomId }) => {
    const [friends, setFriends] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [existingMembers, setExistingMembers] = useState([]);

    useEffect(() => {
        if (isOpen) {
            loadRoomMembers();
            loadFriends();
        }
    }, [isOpen, roomId]);

    const loadRoomMembers = async () => {
        try {
            const members = await getRoomMembers(roomId);
            setExistingMembers(members.map((member) => member.user.id));
        } catch (error) {
            console.error('Error loading room members:', error);
        }
    };

    const loadFriends = async () => {
        try {
            setIsLoading(true);
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const friendsList = await getFriends(currentUser.id);

            // Kiểm tra từng người bạn xem đã tham gia nhóm chưa
            const availableFriends = [];
            for (const friend of friendsList) {
                const isAlreadyMember = await isMember(roomId, friend.id);
                if (!isAlreadyMember) {
                    availableFriends.push(friend);
                }
            }

            setFriends(availableFriends);
        } catch (error) {
            console.error('Error loading friends:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.trim()) {
            try {
                setIsLoading(true);
                const searchResults = await searchUsers(value);

                // Kiểm tra từng kết quả tìm kiếm
                const availableUsers = [];
                for (const user of searchResults) {
                    const isAlreadyMember = await isMember(roomId, user.id);
                    if (!isAlreadyMember) {
                        availableUsers.push(user);
                    }
                }

                setFriends(availableUsers);
            } catch (error) {
                console.error('Error searching users:', error);
            } finally {
                setIsLoading(false);
            }
        } else {
            loadFriends();
        }
    };

    const toggleUserSelection = (user) => {
        setSelectedUsers((prev) => {
            const isSelected = prev.some((u) => u.id === user.id);
            if (isSelected) {
                return prev.filter((u) => u.id !== user.id);
            } else {
                return [...prev, user];
            }
        });
    };

    const handleComplete = () => {
        onComplete(selectedUsers);
        setSelectedUsers([]);
        setSearchTerm('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-[500px] max-h-[600px] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center">
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-800 font-medium">
                        Hủy
                    </button>
                    <h2 className="text-lg font-semibold">Thêm thành viên</h2>
                    <button
                        onClick={handleComplete}
                        className={`font-medium ${
                            selectedUsers.length > 0
                                ? 'text-blue-600 hover:text-blue-800'
                                : 'text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={selectedUsers.length === 0}
                    >
                        Hoàn tất
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder="Tìm kiếm theo tên..."
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    />
                </div>

                {/* User List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : friends.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">Không tìm thấy người dùng nào</div>
                    ) : (
                        <div className="space-y-2">
                            {friends.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                                    onClick={() => toggleUserSelection(user)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.some((u) => u.id === user.id)}
                                        onChange={() => {}}
                                        className="mr-3"
                                    />
                                    <img
                                        src={getAvatarUrl(user.avatar)}
                                        alt=""
                                        className="w-10 h-10 rounded-full object-cover mr-3"
                                        onError={handleImageError}
                                    />
                                    <div>
                                        <div className="font-medium">
                                            {user.firstName} {user.lastName}
                                        </div>
                                        <div className="text-sm text-gray-500">{user.mutualFriends || 0} bạn chung</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddMembersModal;
