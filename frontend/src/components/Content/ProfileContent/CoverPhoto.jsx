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
    const [showModal, setShowModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // Get the current user from Redux for additional validation
    const currentUser = useSelector((state) => state.auth.user);

    // Reset error state and process URL when props change
    useEffect(() => {
        setImgError(false);
        const processedUrl = getCoverUrl(coverPhotoUrl);
        setDisplayUrl(processedUrl);
    }, [coverPhotoUrl, isOwnProfile, currentUser]);

    // Cleanup previewUrl when component unmounts
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // Xử lý khi người dùng nhấn nút chỉnh sửa ảnh bìa
    const handleEditButtonClick = () => {
        fileInputRef.current?.click();
    };

    // Xử lý khi người dùng chọn file
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Kiểm tra loại file
        if (!file.type.match(/^image\/(jpeg|png)$/)) {
            setError('Chỉ chấp nhận file ảnh định dạng .jpg hoặc .png');
            return;
        }

        if (file.size > 20 * 1024 * 1024) {
            setError('Ảnh bìa không được vượt quá 20MB');
            return;
        }

        // Tạo URL xem trước
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setSelectedFile(file);
        setError(null);
        setShowModal(true);
    };

    // Hàm xử lý upload ảnh bìa sau khi xác nhận
    const handleConfirmUpload = async () => {
        if (!selectedFile) return;

        setIsLoading(true);
        setError(null);

        try {
            // Ensure onEditCover is a function
            if (typeof onEditCover === 'function') {
                await onEditCover(selectedFile);
                closeModal(); // Đóng modal sau khi upload thành công
            } else {
                throw new Error('onEditCover callback is not provided');
            }
        } catch (error) {
            console.error('Error uploading cover photo:', error);
            setError('Không thể tải lên ảnh bìa: ' + (error.message || 'Lỗi không xác định'));
        } finally {
            setIsLoading(false);
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

    // Xử lý lỗi khi ảnh không tải được
    const handleImageError = (e) => {
        console.error('Failed to load cover image:', coverPhotoUrl);
        setImgError(true);
        globalHandleImageError(e, images.defaultCover);
    };

    // For debugging purposes, calculate if this should be user's own profile
    const calculatedIsOwnProfile = !!(currentUser && currentUser.id);
    // Use either passed prop or calculated value
    const shouldShowEditButton = isOwnProfile;

    return (
        <>
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
                            accept=".jpg,.jpeg,.png"
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
            </div>

            {/* Modal xem trước ảnh bìa */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-800">Cập nhật ảnh bìa</h3>
                        </div>
                        <div className="p-4">
                            {error && (
                                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                                    <p className="font-medium">Lỗi</p>
                                    <p>{error}</p>
                                </div>
                            )}

                            <div className="mb-4 flex flex-col items-center">
                                <p className="text-gray-600 mb-4">Xem trước ảnh bìa mới</p>
                                <div className="w-full h-[300px] rounded-lg overflow-hidden border-4 border-gray-200 mb-2">
                                    {previewUrl && (
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = images.defaultCover;
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
                                disabled={isLoading}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white transition flex items-center"
                                onClick={handleConfirmUpload}
                                disabled={isLoading || !selectedFile}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                        Đang tải lên...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-lg mr-2"></i>
                                        Lưu thay đổi
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
