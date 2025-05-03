import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import images from '../../../assets/images';
import { sharePost } from '../../../services/api';
import { getAvatarUrl, getImageUrl, handleImageError as globalHandleImageError } from '../../../utils/avatarUtils';

const ShareDialog = ({ post, onClose, currentUser, onShareSuccess }) => {
    const [isSharing, setIsSharing] = useState(false);
    const [shareContent, setShareContent] = useState('');
    const [error, setError] = useState('');

    // Hàm helper để lấy tên hiển thị người dùng
    const getUserDisplayName = (user) => {
        if (!user) return 'Người dùng';
        if (user.name) return user.name;
        if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
        if (user.firstName) return user.firstName;
        if (user.lastName) return user.lastName;
        if (user.username) return user.username;
        return 'Người dùng';
    };

    // Xử lý khi người dùng chia sẻ bài viết
    const handleShare = async () => {
        if (!currentUser?.id || !post?.id) {
            setError('Không thể chia sẻ bài viết vào lúc này');
            return;
        }

        setIsSharing(true);
        setError('');

        try {
            // Gọi API để chia sẻ bài viết
            const result = await sharePost(post.id, currentUser.id);

            if (result) {
                // Thông báo thành công và đóng dialog
                if (onShareSuccess) {
                    onShareSuccess(result);
                }
                onClose();
            } else {
                setError('Không thể chia sẻ bài viết. Vui lòng thử lại sau.');
            }
        } catch (error) {
            console.error('Error sharing post:', error);
            setError('Đã xảy ra lỗi khi chia sẻ bài viết.');
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-4 py-3 border-b">
                    <h2 className="text-xl font-semibold">Chia sẻ bài viết</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* User info */}
                    <div className="flex items-center mb-4">
                        <img
                            src={getAvatarUrl(currentUser?.avatar)}
                            alt={getUserDisplayName(currentUser)}
                            className="w-10 h-10 rounded-full mr-3"
                            onError={(e) => globalHandleImageError(e)}
                        />
                        <div>
                            <p className="font-semibold">{getUserDisplayName(currentUser)}</p>
                        </div>
                    </div>

                    {/* Post preview */}
                    <div className="border rounded-lg p-3 mb-4">
                        <div className="flex items-center mb-2">
                            <img
                                src={getAvatarUrl(post?.user?.avatar)}
                                alt={post?.user?.username || 'Tác giả'}
                                className="w-8 h-8 rounded-full mr-2"
                                onError={(e) => globalHandleImageError(e)}
                            />
                            <div>
                                <p className="font-semibold text-sm">{post?.user?.username || 'Tác giả'}</p>
                            </div>
                        </div>
                        <p className="text-sm mb-2">{post?.content || 'Không có nội dung'}</p>
                        {post?.imageUrl && (
                            <img
                                src={getImageUrl(post.imageUrl)}
                                alt="Post"
                                className="w-full h-40 object-cover rounded-lg"
                                onError={(e) => globalHandleImageError(e)}
                            />
                        )}
                    </div>

                    {/* Error message */}
                    {error && <p className="text-red-500 mb-4">{error}</p>}

                    {/* Buttons */}
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 rounded-md mr-2 hover:bg-gray-300"
                            disabled={isSharing}
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleShare}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                            disabled={isSharing}
                        >
                            {isSharing ? 'Đang chia sẻ...' : 'Chia sẻ'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

ShareDialog.propTypes = {
    post: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    currentUser: PropTypes.object,
    onShareSuccess: PropTypes.func,
};

export default ShareDialog;
