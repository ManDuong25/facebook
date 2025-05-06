import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

// Import các sub-components
import CoverPhoto from './CoverPhoto';
import ProfileHeader from './ProfileHeader'; // Import ProfileHeader
import ProfileNavigation from './ProfileNavigation';
import CreatePost from '../HomeContent/CreatePost';
import PostItem from '../HomeContent/PostItem';
import SharedPostItem from '../HomeContent/SharedPostItem'; // Import component mới
import ProfileInfo from './ProfileInfo';
import AboutSection from './AboutSection';
import FriendsSection from './FriendsSection';
import PhotosSection from './PhotosSection';
import { uploadCoverPhoto } from '../../../services/profileService';
import { getSharedPostsByUser } from '../../../services/api'; // Import API mới

const Profile = ({
    userProfile,
    posts = [],
    friends = [],
    photos = [],
    onAvatarUpdate = null, // Nhận callback để cập nhật avatar từ component cha
    onCoverUpdate = null, // Nhận callback để cập nhật ảnh bìa từ component cha
    isLoading = false, // Thêm prop isLoading
    onRefreshPosts = null, // Callback để làm mới dữ liệu bài viết
}) => {
    const [activeTab, setActiveTab] = useState('posts');
    const [viewMode, setViewMode] = useState('list');
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [sharedPosts, setSharedPosts] = useState([]);
    const [isLoadingSharedPosts, setIsLoadingSharedPosts] = useState(false);
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const [page, setPage] = useState(0);
    const { id: userId } = useParams();
    const currentUserId = JSON.parse(localStorage.getItem('user')).id;
    const isOwnProfile = userProfile?.id === currentUserId;

    // Fetch bài viết đã chia sẻ
    useEffect(() => {
        const fetchSharedPosts = async () => {
            if (!userProfile?.id) return;

            try {
                setIsLoadingSharedPosts(true);
                const data = await getSharedPostsByUser(userProfile.id);
                setSharedPosts(data);
            } catch (error) {
                console.error('Error fetching shared posts:', error);
            } finally {
                setIsLoadingSharedPosts(false);
            }
        };

        fetchSharedPosts();
    }, [userProfile?.id]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
    };

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
    };

    const handleEditProfile = () => {
        console.log('Edit profile');
    };

    // Hàm wrapper để xử lý cập nhật avatar
    const handleAvatarUpdate = (newAvatarUrl) => {
        if (onAvatarUpdate) {
            onAvatarUpdate(newAvatarUrl);
        }
    };

    // Hàm xử lý cập nhật ảnh bìa
    const handleCoverPhotoUpdate = async (coverFile) => {
        if (!coverFile || !userProfile?.id) return;

        setIsUploadingCover(true);

        try {
            const newCoverUrl = await uploadCoverPhoto(userProfile.id, coverFile);

            // Cập nhật state qua callback
            if (onCoverUpdate) {
                onCoverUpdate(newCoverUrl);
            }
        } catch (error) {
            console.error('Error uploading cover photo:', error);
            alert('Không thể tải lên ảnh bìa: ' + (error.message || 'Lỗi không xác định'));
        } finally {
            setIsUploadingCover(false);
        }
    };

    // Hàm xử lý khi có bài viết mới được tạo
    const handlePostCreated = (newPost) => {
        // Chỉ gọi callback để làm mới dữ liệu bài viết từ component cha
        if (onRefreshPosts) {
            onRefreshPosts();
        }
    };

    // Thêm hàm xử lý khi chia sẻ bài viết thành công
    const handleShareSuccess = () => {
        // Làm mới danh sách bài viết đã chia sẻ
        const fetchSharedPosts = async () => {
            if (!userProfile?.id) return;

            try {
                setIsLoadingSharedPosts(true);
                const data = await getSharedPostsByUser(userProfile.id);
                setSharedPosts(data);
            } catch (error) {
                console.error('Error fetching shared posts:', error);
            } finally {
                setIsLoadingSharedPosts(false);
            }
        };

        fetchSharedPosts();
    };

    return (
        <div className="w-full min-h-screen bg-gray-100">
            <div className="bg-white shadow">
                <div className="w-[72%] mx-auto relative">
                    {/* Ảnh bìa */}
                    <CoverPhoto
                        coverPhotoUrl={userProfile?.coverPhotoUrl}
                        isOwnProfile={isOwnProfile}
                        onEditCover={isOwnProfile ? handleCoverPhotoUpdate : null}
                    />

                    {/* Sử dụng ProfileHeader */}
                    <ProfileHeader
                        userProfile={userProfile}
                        isOwnProfile={isOwnProfile}
                        onAvatarUpdate={isOwnProfile ? handleAvatarUpdate : null}
                    />

                    {/* Thanh điều hướng */}
                    <div className="border-t">
                        <div className="pl-8">
                            <ProfileNavigation
                                activeTab={activeTab}
                                onTabChange={handleTabChange}
                                isOwnProfile={isOwnProfile}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Nội dung chính */}
            <div className="w-[72%] mx-auto mt-4 flex gap-4 pl-8">
                <div className="w-[360px] space-y-4">
                    <ProfileInfo
                        userId={userProfile?.id || '1'}
                        isOwnProfile={isOwnProfile}
                        onEditDetails={isOwnProfile ? handleEditProfile : null}
                    />
                    <PhotosSection isOwnProfile={isOwnProfile} />
                    <FriendsSection userId={userProfile?.id} preview={false} />
                </div>

                <div className="flex-1">
                    {activeTab === 'posts' && (
                        <>
                            {/* Cho phép tạo bài viết mới trên cả trang của người khác, luôn sử dụng thông tin người dùng đang đăng nhập */}
                            <CreatePost className="pl-8" onPostCreated={handlePostCreated} />

                            <div className="bg-white rounded-lg shadow mb-4 mt-4">
                                <div className="flex justify-between items-center px-8 py-2 border-b">
                                    <h2 className="text-xl font-bold">Bài viết</h2>
                                    {isOwnProfile && (
                                        <div className="flex gap-1.5">
                                            <button className="flex items-center px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-[13px]">
                                                <i className="bi bi-funnel mr-1.5"></i>
                                                Bộ lọc
                                            </button>
                                            <button
                                                className="flex items-center px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-[13px]"
                                                onClick={onRefreshPosts}
                                            >
                                                <i className="bi bi-arrow-clockwise mr-1.5"></i>
                                                Làm mới
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center px-8">
                                    <button
                                        onClick={() => handleViewModeChange('list')}
                                        className={`flex-1 flex items-center justify-center px-4 py-3 border-b-2 ${
                                            viewMode === 'list'
                                                ? 'border-blue-500 text-blue-500'
                                                : 'border-transparent hover:bg-gray-100'
                                        }`}
                                    >
                                        <i className="bi bi-list-ul mr-2"></i>
                                        Chế độ xem danh sách
                                    </button>
                                    <button
                                        onClick={() => handleViewModeChange('grid')}
                                        className={`flex-1 flex items-center justify-center px-4 py-3 border-b-2 ${
                                            viewMode === 'grid'
                                                ? 'border-blue-500 text-blue-500'
                                                : 'border-transparent hover:bg-gray-100'
                                        }`}
                                    >
                                        <i className="bi bi-grid-3x3-gap mr-2"></i>
                                        Chế độ xem lưới
                                    </button>
                                </div>
                            </div>
                            <div
                                className={`space-y-4 ${viewMode === 'grid' ? 'grid grid-cols-3 gap-4 space-y-0' : ''}`}
                            >
                                {/* Hiển thị bài viết đã chia sẻ */}
                                {isLoadingSharedPosts ? (
                                    <div className="text-center py-4">Đang tải bài viết đã chia sẻ...</div>
                                ) : sharedPosts && sharedPosts.length > 0 ? (
                                    sharedPosts.map((post, index) => (
                                        <SharedPostItem
                                            key={`shared-${post.id}-${post.shareId}-${
                                                post.sharedAt || Date.now()
                                            }-${index}`}
                                            share={{
                                                post: post,
                                                user: userProfile,
                                                sharedAt: post.sharedAt,
                                            }}
                                            onShareSuccess={handleShareSuccess}
                                        />
                                    ))
                                ) : null}

                                {/* Hiển thị bài viết gốc */}
                                {isLoading ? (
                                    <div className="text-center py-4">Đang tải bài viết của bạn...</div>
                                ) : posts && posts.length > 0 ? (
                                    posts.map((post) => {
                                        // Kiểm tra bài viết có hợp lệ và có nội dung không
                                        if (!post || (!post.content && !post.imageUrl && !post.videoUrl)) {
                                            return null;
                                        }
                                        return <PostItem key={`post-${post.id}`} post={post} />;
                                    })
                                ) : null}

                                {!isLoading &&
                                    !isLoadingSharedPosts &&
                                    (!posts || posts.length === 0) &&
                                    (!sharedPosts || sharedPosts.length === 0) && (
                                        <div className="text-center py-8 text-gray-500">
                                            <i className="bi bi-file-earmark-post text-5xl mb-2 block"></i>
                                            <p>Chưa có bài viết nào</p>
                                        </div>
                                    )}
                            </div>
                        </>
                    )}
                    {activeTab === 'about' && <AboutSection userId={userProfile?.id || '1'} />}
                    {activeTab === 'friends' && <FriendsSection userId={userProfile?.id} preview={false} />}
                    {activeTab === 'photos' && <PhotosSection isOwnProfile={isOwnProfile} />}
                </div>
            </div>
        </div>
    );
};

export default Profile;
