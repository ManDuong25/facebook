import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PostItem from './PostItem';
import SharedPostItem from './SharedPostItem';
import { setPosts } from '../../../redux/features/postSlice';
import { getAllPosts } from '../../../services/api';
import { checkFriendshipStatus } from '../../../services/friendService';

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
                const postsData = await getAllPosts();
                console.log('Tất cả bài viết:', postsData);

                // Kiểm tra và xử lý dữ liệu trả về
                if (Array.isArray(postsData)) {
                    // Sử dụng Map để loại bỏ các bài viết trùng lặp
                    const uniquePostsMap = new Map();

                    // Lọc và xử lý từng bài viết
                    for (const post of postsData) {
                        if (post && post.id) {
                            // Lọc bỏ bài viết không hợp lệ
                            if (post.content || post.imageUrl || post.videoUrl) {
                                // Lấy userId từ post (có thể từ post.userId hoặc post.user.id)
                                const postUserId = post.userId || (post.user && post.user.id);

                                console.log('Xử lý bài viết:', {
                                    postId: post.id,
                                    postUserId,
                                    currentUserId: currentUser.id,
                                    content: post.content,
                                    isShared: post.shareId ? true : false,
                                });

                                if (!postUserId) {
                                    console.error('Post không có userId:', post);
                                    continue;
                                }

                                // Kiểm tra xem bài viết có phải của người dùng hiện tại không
                                const isCurrentUserPost = postUserId === currentUser.id;
                                console.log('Là bài viết của người dùng hiện tại:', isCurrentUserPost);

                                // Nếu không phải bài viết của người dùng hiện tại, kiểm tra trạng thái bạn bè
                                let shouldShowPost = isCurrentUserPost;
                                if (!isCurrentUserPost) {
                                    try {
                                        console.log('Kiểm tra trạng thái bạn bè giữa:', {
                                            user1Id: currentUser.id,
                                            user2Id: postUserId,
                                        });

                                        const friendshipStatus = await checkFriendshipStatus(
                                            currentUser.id,
                                            postUserId,
                                        );
                                        console.log('Kết quả kiểm tra trạng thái bạn bè:', friendshipStatus);

                                        // Kiểm tra nếu status là ACCEPTED thì là bạn bè
                                        shouldShowPost = friendshipStatus.status === 'ACCEPTED';
                                    } catch (error) {
                                        console.error('Error checking friendship status:', error);
                                        shouldShowPost = false;
                                    }
                                }

                                console.log('Quyết định hiển thị bài viết:', shouldShowPost);

                                // Chỉ thêm bài viết nếu là của bạn bè hoặc của chính mình
                                if (shouldShowPost) {
                                    // Nếu là bài viết được chia sẻ (có shareId và sharedAt)
                                    if (post.shareId && post.sharedAt) {
                                        uniquePostsMap.set(`shared-${post.id}-${post.shareId}`, {
                                            ...post,
                                            isShared: true,
                                        });
                                        console.log('Đã thêm bài viết được chia sẻ:', post.id);
                                    } else {
                                        // Nếu là bài viết gốc
                                        uniquePostsMap.set(post.id, {
                                            ...post,
                                            isShared: false,
                                        });
                                        console.log('Đã thêm bài viết gốc:', post.id);
                                    }
                                }
                            }
                        }
                    }

                    // Chuyển Map thành mảng bài viết duy nhất
                    const uniquePosts = Array.from(uniquePostsMap.values());
                    console.log('Danh sách bài viết sau khi lọc:', uniquePosts);

                    // Sắp xếp bài viết theo thời gian (mới nhất lên đầu)
                    const sortedPosts = uniquePosts.sort((a, b) => {
                        const dateA = new Date(a.sharedAt || a.createdAt);
                        const dateB = new Date(b.sharedAt || b.createdAt);
                        return dateB - dateA;
                    });

                    console.log('Danh sách bài viết sau khi sắp xếp:', sortedPosts);
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
