import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { uploadAvatar } from '../../../services/profileService.js';
import images from '../../../assets/images';
import { useSelector } from 'react-redux';
import { getAvatarUrl, handleImageError as globalHandleImageError } from '../../../utils/avatarUtils';

const ProfileHeader = ({ userProfile, isOwnProfile, onAvatarUpdate }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [error, setError] = useState(null);

    // Get the current user from Redux for validation
    const currentUser = useSelector((state) => state.auth.user);

    // Cleanup previewUrl when component unmounts
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // Hàm kích hoạt input file ẩn để chọn ảnh
    const handleEditAvatar = () => {
        document.getElementById('avatarInput').click();
    };

    // Hàm xử lý khi chọn file ảnh (chỉ xem trước)
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            setError('Ảnh đại diện không được vượt quá 10MB');
            return;
        }

        // Tạo URL xem trước
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setSelectedFile(file);
        setError(null);
        setShowModal(true);
    };

    // Hàm xử lý upload ảnh đại diện sau khi xác nhận
    const handleConfirmUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setError(null);

        try {
            // Lấy userId từ userProfile hoặc currentUser
            const userId = userProfile?.id || currentUser?.id;

            // Kiểm tra userId hợp lệ
            if (!userId || isNaN(userId)) {
                setError('Không thể xác định người dùng để cập nhật ảnh đại diện');
                return;
            }

            const newAvatarUrl = await uploadAvatar(userId, selectedFile);
            if (newAvatarUrl) {
                // Gửi URL gốc tới component cha để cập nhật state
                if (onAvatarUpdate) onAvatarUpdate(newAvatarUrl);
                closeModal(); // Đóng modal sau khi upload thành công
            } else {
                setError('Không thể cập nhật ảnh đại diện, vui lòng thử lại sau');
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            let errorMessage = error.message || 'Lỗi không xác định';

            // Trích xuất message từ response nếu có
            if (error.message && error.message.includes('Server responded with status: 403')) {
                try {
                    const jsonStart = error.message.indexOf('{');
                    if (jsonStart !== -1) {
                        const jsonPart = error.message.substring(jsonStart);
                        const errorData = JSON.parse(jsonPart);
                        errorMessage = errorData.message || errorMessage;
                    }
                } catch (e) {
                    console.error('Error parsing error message:', e);
                }
            }

            setError(`Lỗi khi tải lên ảnh đại diện: ${errorMessage}`);
        } finally {
            setIsUploading(false);
        }
    };

    // Đóng modal và dọn dẹp
    const closeModal = () => {
        setShowModal(false);
        // Dọn dẹp URL đối tượng để tránh rò rỉ bộ nhớ
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        setSelectedFile(null);
        setError(null);
    };

    // For debugging purposes, calculate if this should be user's own profile
    const calculatedIsOwnProfile = !!(currentUser && userProfile && currentUser.id === userProfile.id);
    // Use either passed prop or calculated value
    const shouldShowEditButtons = isOwnProfile;

    return (
        <>
            <div className="flex items-center w-full pb-4">
                {/* Ảnh đại diện */}
                <div className="relative -mt-16 ml-8">
                    <div
                        className="w-[168px] h-[168px] rounded-full border-4 border-white overflow-hidden relative"
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        <img
                            src={getAvatarUrl(userProfile?.avatar)}
                            alt={userProfile?.name || 'Avatar'}
                            className={`w-full h-full object-cover transition-all duration-200 ${
                                isHovering && shouldShowEditButtons ? 'brightness-90' : ''
                            }`}
                            onError={(e) => globalHandleImageError(e)}
                        />

                        {shouldShowEditButtons && (
                            <>
                                {/* Dark overlay when hovering */}
                                <div
                                    className={`absolute inset-0 bg-black transition-opacity duration-200 ${
                                        isHovering ? 'opacity-30' : 'opacity-0'
                                    }`}
                                ></div>

                                {/* Nút chỉnh sửa avatar */}
                                <button
                                    onClick={handleEditAvatar}
                                    className={`absolute bottom-0 inset-x-0 bg-gray-800 bg-opacity-75 text-white py-2 transition-transform duration-200 flex items-center justify-center ${
                                        isHovering ? 'translate-y-0' : 'translate-y-full'
                                    }`}
                                    disabled={isUploading}
                                >
                                    <i className={`bi ${isUploading ? 'bi-hourglass-split' : 'bi-camera'} mr-2`}></i>
                                    Cập nhật
                                </button>

                                {/* Nổi bật icon camera khi hover */}
                                <div
                                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 ${
                                        isHovering ? 'opacity-100' : 'opacity-0'
                                    }`}
                                >
                                    <i className="bi bi-camera text-white text-4xl drop-shadow-lg"></i>
                                </div>

                                {/* Input file ẩn */}
                                <input
                                    id="avatarInput"
                                    type="file"
                                    style={{ display: 'none' }}
                                    onChange={handleFileSelect}
                                    accept="image/*"
                                />
                            </>
                        )}
                    </div>
                    {isUploading && !showModal && (
                        <div className="mt-2 text-center text-sm font-medium text-blue-500 bg-blue-50 p-2 rounded-md">
                            <div className="animate-spin inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                            Đang tải ảnh lên...
                        </div>
                    )}
                </div>

                {/* Tên người dùng và số lượng bạn bè */}
                <div className="flex-1 flex items-center">
                    <div className="flex flex-col">
                        <h1 className="text-[32px] font-bold">{userProfile?.name || 'User'}</h1>
                        <p className="text-gray-500">{userProfile?.friendsCount || 0} người bạn</p>
                    </div>
                </div>
            </div>

            {/* Modal xem trước ảnh đại diện */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-800">Cập nhật ảnh đại diện</h3>
                        </div>
                        <div className="p-4">
                            {error && (
                                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                                    <p className="font-medium">Lỗi</p>
                                    <p>{error}</p>
                                </div>
                            )}

                            <div className="mb-4 flex flex-col items-center">
                                <p className="text-gray-600 mb-4">Xem trước ảnh đại diện mới</p>
                                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-200 mb-2">
                                    {previewUrl && (
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = images.avatarJpg;
                                                setError('Không thể tải ảnh xem trước');
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition"
                                onClick={closeModal}
                                disabled={isUploading}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white transition flex items-center"
                                onClick={handleConfirmUpload}
                                disabled={isUploading || !selectedFile}
                            >
                                {isUploading ? (
                                    <>
                                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                        Đang tải lên...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-lg mr-2"></i>
                                        Xác nhận
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
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
