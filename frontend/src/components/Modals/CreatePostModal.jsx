import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addPost } from '../../redux/features/postSlice';
import { toast } from 'react-toastify';
import images from '../../assets/images';
import { createPost as createPostApi } from '../../services/api'; // Import API
import { getAvatarUrl, handleImageError as globalHandleImageError } from '../../utils/avatarUtils';

const CreatePostModal = ({ onClose, onPostCreated }) => {
    const [content, setContent] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isPosting, setIsPosting] = useState(false);
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);

    // Lấy tên hiển thị người dùng
    const getUserDisplayName = () => {
        if (!user) return 'Người dùng';
        if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
        if (user.firstName) return user.firstName;
        if (user.lastName) return user.lastName;
        return 'Người dùng';
    };

    const handlePost = async () => {
        if (content.trim() || selectedFile) {
            try {
                setIsPosting(true);
                // Lấy thông tin người dùng đầy đủ từ Redux store
                const userDisplayName = getUserDisplayName();

                // Truyền thêm userId của người dùng đang đăng nhập
                const postData = await createPostApi(content, selectedFile, user.id);

                // Dispatch dữ liệu từ backend vào Redux (nếu backend trả về dữ liệu đầy đủ)
                if (postData) {
                    dispatch(addPost(postData));
                    toast.success('Đăng bài viết thành công!');

                    // Gọi callback để thông báo bài viết đã được tạo
                    if (onPostCreated) {
                        onPostCreated(postData);
                    }

                    setContent('');
                    setSelectedFile(null);
                    onClose();
                } else {
                    toast.error('Không thể đăng bài viết. Vui lòng thử lại sau.');
                }
            } catch (error) {
                console.error('Lỗi khi đăng bài:', error);
                toast.error('Đã xảy ra lỗi khi đăng bài viết');
            } finally {
                setIsPosting(false);
            }
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#f0f2f5] bg-opacity-60">
            <div className="bg-white w-full max-w-[440px] rounded-lg shadow-2xl border border-gray-200 relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-2xl text-gray-600 hover:bg-gray-200 rounded-full p-1"
                >
                    <i className="bi bi-x"></i>
                </button>
                <div className="border-b border-gray-200 p-3 text-center">
                    <h2 className="text-xl font-bold">Tạo bài viết</h2>
                </div>
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <img
                            src={getAvatarUrl(user?.avatar)}
                            alt="avatar"
                            className="w-10 h-10 rounded-full"
                            onError={(e) => globalHandleImageError(e)}
                        />
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm">{getUserDisplayName()}</span>
                            <button className="text-sm text-gray-800 font-bold bg-gray-200 px-2 py-1 rounded-md flex items-center gap-1">
                                <i className="bi bi-globe2"></i> Công khai
                                <i className="bi bi-caret-down-fill text-xs"></i>
                            </button>
                        </div>
                    </div>
                    <textarea
                        rows="4"
                        className="w-full text-xl outline-none resize-none placeholder:text-gray-400"
                        placeholder={`${getUserDisplayName()} ơi, bạn đang nghĩ gì thế?`}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    ></textarea>
                    <input
                        type="file"
                        accept="image/*,video/*"
                        style={{ display: 'none' }}
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        id="fileInput"
                    />
                    {selectedFile && (
                        <div className="mt-2">
                            {selectedFile.type.startsWith('image/') ? (
                                <img
                                    src={URL.createObjectURL(selectedFile)}
                                    alt="Selected"
                                    className="max-w-full h-auto rounded-lg"
                                />
                            ) : (
                                <video controls className="max-w-full h-auto rounded-lg">
                                    <source src={URL.createObjectURL(selectedFile)} type={selectedFile.type} />
                                </video>
                            )}
                        </div>
                    )}
                    <div className="mt-2 p-2 border border-gray-300 rounded-lg">
                        <div className="flex items-center justify-between">
                            <p className="text-gray-700 font-bold text-sm">Thêm vào bài viết của bạn</p>
                            <div className="flex items-center space-x-2">
                                <button
                                    className="flex items-center hover:bg-gray-100 px-1 py-2 rounded-md"
                                    onClick={() => document.getElementById('fileInput').click()}
                                >
                                    <i className="bi bi-images text-green-500 text-xl"></i>
                                </button>
                                <button className="flex items-center hover:bg-gray-100 px-1 py-2 rounded-md">
                                    <i className="bi bi-people text-blue-500 text-xl"></i>
                                </button>
                                <button className="flex items-center hover:bg-gray-100 px-1 py-2 rounded-md">
                                    <i className="bi bi-emoji-smile text-yellow-500 text-xl"></i>
                                </button>
                                <button className="flex items-center hover:bg-gray-100 px-1 py-2 rounded-md">
                                    <i className="bi bi-geo-alt text-red-500 text-xl"></i>
                                </button>
                                <button className="flex items-center hover:bg-gray-100 px-1 py-2 rounded-md">
                                    <span className="text-blue-500 font-semibold">GIF</span>
                                </button>
                                <button className="flex items-center hover:bg-gray-100 px-1 py-2 rounded-md">
                                    <i className="bi bi-three-dots text-gray-600 text-xl"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handlePost}
                        disabled={(!content.trim() && !selectedFile) || isPosting}
                        className={`w-full mt-3 py-2 rounded-md font-bold flex items-center justify-center ${
                            content.trim() || selectedFile
                                ? isPosting
                                    ? 'bg-blue-400 text-white cursor-wait'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {isPosting ? (
                            <>
                                <i className="bi bi-arrow-repeat animate-spin mr-2"></i>
                                Đang đăng...
                            </>
                        ) : (
                            'Đăng'
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
};

export default CreatePostModal;
