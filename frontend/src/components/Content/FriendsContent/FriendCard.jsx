import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getAvatarUrl, handleImageError as globalHandleImageError } from '../../../utils/avatarUtils';

const FriendCard = ({ friend, onRemove }) => {
    const [showActions, setShowActions] = useState(false);

    const handleRemoveFriend = () => {
        if (window.confirm(`Bạn có chắc chắn muốn hủy kết bạn với ${friend.name}?`)) {
            onRemove(friend.id);
            setShowActions(false);
        }
    };

    return (
        <div className="border border-gray-200 rounded-lg p-3 flex items-center justify-between transition-shadow hover:shadow-md">
            <div className="flex items-center">
                <Link to={`/profile/${friend.id}`}>
                    <img
                        src={getAvatarUrl(friend.avatar)}
                        alt={friend.name}
                        className="w-16 h-16 rounded-full object-cover mr-3"
                        onError={(e) => globalHandleImageError(e)}
                    />
                </Link>
                <div>
                    <Link to={`/profile/${friend.id}`} className="font-semibold text-lg hover:underline">
                        {friend.name}
                    </Link>
                    {friend.mutualFriends > 0 && (
                        <p className="text-sm text-gray-500">{friend.mutualFriends} bạn chung</p>
                    )}
                </div>
            </div>

            <div className="relative">
                <button
                    className="text-gray-500 hover:bg-gray-100 p-2 rounded-full"
                    onClick={() => setShowActions(!showActions)}
                >
                    <i className="bi bi-three-dots"></i>
                </button>

                {showActions && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 p-1 border border-gray-200">
                        <Link
                            to={`/profile/${friend.id}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md w-full text-left"
                        >
                            <i className="bi bi-person-fill mr-2"></i>
                            Xem trang cá nhân
                        </Link>
                        <button
                            className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md w-full text-left"
                            onClick={handleRemoveFriend}
                        >
                            <i className="bi bi-x-circle-fill mr-2"></i>
                            Hủy kết bạn
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

FriendCard.propTypes = {
    friend: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
        avatar: PropTypes.string,
        mutualFriends: PropTypes.number,
    }).isRequired,
    onRemove: PropTypes.func.isRequired,
};

// Đặt giá trị mặc định cho onRemove để tránh lỗi khi không được truyền vào
FriendCard.defaultProps = {
    onRemove: () => console.warn('onRemove function not provided to FriendCard'),
};

export default FriendCard;
