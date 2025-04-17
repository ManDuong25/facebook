import React, { useState, useEffect, useCallback } from 'react';
import Profile from '../components/Content/ProfileContent/Profile';
import { getProfile } from '../services/profileService';
import { getPostsByUser } from '../services/api';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProfilePage = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Dùng để trigger effect

    // Get the current user from Redux store
    const currentUser = useSelector((state) => state.auth.user);

    // Get navigate function for redirection
    const navigate = useNavigate();

    // Get user ID from URL params (if available)
    const { id: urlUserId } = useParams();

    // Check if we should redirect (when viewing own profile with ID in URL)
    useEffect(() => {
        // If we're viewing a profile with an ID, and that ID matches current user
        if (urlUserId && currentUser && urlUserId === currentUser.id.toString()) {
            // Redirect to /profile (without ID)
            navigate('/profile', { replace: true });
        }
    }, [urlUserId, currentUser, navigate]);

    // Tải thông tin hồ sơ từ API khi component được tải
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setIsLoading(true);

                // Determine which user ID to use:
                // If urlUserId is provided, use that
                // Otherwise use the current user's ID
                const userId = urlUserId || currentUser?.id;

                if (!userId) {
                    setError('Không tìm thấy ID người dùng');
                    setIsLoading(false);
                    return;
                }

                console.log(`Fetching profile for user ID: ${userId}`);
                const profileData = await getProfile(userId);

                if (profileData) {
                    setUserProfile(profileData);
                    console.log('Loaded user profile:', profileData);
                } else {
                    setError('Không tìm thấy thông tin người dùng');
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Đã xảy ra lỗi khi tải thông tin hồ sơ');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, [currentUser?.id, urlUserId]);

    // Hàm để tải lại dữ liệu bài viết, có thể gọi khi cần làm mới
    const fetchUserPosts = useCallback(async () => {
        if (!userProfile?.id) return;

        try {
            setIsLoadingPosts(true);
            console.log('Fetching posts for user ID:', userProfile.id);

            // Lấy dữ liệu bài viết từ API
            const postsData = await getPostsByUser(userProfile.id);
            console.log('Raw posts data for profile:', postsData);

            // Kiểm tra dữ liệu trả về có phải là mảng không
            if (!Array.isArray(postsData)) {
                console.error('Posts data is not an array:', postsData);
                setUserPosts([]);
                return;
            }

            // Đảm bảo bài viết có ID và không bị trùng lặp
            const uniquePostsMap = new Map();
            postsData.forEach((post) => {
                if (post && post.id) {
                    // Lọc bài viết rỗng hoặc nội dung không hợp lệ
                    if (post.content || post.imageUrl || post.videoUrl) {
                        uniquePostsMap.set(post.id, post);
                    }
                }
            });

            // Chuyển Map thành mảng và sắp xếp theo thời gian tạo (mới nhất lên đầu)
            const uniquePosts = Array.from(uniquePostsMap.values());
            const sortedPosts = uniquePosts.sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            console.log(`Profile posts processed: ${postsData.length} raw posts → ${uniquePosts.length} unique posts`);
            setUserPosts(sortedPosts);
        } catch (err) {
            console.error('Error fetching user posts:', err);
            setUserPosts([]);
            toast.error('Không thể tải bài viết. Vui lòng thử lại.');
        } finally {
            setIsLoadingPosts(false);
        }
    }, [userProfile?.id]);

    // Tải bài viết của người dùng khi có userProfile hoặc khi refreshTrigger thay đổi
    useEffect(() => {
        fetchUserPosts();
    }, [fetchUserPosts, refreshTrigger]);

    // Hàm làm mới dữ liệu khi có bài viết mới
    const handleRefreshPosts = () => {
        setRefreshTrigger((prev) => prev + 1);
    };

    const handleAvatarUpdate = (newAvatarUrl) => {
        if (userProfile) {
            setUserProfile({
                ...userProfile,
                avatar: newAvatarUrl,
            });
        }
    };

    const handleCoverUpdate = (newCoverUrl) => {
        if (userProfile) {
            setUserProfile({
                ...userProfile,
                coverPhotoUrl: newCoverUrl,
            });
        }
    };

    // Check if this is the current user's profile
    const isOwnProfile = !urlUserId && currentUser && userProfile && currentUser.id === userProfile.id;

    // Debug profile info
    useEffect(() => {
        console.log('ProfilePage Debug:');
        console.log('- urlUserId:', urlUserId);
        console.log('- currentUser ID:', currentUser?.id);
        console.log('- isOwnProfile:', isOwnProfile);
        console.log('- userProfile ID:', userProfile?.id);
    }, [urlUserId, currentUser, isOwnProfile, userProfile]);

    return (
        <div>
            {isLoading ? (
                <div className="flex justify-center items-center h-screen">
                    <span className="text-gray-600">Đang tải hồ sơ...</span>
                </div>
            ) : error ? (
                <div className="flex justify-center items-center h-screen">
                    <span className="text-red-500">{error}</span>
                </div>
            ) : (
                <Profile
                    userProfile={userProfile}
                    posts={userPosts}
                    friends={[]}
                    photos={[]}
                    onAvatarUpdate={handleAvatarUpdate}
                    onCoverUpdate={handleCoverUpdate}
                    isLoading={isLoadingPosts}
                    isOwnProfile={isOwnProfile}
                    onRefreshPosts={handleRefreshPosts}
                />
            )}
        </div>
    );
};

export default ProfilePage;
