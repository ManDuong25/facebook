import React, { useState, useEffect } from "react";
import Profile from "../components/Content/ProfileContent/Profile";
import { getProfile } from "../services/profileService";
import { getPostsByUser } from "../services/api";
import { useSelector } from "react-redux";

const ProfilePage = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);  
  // Get the current user from Redux store
  const currentUser = useSelector((state) => state.auth.user);

  // Tải thông tin hồ sơ từ API khi component được tải
  useEffect(() => {

    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        // Use the current user's ID from the Redux store instead of hardcoded ID
        const userId = currentUser?.id || 1;
        const profileData = await getProfile(userId);
        
        if (profileData) {
          setUserProfile(profileData);
          console.log("Loaded user profile:", profileData);
        } else {
          setError("Không tìm thấy thông tin người dùng");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Đã xảy ra lỗi khi tải thông tin hồ sơ");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
    
    // Thêm event listener để làm mới thông tin khi tab được kích hoạt lại
    // const handleVisibilityChange = () => {
    //   if (document.visibilityState === 'visible') {
    //     fetchUserProfile();
    //   }
    // };
    // document.addEventListener('visibilitychange', handleVisibilityChange);  
    // // Làm mới thông tin định kỳ mỗi 5 phút
    // const refreshInterval = setInterval(fetchUserProfile, 5 * 60 * 1000);
    
    // return () => {
    //   document.removeEventListener('visibilitychange', handleVisibilityChange);
    //   clearInterval(refreshInterval);
    // };
  }, [currentUser?.id]);

  // Tải bài viết của người dùng khi có userProfile
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!userProfile?.id) return;
      
      try {
        setIsLoadingPosts(true);
        console.log("Fetching posts for user ID:", userProfile.id);
        
        // Lấy dữ liệu bài viết từ API
        const postsData = await getPostsByUser(userProfile.id);
        console.log("Raw posts data for profile:", postsData);
        
        // Kiểm tra dữ liệu trả về có phải là mảng không
        if (!Array.isArray(postsData)) {
          console.error("Posts data is not an array:", postsData);
          setUserPosts([]);
          return;
        }
        
        // Đảm bảo bài viết có ID và không bị trùng lặp
        const uniquePostsMap = new Map();
        postsData.forEach(post => {
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
        console.error("Error fetching user posts:", err);
        setUserPosts([]);
      } finally {
        setIsLoadingPosts(false);
      }
    };
    
    fetchUserPosts();
  }, [userProfile?.id]);

  const handleAvatarUpdate = (newAvatarUrl) => {
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        avatar: newAvatarUrl
      });
    }
  };

  const handleCoverUpdate = (newCoverUrl) => {
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        coverPhotoUrl: newCoverUrl
      });
    }
  };

  // Check if this is the current user's profile
  const isOwnProfile = currentUser && userProfile && currentUser.id === userProfile.id;

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
          isOwnProfile={isOwnProfile} // Pass this flag to Profile component
        />
      )}
    </div>
  );
};

export default ProfilePage;