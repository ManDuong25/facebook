import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setError } from '../../redux/features/adminSlice';
import PostTable from '../../components/Admin/Posts/PostTable';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/avatarUtils';

const PostManagementPage = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.admin);

  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  // Dữ liệu mẫu cho demo
  const mockPosts = [
    {
      id: 1,
      content: 'Chuyến du lịch Đà Lạt cuối tuần vừa qua thật tuyệt vời!',
      imageUrl: null,
      createdAt: '2023-04-15T08:30:00',
      updatedAt: '2023-04-15T08:30:00',
      user: {
        id: 1,
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        avatar: null
      },
      likeCount: 24,
      commentCount: 5,
      shareCount: 2,
      reportCount: 0,
      isHidden: false
    },
    {
      id: 2,
      content: 'Nội dung vi phạm quy định cộng đồng',
      imageUrl: null,
      createdAt: '2023-04-10T14:20:00',
      updatedAt: '2023-04-10T14:20:00',
      user: {
        id: 2,
        username: 'janedoe',
        firstName: 'Jane',
        lastName: 'Doe',
        avatar: null
      },
      likeCount: 3,
      commentCount: 12,
      shareCount: 0,
      reportCount: 5,
      isHidden: true
    },
    {
      id: 3,
      content: 'Chia sẻ hình ảnh mới nhất từ sự kiện',
      imageUrl: 'uploads/posts/event.jpg',
      createdAt: '2023-04-12T10:15:00',
      updatedAt: '2023-04-12T10:15:00',
      user: {
        id: 3,
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        avatar: null
      },
      likeCount: 56,
      commentCount: 8,
      shareCount: 7,
      reportCount: 1,
      isHidden: false
    }
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      dispatch(setLoading(true));
      try {
        // Trong môi trường thực tế, sẽ gọi API để lấy dữ liệu
        // const response = await getAllPosts();
        // setPosts(response.data);

        // Dùng dữ liệu mẫu cho demo
        setPosts(mockPosts);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách bài viết:', error);
        dispatch(setError(error.message || 'Không thể lấy danh sách bài viết'));
        toast.error('Không thể lấy danh sách bài viết');
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchPosts();
  }, [dispatch]);

  const handleViewPost = (post) => {
    setSelectedPost(post);
    setShowPostDetail(true);
  };

  const handleEditPost = (post) => {
    // Trong thực tế, có thể mở form chỉnh sửa hoặc chuyển hướng đến trang chỉnh sửa
    toast.info('Chức năng chỉnh sửa bài viết đang được phát triển');
  };

  const handleDeletePost = (post) => {
    setPostToDelete(post);
    setShowDeleteConfirm(true);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;

    dispatch(setLoading(true));
    try {
      // Trong môi trường thực tế, sẽ gọi API để xóa bài viết
      // await deletePost(postToDelete.id);

      // Cập nhật state
      setPosts(posts.filter(post => post.id !== postToDelete.id));
      toast.success('Xóa bài viết thành công');
    } catch (error) {
      console.error('Lỗi khi xóa bài viết:', error);
      dispatch(setError(error.message || 'Không thể xóa bài viết'));
      toast.error('Không thể xóa bài viết');
    } finally {
      dispatch(setLoading(false));
      setShowDeleteConfirm(false);
      setPostToDelete(null);
    }
  };

  const handleToggleHidePost = async (post) => {
    dispatch(setLoading(true));
    try {
      // Trong môi trường thực tế, sẽ gọi API để ẩn/hiện bài viết
      // await toggleHidePost(post.id);

      // Cập nhật state
      setPosts(posts.map(p =>
        p.id === post.id ? { ...p, isHidden: !p.isHidden } : p
      ));

      toast.success(post.isHidden ? 'Đã hiện bài viết' : 'Đã ẩn bài viết');
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái bài viết:', error);
      dispatch(setError(error.message || 'Không thể thay đổi trạng thái bài viết'));
      toast.error('Không thể thay đổi trạng thái bài viết');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleClosePostDetail = () => {
    setShowPostDetail(false);
    setSelectedPost(null);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý bài viết</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {showPostDetail ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Chi tiết bài viết</h2>
            <button
              onClick={handleClosePostDetail}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div className="mb-4 pb-4 border-b">
            <div className="flex items-center mb-3">
              <img
                src={getImageUrl(selectedPost?.user?.avatar)}
                alt={selectedPost?.user?.username}
                className="w-10 h-10 rounded-full mr-3 object-cover"
              />
              <div>
                <div className="font-medium">
                  {selectedPost?.user?.firstName} {selectedPost?.user?.lastName}
                </div>
                <div className="text-sm text-gray-500">
                  @{selectedPost?.user?.username} • {new Date(selectedPost?.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>
            </div>

            <p className="text-gray-800 whitespace-pre-line mb-3">
              {selectedPost?.content}
            </p>

            {selectedPost?.imageUrl && (
              <div className="mt-2 mb-3">
                <img
                  src={getImageUrl(selectedPost.imageUrl)}
                  alt="Post content"
                  className="max-h-96 rounded-lg object-contain"
                />
              </div>
            )}

            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <span><i className="bi bi-hand-thumbs-up mr-1"></i> {selectedPost?.likeCount} lượt thích</span>
              <span><i className="bi bi-chat mr-1"></i> {selectedPost?.commentCount} bình luận</span>
              <span><i className="bi bi-share mr-1"></i> {selectedPost?.shareCount} chia sẻ</span>
              {selectedPost?.reportCount > 0 && (
                <span className="text-red-500"><i className="bi bi-flag-fill mr-1"></i> {selectedPost?.reportCount} báo cáo</span>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <div>
              <button
                onClick={() => handleToggleHidePost(selectedPost)}
                className={`px-4 py-2 rounded-lg mr-3 ${
                  selectedPost?.isHidden
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                <i className={`bi ${selectedPost?.isHidden ? 'bi-eye' : 'bi-eye-slash'} mr-2`}></i>
                {selectedPost?.isHidden ? 'Hiện bài viết' : 'Ẩn bài viết'}
              </button>
            </div>

            <button
              onClick={() => handleDeletePost(selectedPost)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <i className="bi bi-trash mr-2"></i>
              Xóa bài viết
            </button>
          </div>
        </div>
      ) : (
        <PostTable
          posts={posts}
          onView={handleViewPost}
          onEdit={handleEditPost}
          onDelete={handleDeletePost}
        />
      )}

      {/* Modal xác nhận xóa */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Xác nhận xóa</h3>
            <p className="mb-6">
              Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmDeletePost}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostManagementPage;
