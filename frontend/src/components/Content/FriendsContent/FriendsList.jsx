import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import FriendCard from './FriendCard';
import { toast } from 'react-toastify';
import { removeFriend } from '../../../services/friendService';

const FriendsList = ({ friends, onFriendRemoved }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [processingIds, setProcessingIds] = useState([]);

    // Tạo tên đầy đủ và lọc bạn bè theo tên
    const filteredFriends = friends.filter((friend) => {
        // Đảm bảo các thuộc tính tồn tại
        const firstName = friend.firstName || '';
        const lastName = friend.lastName || '';
        const username = friend.username || '';
        const fullName = `${firstName} ${lastName}`.trim();

        return (
            fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    // Hàm xử lý hủy kết bạn
    const handleRemoveFriend = async (friendId) => {
        try {
            // Thêm friendId vào danh sách đang xử lý
            setProcessingIds((prevIds) => [...prevIds, friendId]);

            const currentUserId = JSON.parse(localStorage.getItem('user')).id;
            console.log('currentUserId: ', currentUserId);
            if (!currentUserId) {
                toast.error('Không tìm thấy thông tin người dùng');
                return;
            }

            // Gọi API để hủy kết bạn
            const response = await removeFriend(currentUserId, friendId);

            if (response) {
                toast.success('Đã hủy kết bạn thành công');

                // Thông báo cho component cha cập nhật lại danh sách bạn bè
                if (onFriendRemoved) {
                    onFriendRemoved(friendId);
                }
            }
        } catch (error) {
            console.error('Lỗi khi hủy kết bạn:', error);
            toast.error('Không thể hủy kết bạn. Vui lòng thử lại sau.');
        } finally {
            // Xóa friendId khỏi danh sách đang xử lý
            setProcessingIds((prevIds) => prevIds.filter((id) => id !== friendId));
        }
    };

    console.log('Friends in FriendsList:', friends); // Kiểm tra dữ liệu bạn bè

    return (
        <div>
            <div className="mb-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm bạn bè"
                        className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
            </div>

            {filteredFriends.length === 0 ? (
                <div className="text-center py-10">
                    <i className="bi bi-people text-5xl text-gray-300"></i>
                    <p className="mt-2 text-gray-500">
                        {searchTerm ? 'Không tìm thấy bạn bè phù hợp với tìm kiếm.' : 'Bạn chưa có bạn bè nào.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredFriends.map((friend) => {
                        // Đảm bảo mỗi friend có một ID duy nhất
                        const friendId = friend.id || friend.userId;
                        if (!friendId) {
                            console.error('Missing ID for friend:', friend);
                            return null;
                        }

                        // Tạo tên hiển thị
                        const displayName =
                            `${friend.firstName || ''} ${friend.lastName || ''}`.trim() ||
                            friend.username ||
                            'Người dùng';

                        return (
                            <FriendCard
                                key={friendId}
                                friend={{
                                    ...friend,
                                    id: friendId,
                                    name: displayName,
                                }}
                                onRemove={handleRemoveFriend}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

FriendsList.propTypes = {
    friends: PropTypes.array.isRequired,
    onFriendRemoved: PropTypes.func,
};

FriendsList.defaultProps = {
    onFriendRemoved: null,
};

export default FriendsList;
