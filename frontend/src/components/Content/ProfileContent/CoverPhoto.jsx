import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import images from '../../../assets/images';
import { useSelector } from 'react-redux';
import { getCoverUrl, handleImageError as globalHandleImageError } from '../../../utils/avatarUtils';

const CoverPhoto = ({ coverPhotoUrl, onEditCover, isOwnProfile }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [displayUrl, setDisplayUrl] = useState(null);
    const [isHovering, setIsHovering] = useState(false);
    const fileInputRef = useRef(null);

    // Get the current user from Redux for additional validation
    const currentUser = useSelector((state) => state.auth.user);

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
    const handleFileChange = async (e) => {
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

        // Tạo URL tạm thời để hiển thị preview ngay lập tức
        const previewUrl = URL.createObjectURL(selectedFile);
        setDisplayUrl(previewUrl);

        try {
            // Ensure onEditCover is a function
            if (typeof onEditCover === 'function') {
                await onEditCover(selectedFile);
                console.log('Cover photo uploaded successfully');
            } else {
                throw new Error('onEditCover callback is not provided');
            }
        } catch (error) {
            console.error('Error uploading cover photo:', error);
            setImgError(true);
            alert('Không thể tải lên ảnh bìa: ' + (error.message || 'Lỗi không xác định'));
            // Revert to previous cover photo
            setDisplayUrl(getCoverUrl(coverPhotoUrl));
        } finally {
            setIsLoading(false);
            // Clean up the temporary object URL
            URL.revokeObjectURL(previewUrl);
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
        <div
            className="relative h-[404px] bg-cover bg-center rounded-b-lg overflow-hidden"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Div background có thể gây lỗi nên thay bằng img tag để bắt lỗi */}
            {!imgError ? (
                <img
                    src={displayUrl}
                    alt="Cover"
                    onError={handleImageError}
                    className={`w-full h-full object-cover transition duration-200 ${
                        isHovering && shouldShowEditButton ? 'brightness-95' : ''
                    }`}
                    style={{
                        backgroundColor: '#f0f2f5', // Màu nền phòng trường hợp ảnh không tải được
                    }}
                />
            ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600">Không thể tải ảnh bìa</span>
                </div>
            )}

            {/* Overlay when hovering */}
            {shouldShowEditButton && isHovering && (
                <div className="absolute inset-0 bg-black bg-opacity-10 transition-opacity duration-200"></div>
            )}

            {shouldShowEditButton && (
                <div className="absolute bottom-4 right-4">
                    <button
                        onClick={handleEditButtonClick}
                        className={`flex items-center px-4 py-2 bg-white hover:bg-gray-100 rounded-md text-sm shadow-md transition ${
                            isLoading ? 'opacity-70 cursor-wait' : ''
                        }`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full mr-2"></div>
                                Đang tải lên...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-camera mr-2"></i>
                                Chỉnh sửa ảnh bìa
                            </>
                        )}
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/*"
                        disabled={isLoading}
                    />
                </div>
            )}

            {/* Hiển thị hướng dẫn khi hover */}
            {shouldShowEditButton && isHovering && !isLoading && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
                    <i className="bi bi-camera text-5xl drop-shadow-lg block mb-2"></i>
                    <span className="bg-black bg-opacity-50 px-4 py-2 rounded-full text-sm font-medium">
                        Cập nhật ảnh bìa
                    </span>
                </div>
            )}

            {/* Hiển thị loader ở giữa khi đang upload */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white p-4 rounded-lg shadow-xl flex items-center">
                        <div className="animate-spin w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mr-3"></div>
                        <span className="font-medium">Đang tải ảnh lên...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

CoverPhoto.propTypes = {
    coverPhotoUrl: PropTypes.string,
    onEditCover: PropTypes.func,
    isOwnProfile: PropTypes.bool,
};

CoverPhoto.defaultProps = {
    coverPhotoUrl: '',
    onEditCover: () => {},
    isOwnProfile: false,
};

export default CoverPhoto;
