import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PostItem from './PostItem';
import SharedPostItem from './SharedPostItem';
import { setPosts } from '../../../redux/features/postSlice';
import { getUserFeed } from '../../../services/sharePostService';

const PostList = () => {
    const dispatch = useDispatch();
    const posts = useSelector((state) => state.post.posts);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const currentUser = useSelector((state) => state.auth.user);

    useEffect(() => {
        const fetchPosts = async () => {
            if (!currentUser?.id) return;

            setLoading(true);
            try {
                const postsData = await getUserFeed(currentUser.id);

                if (Array.isArray(postsData)) {
                    // Sử dụng Map để loại bỏ các bài viết trùng lặp
                    const uniquePostsMap = new Map();

                    // Lọc và xử lý từng bài viết
                    for (const post of postsData) {
                        if (post && post.id) {
                            // Lọc bỏ bài viết không hợp lệ
                            if (post.content || post.imageUrl || post.videoUrl) {
                                // Đảm bảo thông tin user đầy đủ
                                const postWithUser = {
                                    ...post,
                                    user: post.user || {
                                        id: post.userId,
                                        username: post.username,
                                        firstName: post.firstName,
                                        lastName: post.lastName,
                                        avatarUrl: post.avatarUrl,
                                    },
                                };

                                // Nếu là bài viết được chia sẻ (có shareId và sharedAt)
                                if (post.shareId && post.sharedAt) {
                                    uniquePostsMap.set(`shared-${post.id}-${post.shareId}`, {
                                        ...postWithUser,
                                        isShared: true,
                                    });
                                } else {
                                    // Nếu là bài viết gốc
                                    uniquePostsMap.set(post.id, {
                                        ...postWithUser,
                                        isShared: false,
                                    });
                                }
                            }
                        }
                    }

                    // Chuyển Map thành mảng bài viết duy nhất
                    const uniquePosts = Array.from(uniquePostsMap.values());

                    // Sắp xếp bài viết theo thời gian (mới nhất lên đầu)
                    const sortedPosts = uniquePosts.sort((a, b) => {
                        const dateA = new Date(a.sharedAt || a.createdAt);
                        const dateB = new Date(b.sharedAt || b.createdAt);
                        return dateB - dateA;
                    });

                    dispatch(setPosts(sortedPosts));
                } else {
                    console.error('❌ Dữ liệu trả về không phải là mảng:', postsData);
                    setError('Dữ liệu không hợp lệ');
                    dispatch(setPosts([]));
                }
            } catch (error) {
                console.error('❌ Lỗi khi kết nối API:', error);
                setError('Không thể tải bài viết');
                dispatch(setPosts([]));
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [dispatch, currentUser?.id]);

    if (loading) {
        return <div className="p-4 text-center">Đang tải bài viết...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500">{error}</div>;
    }

    if (!posts || !posts.length) {
        return <div className="p-4 text-center">Chưa có bài viết nào.</div>;
    }

    return (
        <div>
            {posts.map((post) =>
                post.isShared ? (
                    <SharedPostItem
                        key={`shared-${post.id}-${post.shareId}`}
                        share={{
                            post: post,
                            user: post.user,
                            sharedAt: post.sharedAt,
                        }}
                    />
                ) : (
                    <PostItem key={post.id} post={post} />
                ),
            )}
        </div>
    );
};

export default PostList;
