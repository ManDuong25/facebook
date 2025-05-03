import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import images from '../../../assets/images';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    likePost,
    unlikePost,
    addComment,
    getComments,
    sharePost,
    updateComment,
    deleteComment,
    getShares,
    getLikeStatus,
} from '../../../services/api';
import PropTypes from 'prop-types';
import ShareDialog from './ShareDialog';
import { getAvatarUrl, getImageUrl, handleImageError } from '../../../utils/avatarUtils';

const actions = [
    { icon: 'bi-hand-thumbs-up', label: 'Thích', key: 'like' },
    { icon: 'bi-chat', label: 'Bình luận', key: 'comment' },
    { icon: 'bi-share', label: 'Chia sẻ', key: 'share' },
];

const ActionButton = ({ icon, label, onClick, active, activeIcon }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
            active ? 'text-blue-500' : 'text-gray-700'
        } hover:bg-gray-100`}
    >
        <i className={`bi ${active ? activeIcon : icon}`}></i> {label}
    </button>
);

const PostItem = ({ post, isSharedPost = false }) => {
    const currentUser = useSelector((state) => state.auth.user);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [comments, setComments] = useState([]);
    const [commentContent, setCommentContent] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [sharesCount, setSharesCount] = useState(0);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingContent, setEditingContent] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showShareDialog, setShowShareDialog] = useState(false);

    // Lấy dữ liệu ban đầu khi component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            if (!post) return;

            try {
                setErrorMessage(''); // Xóa thông báo lỗi trước đó

                // Lấy trạng thái "thích" và số lượt thích
                try {
                    const likeStatus = await getLikeStatus(post.id, currentUser?.id);
                    setLiked(likeStatus.liked);
                    setLikesCount(likeStatus.count);
                } catch (err) {
                    console.error('Không thể lấy thông tin like:', err);
                }

                // Tạm thời bỏ qua việc lấy comments để tránh lỗi
                // Sẽ lấy comments khi người dùng click vào nút bình luận
                setComments([]);

                // Lấy danh sách lượt chia sẻ
                try {
                    const sharesData = await getShares(post.id);
                    setSharesCount(sharesData?.length || 0);
                } catch (err) {
                    console.error('Không thể lấy thông tin shares:', err);
                }
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu ban đầu:', error);
                setErrorMessage('Không thể tải dữ liệu. Vui lòng thử lại sau.');
            }
        };

        fetchInitialData();
    }, [post?.id, currentUser?.id]);

    // Thêm hàm mới để lấy comments khi cần
    const loadComments = async () => {
        if (!post) return;

        try {
            setErrorMessage('');
            const commentsData = await getComments(post.id);
            setComments(commentsData || []);
        } catch (error) {
            console.error('Lỗi khi lấy bình luận:', error);
            setErrorMessage('Không thể tải bình luận. Vui lòng thử lại sau.');
        }
    };

    const handleLike = async () => {
        if (!currentUser) {
            setErrorMessage('Vui lòng đăng nhập để thích bài viết');
            return;
        }

        try {
            setErrorMessage(''); // Xóa thông báo lỗi cũ
            if (liked) {
                await unlikePost(post.id, currentUser.id);
                setLikesCount(Math.max(0, likesCount - 1));
                setLiked(false);
            } else {
                await likePost(post.id, currentUser.id);
                setLikesCount(likesCount + 1);
                setLiked(true);
            }
        } catch (error) {
            console.error('Lỗi khi thích bài viết:', error);
            setErrorMessage('Không thể thích bài viết. Vui lòng thử lại sau.');
        }
    };

    const handleToggleComments = () => {
        const newShowComments = !showComments;
        setShowComments(newShowComments);

        // Nếu đang mở comments và chưa có dữ liệu, thì load comments
        if (newShowComments && comments.length === 0) {
            loadComments();
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentContent.trim()) return;
        if (!currentUser) {
            setErrorMessage('Vui lòng đăng nhập để bình luận');
            return;
        }

        try {
            setErrorMessage(''); // Xóa thông báo lỗi cũ
            const newComment = await addComment(post.id, currentUser.id, commentContent);
            if (newComment) {
                setComments([...comments, newComment]);
                setCommentContent('');
            } else {
                setErrorMessage('Không thể thêm bình luận. Vui lòng thử lại sau.');
            }
        } catch (error) {
            console.error('Lỗi khi thêm bình luận:', error);
            setErrorMessage('Không thể thêm bình luận. Vui lòng thử lại sau.');
        }
    };

    const handleShare = () => {
        if (!currentUser) {
            setErrorMessage('Vui lòng đăng nhập để chia sẻ bài viết');
            return;
        }

        // Hiển thị dialog chia sẻ thay vì gọi API trực tiếp
        setShowShareDialog(true);
    };

    // Xử lý khi chia sẻ thành công từ dialog
    const handleShareSuccess = (result) => {
        setSharesCount(sharesCount + 1);
        setShowShareDialog(false);
    };

    const handleEditComment = (comment) => {
        setEditingCommentId(comment.id);
        setEditingContent(comment.content);
    };

    const handleSaveEdit = async (commentId) => {
        if (!editingContent.trim()) return;

        try {
            setErrorMessage(''); // Xóa thông báo lỗi cũ
            const updatedComment = await updateComment(commentId, editingContent);
            if (updatedComment) {
                setComments(
                    comments.map((comment) =>
                        comment.id === commentId ? { ...comment, content: updatedComment.content } : comment,
                    ),
                );
                setEditingCommentId(null);
                setEditingContent('');
            } else {
                setErrorMessage('Không thể chỉnh sửa bình luận. Vui lòng thử lại sau.');
            }
        } catch (error) {
            console.error('Lỗi khi chỉnh sửa bình luận:', error);
            setErrorMessage('Không thể chỉnh sửa bình luận. Vui lòng thử lại sau.');
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            setErrorMessage(''); // Xóa thông báo lỗi cũ
            const success = await deleteComment(commentId);
            if (success) {
                setComments(comments.filter((comment) => comment.id !== commentId));
            } else {
                setErrorMessage('Không thể xóa bình luận. Vui lòng thử lại sau.');
            }
        } catch (error) {
            console.error('Lỗi khi xóa bình luận:', error);
            setErrorMessage('Không thể xóa bình luận. Vui lòng thử lại sau.');
        }
    };

    // Điều chỉnh giao diện dựa trên việc hiển thị bài viết đầy đủ hoặc bài viết đã chia sẻ
    const username = post?.user?.username || post?.user?.firstName || 'Người dùng';
    const createdAt = post?.createdAt
        ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })
        : '';
    const hasImage = post?.imageUrl && post.imageUrl.trim() !== '';
    const hasVideo = post?.videoUrl && post.videoUrl.trim() !== '';

    return (
        <div
            className={`w-full bg-white ${
                !isSharedPost ? 'shadow rounded-lg overflow-hidden mt-3' : 'border-t border-gray-200'
            }`}
        >
            {/* Hiển thị phần header của bài viết */}
            <div className={`p-3 ${isSharedPost ? 'pb-2' : ''}`}>
                <div className="flex items-center">
                    <img
                        src={getAvatarUrl(post?.user?.avatar)}
                        alt="avatar"
                        className={`rounded-full mr-2.5 ${isSharedPost ? 'w-8 h-8' : 'w-10 h-10'}`}
                        onError={(e) => handleImageError(e)}
                    />
                    <div>
                        <h6 className={`m-0 font-bold ${isSharedPost ? 'text-xs' : 'text-sm'}`}>{username}</h6>
                        <small className="text-xs text-gray-500">{createdAt}</small>
                    </div>
                </div>
                <p className={`mt-2 ${isSharedPost ? 'text-xs' : 'text-sm'}`}>{post?.content || 'Không có nội dung'}</p>
            </div>

            {/* Hiển thị hình ảnh/video của bài viết */}
            {!isSharedPost && (hasImage || hasVideo) && (
                <div className="mt-2">
                    {hasVideo ? (
                        <video controls className="max-w-full h-auto">
                            <source src={getImageUrl(post.videoUrl)} type="video/mp4" />
                        </video>
                    ) : (
                        <img
                            src={getImageUrl(post.imageUrl)}
                            alt="post"
                            className="max-w-full h-auto"
                            onError={(e) => handleImageError(e)}
                        />
                    )}
                </div>
            )}

            {/* Phần hiển thị số lượt thích, chia sẻ và các nút tương tác */}
            {!isSharedPost && (
                <div className="p-3">
                    {errorMessage && <p className="text-red-500 text-sm mb-2">{errorMessage}</p>}
                    <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-500">{likesCount} lượt thích</span>
                        <span className="text-sm text-gray-500">{sharesCount} lượt chia sẻ</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                        {actions.map((action, index) => (
                            <ActionButton
                                key={index}
                                icon={action.icon}
                                label={action.label}
                                onClick={
                                    action.key === 'like'
                                        ? handleLike
                                        : action.key === 'comment'
                                        ? handleToggleComments
                                        : handleShare
                                }
                                active={action.key === 'like' ? liked : false}
                                activeIcon={action.key === 'like' ? 'bi-hand-thumbs-up-fill' : action.icon}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Phần hiển thị bình luận */}
            {showComments && (
                <div className="px-3 pb-3">
                    {/* Phần nhập bình luận */}
                    <form onSubmit={handleComment} className="flex items-center mb-3">
                        <img
                            src={getAvatarUrl(currentUser?.avatar)}
                            alt="avatar"
                            className="w-8 h-8 rounded-full mr-2"
                            onError={(e) => handleImageError(e)}
                        />
                        <input
                            type="text"
                            placeholder="Viết bình luận..."
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            className="flex-1 p-2 rounded-full bg-gray-100 text-sm"
                        />
                        <button
                            type="submit"
                            disabled={!commentContent.trim()}
                            className="ml-2 text-blue-500 disabled:text-gray-300"
                        >
                            <i className="bi bi-send"></i>
                        </button>
                    </form>

                    {/* Danh sách bình luận */}
                    <div className="space-y-2">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex items-start gap-2 mb-2">
                                <img
                                    src={getAvatarUrl(comment.user?.avatar)}
                                    alt="avatar"
                                    className="w-8 h-8 rounded-full"
                                    onError={(e) => handleImageError(e)}
                                />
                                <div className="flex-grow">
                                    {editingCommentId === comment.id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={editingContent}
                                                onChange={(e) => setEditingContent(e.target.value)}
                                                className="flex-grow p-2 border rounded-lg text-sm outline-none"
                                            />
                                            <button
                                                onClick={() => handleSaveEdit(comment.id)}
                                                className="text-blue-500 font-semibold"
                                                disabled={!editingContent.trim()}
                                            >
                                                Lưu
                                            </button>
                                            <button
                                                onClick={() => setEditingCommentId(null)}
                                                className="text-gray-500 font-semibold"
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-100 p-2 rounded-lg">
                                            <p className="text-sm font-semibold">
                                                {comment.user?.username || 'Người dùng'}
                                            </p>
                                            <p className="text-sm">{comment.content}</p>
                                            {currentUser && comment.user?.id === currentUser.id && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    <button
                                                        onClick={() => handleEditComment(comment)}
                                                        className="mr-2 hover:text-blue-500"
                                                    >
                                                        Chỉnh sửa
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="hover:text-red-500"
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Dialog chia sẻ */}
            {showShareDialog && (
                <ShareDialog
                    post={post}
                    currentUser={currentUser}
                    onClose={() => setShowShareDialog(false)}
                    onShareSuccess={handleShareSuccess}
                />
            )}
        </div>
    );
};

PostItem.propTypes = {
    post: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        content: PropTypes.string,
        imageUrl: PropTypes.string,
        videoUrl: PropTypes.string,
        createdAt: PropTypes.string,
        user: PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            username: PropTypes.string,
            avatar: PropTypes.string,
        }),
    }),
    isSharedPost: PropTypes.bool,
};

export default PostItem;
