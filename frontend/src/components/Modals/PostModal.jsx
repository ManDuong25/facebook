import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPostById } from '../../services/postService';
import { getAvatarUrl, handleImageError } from '../../utils/avatarUtils';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const PostModal = ({ onClose }) => {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const data = await getPostById(postId);
                setPost(data);
                setLoading(false);
            } catch (err) {
                setError('Không thể tải bài viết');
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-64 bg-gray-200 rounded mb-4"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
                    <div className="text-red-500 text-center">{error}</div>
                    <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                        Đóng
                    </button>
                </div>
            </div>
        );
    }

    if (!post) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                        <img
                            src={getAvatarUrl(post.user?.avatar)}
                            alt={post.user?.username}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={handleImageError}
                        />
                        <div>
                            <h3 className="font-semibold">
                                {post.user?.firstName} {post.user?.lastName}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                </div>

                {post.imageUrl && (
                    <div className="mb-4">
                        <img src={post.imageUrl} alt="Post image" className="max-w-full h-auto rounded-lg" />
                    </div>
                )}

                {post.videoUrl && (
                    <div className="mb-4">
                        <video controls className="max-w-full h-auto rounded-lg">
                            <source src={post.videoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                )}

                <div className="flex items-center justify-between text-gray-500 text-sm border-t border-b py-2 my-4">
                    <div className="flex items-center space-x-4">
                        <span>{post.likes?.length || 0} lượt thích</span>
                        <span>{post.comments?.length || 0} bình luận</span>
                        <span>{post.shares?.length || 0} lượt chia sẻ</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostModal;
