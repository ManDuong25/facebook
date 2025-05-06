import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import PostItem from './PostItem';
import images from '../../../assets/images';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getAvatarUrl, handleImageError } from '../../../utils/avatarUtils';
import {
    likePost,
    unlikePost,
    addComment,
    getComments,
    sharePost,
    getLikeStatus,
    getShares,
} from '../../../services/api';
import { useSelector } from 'react-redux';
import ShareDialog from './ShareDialog';

// Component nút tương tác (thích, bình luận, chia sẻ)
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

const SharedPostItem = ({ share, onShareSuccess }) => {
    const { post, user, sharedAt } = share;
    const formattedDate = sharedAt ? formatDistanceToNow(new Date(sharedAt), { addSuffix: true, locale: vi }) : '';

    const currentUser = useSelector((state) => state.auth.user);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [sharesCount, setSharesCount] = useState(0);
    const [comments, setComments] = useState([]);
    const [commentContent, setCommentContent] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingContent, setEditingContent] = useState('');

    // Kiểm tra xem có dữ liệu người dùng hay không
    if (!user || !post) {
        return null;
    }

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

        // Hiển thị dialog chia sẻ
        setShowShareDialog(true);
    };

    // Xử lý khi chia sẻ thành công từ dialog
    const handleShareSuccess = (result) => {
        setSharesCount(sharesCount + 1);
        setShowShareDialog(false);
        // Gọi callback để cập nhật danh sách bài viết
        if (onShareSuccess) {
            onShareSuccess(result);
        }
    };

    return (
        <div className="w-full bg-white shadow rounded-lg overflow-hidden mt-3">
            <div className="p-3 border-b">
                <div className="flex items-center">
                    <img
                        src={getAvatarUrl(user.avatar)}
                        alt={user.username || 'Người dùng'}
                        className="w-10 h-10 rounded-full mr-2.5"
                        onError={handleImageError}
                    />
                    <div>
                        <h6 className="m-0 text-sm font-bold">{user.username || 'Người dùng'}</h6>
                        <small className="text-xs text-gray-500">{formattedDate}</small>
                    </div>
                </div>
            </div>

            {/* Bài viết được chia sẻ */}
            <div className="mx-3 my-3 border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                <PostItem post={post} isSharedPost={true} />
            </div>

            {/* Phần hiển thị số lượt thích, chia sẻ và các nút tương tác */}
            <div className="p-3">
                {errorMessage && <p className="text-red-500 text-sm mb-2">{errorMessage}</p>}
                <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500">{likesCount} lượt thích</span>
                    <span className="text-sm text-gray-500">{sharesCount} lượt chia sẻ</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                    <ActionButton
                        icon="bi-hand-thumbs-up"
                        label="Thích"
                        onClick={handleLike}
                        active={liked}
                        activeIcon="bi-hand-thumbs-up-fill"
                    />
                    <ActionButton icon="bi-chat" label="Bình luận" onClick={handleToggleComments} />
                    <ActionButton icon="bi-share" label="Chia sẻ" onClick={handleShare} />
                </div>
            </div>

            {/* Phần hiển thị bình luận */}
            {showComments && (
                <div className="px-3 pb-3">
                    {/* Phần nhập bình luận */}
                    <form onSubmit={handleComment} className="flex items-center mb-3">
                        <img
                            src={getAvatarUrl(currentUser?.avatar)}
                            alt="avatar"
                            className="w-8 h-8 rounded-full mr-2"
                            onError={handleImageError}
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
                                    onError={handleImageError}
                                />
                                <div className="flex-grow">
                                    <div className="bg-gray-100 p-2 rounded-lg">
                                        <p className="text-sm font-semibold">
                                            {comment.user?.username || 'Người dùng'}
                                        </p>
                                        <p className="text-sm">{comment.content}</p>
                                    </div>
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

SharedPostItem.propTypes = {
    share: PropTypes.shape({
        id: PropTypes.number,
        post: PropTypes.object.isRequired,
        user: PropTypes.object.isRequired,
        sharedAt: PropTypes.string,
    }).isRequired,
    onShareSuccess: PropTypes.func,
};

export default SharedPostItem;
