import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { uploadAvatar } from '../../../services/profileService.js';
import images from '../../../assets/images';
import { useSelector } from 'react-redux';
import { getAvatarUrl, handleImageError as globalHandleImageError } from '../../../utils/avatarUtils';

const ProfileHeader = ({ userProfile, isOwnProfile, onAvatarUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  
  // Get the current user from Redux for validation
  const currentUser = useSelector(state => state.auth.user);
  // Hàm kích hoạt input file ẩn để chọn ảnh
  const handleEditAvatar = () => {
    document.getElementById('avatarInput').click();
  };

  // Hàm xử lý upload ảnh đại diện
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Ảnh đại diện không được vượt quá 10MB');
      return;
    }
    
    setIsUploading(true);
    try {
      // Lấy userId từ userProfile
      const userId = userProfile?.id;
      
      // Kiểm tra userId hợp lệ
      if (!userId || isNaN(userId)) {
        console.error('Invalid user ID:', userId);
        alert('Không thể xác định người dùng để cập nhật ảnh đại diện');
        return;
      } 
      const newAvatarUrl = await uploadAvatar(userId, file);
      if (newAvatarUrl) {
        // Gửi URL gốc tới component cha để cập nhật state
        if (onAvatarUpdate) onAvatarUpdate(newAvatarUrl);
      } else {
        alert('Không thể cập nhật ảnh đại diện, vui lòng thử lại sau');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Lỗi khi tải lên ảnh đại diện: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setIsUploading(false);
    }
  };

  // For debugging purposes, calculate if this should be user's own profile
  const calculatedIsOwnProfile = !!(currentUser && userProfile && currentUser.id === userProfile.id);
  // Use either passed prop or calculated value
  const shouldShowEditButtons = isOwnProfile || calculatedIsOwnProfile;

  return (
    <div className="flex items-center w-full pb-4">
      {/* Ảnh đại diện */}
      <div className="relative -mt-16 ml-8">
        <div className="w-[168px] h-[168px] rounded-full border-4 border-white overflow-hidden relative">
          <img
            src={getAvatarUrl(userProfile?.avatar)}
            alt={userProfile?.name || 'Avatar'}
            className="w-full h-full object-cover"
            onError={(e) => globalHandleImageError(e)}
          />
          {shouldShowEditButtons && (
            <>
              {/* Nút chỉnh sửa avatar */}
              <button
                onClick={handleEditAvatar}
                className="absolute bottom-2 right-2 bg-gray-200 hover:bg-gray-300 p-2 rounded-full"
                disabled={isUploading}
              >
                <i className={`bi ${isUploading ? 'bi-hourglass-split' : 'bi-camera'} text-black`}></i>
              </button>
              {/* Input file ẩn */}
              <input
                id="avatarInput"
                type="file"
                style={{ display: 'none' }}
                onChange={handleAvatarUpload}
                accept="image/*"
              />
            </>
          )}
        </div>
        {isUploading && <div className="mt-2 text-center text-sm text-blue-500">Đang tải lên...</div>}
      </div>

      {/* Tên người dùng và số lượng bạn bè */}
      <div className="flex-1 flex items-center">
        <div className="flex flex-col">
          <h1 className="text-[32px] font-bold">{userProfile?.name || 'User'}</h1>
          <p className="text-gray-500">{userProfile?.friendsCount || 0} người bạn</p>
        </div>
      </div>
    </div>
  );
};

// ProfileHeader.propTypes = {
//   userProfile: PropTypes.shape({
//     id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
//     name: PropTypes.string,
//     avatarUrl: PropTypes.string,
//     friendsCount: PropTypes.number
//   }),
//   isOwnProfile: PropTypes.bool,
//   onAvatarUpdate: PropTypes.func
// };

export default ProfileHeader;