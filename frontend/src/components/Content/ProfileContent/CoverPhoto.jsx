import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import images from '../../../assets/images';
import { useSelector } from 'react-redux';
import { getCoverUrl, handleImageError as globalHandleImageError } from '../../../utils/avatarUtils';

const CoverPhoto = ({ coverPhotoUrl, onEditCover, isOwnProfile }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [displayUrl, setDisplayUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Get the current user from Redux for additional validation
  const currentUser = useSelector(state => state.auth.user);
  
  // Reset error state and process URL when props change
  useEffect(() => {
    setImgError(false);
    const processedUrl = getCoverUrl(coverPhotoUrl);
    setDisplayUrl(processedUrl);
    
    console.log('CoverPhoto Component:');
    console.log('- Original coverPhotoUrl:', coverPhotoUrl);
    console.log('- Processed displayUrl:', processedUrl);
    console.log('- isOwnProfile prop:', isOwnProfile);
    console.log('- currentUser from Redux:', currentUser);
    console.log('- Edit button should be visible:', isOwnProfile);
  }, [coverPhotoUrl, isOwnProfile, currentUser]);

  // Xử lý khi người dùng nhấn nút chỉnh sửa ảnh bìa
  const handleEditButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Xử lý khi người dùng chọn file
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 20 * 1024 * 1024) {
      alert('Ảnh bìa không được vượt quá 20MB');
      return;
    }
    
    console.log('Selected cover photo file:', selectedFile.name);
    console.log('File size:', Math.round(selectedFile.size / 1024) + ' KB');
    console.log('File type:', selectedFile.type);
    
    setIsLoading(true);
    
    // Gọi callback từ component cha
    if (onEditCover) {
      try {
        onEditCover(selectedFile)
          .then(() => {
            console.log('Cover photo uploaded successfully');
          })
          .catch(error => {
            console.error('Error uploading cover photo:', error);
            setImgError(true);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } catch (error) {
        console.error('Error uploading cover photo:', error);
        alert('Không thể tải lên ảnh bìa: ' + error.message);
        setImgError(true);
        setIsLoading(false);
      }
    } else {
      console.error('onEditCover callback is not provided');
      setImgError(true);
      setIsLoading(false);
    }
  };

  // Xử lý lỗi khi ảnh không tải được
  const handleImageError = (e) => {
    console.error('Failed to load cover image:', coverPhotoUrl);
    setImgError(true);
    globalHandleImageError(e, images.defaultCover);
  };

  // For debugging purposes, calculate if this should be user's own profile
  const calculatedIsOwnProfile = !!(currentUser && currentUser.id);
  // Use either passed prop or calculated value
  const shouldShowEditButton = isOwnProfile || calculatedIsOwnProfile;

  return (
    <div className="relative h-[404px] bg-cover bg-center rounded-b-lg overflow-hidden">
      {/* Div background có thể gây lỗi nên thay bằng img tag để bắt lỗi */}
      {!imgError ? (
        <img 
          src={displayUrl}
          alt="Cover"
          onError={handleImageError}
          className="w-full h-full object-cover"
          style={{
            backgroundColor: '#f0f2f5' // Màu nền phòng trường hợp ảnh không tải được
          }}
        />
      ) : (
        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
          <span className="text-gray-600">Không thể tải ảnh bìa</span>
        </div>
      )}

      {shouldShowEditButton && (
        <div className="absolute bottom-4 right-4">
          <label
            htmlFor="coverPhotoInput"
            className={`cursor-pointer flex items-center px-4 py-2 bg-white hover:bg-gray-100 rounded-md text-sm shadow ${
              isLoading ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            <i className={`bi ${isLoading ? 'bi-hourglass-split' : 'bi-camera'} mr-2`}></i>
            {isLoading ? 'Đang tải lên...' : 'Chỉnh sửa ảnh bìa'}
          </label>
          <input
            id="coverPhotoInput"
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept="image/*"
            disabled={isLoading}
          />
        </div>
      )}
    </div>
  );
};

CoverPhoto.propTypes = {
  coverPhotoUrl: PropTypes.string,
  onEditCover: PropTypes.func,
  isOwnProfile: PropTypes.bool
};

CoverPhoto.defaultProps = {
  coverPhotoUrl: '',
  onEditCover: () => {},
  isOwnProfile: false
};

export default CoverPhoto;