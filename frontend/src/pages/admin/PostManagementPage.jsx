import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setError } from '../../redux/features/adminSlice';
import PostTable from '../../components/Admin/Posts/PostTable';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/avatarUtils';
import {
  getAllPosts,
  getPostDetails,
  updatePostVisibility,
  deletePost,
  getUsersForDropdown
} from '../../services/adminService';

const PostManagementPage = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.admin);

  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalItems: 0,
    pageSize: 10
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      dispatch(setLoading(true));
      try {
        // Gọi API để lấy danh sách bài viết
        const response = await getAllPosts(
          pagination.currentPage,
          pagination.pageSize,
          searchTerm,
          selectedUserId
        );

        if (response.status === 'success') {
          setPosts(response.data.posts || []);
          setPagination({
            currentPage: response.data.currentPage,
            totalPages: response.data.totalPages,
            totalItems: response.data.totalItems,
            pageSize: pagination.pageSize
          });
        } else {
          throw new Error(response.message || 'Không thể lấy danh sách bài viết');
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách bài viết:', error);
        dispatch(setError(error.message || 'Không thể lấy danh sách bài viết'));
        toast.error('Không thể lấy danh sách bài viết');
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchPosts();
  }, [dispatch, pagination.currentPage, pagination.pageSize, searchTerm, selectedUserId]);

  // Lấy danh sách người dùng cho dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsersForDropdown();
        if (response.status === 'success') {
          setUsers(response.data || []);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleViewPost = async (post) => {
    dispatch(setLoading(true));
    try {
      // Lấy chi tiết bài viết từ API
      const response = await getPostDetails(post.id);
      if (response.status === 'success') {
        setSelectedPost(response.data.post || post);
        setShowPostDetail(true);
      } else {
        throw new Error(response.message || 'Không thể lấy chi tiết bài viết');
      }
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết bài viết:', error);
      toast.error('Không thể lấy chi tiết bài viết');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleDeletePost = (post) => {
    setPostToDelete(post);
    setShowDeleteConfirm(true);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;

    dispatch(setLoading(true));
    try {
      // Gọi API để xóa bài viết
      const response = await deletePost(postToDelete.id);

      if (response.status === 'success') {
        // Cập nhật state
        setPosts(posts.filter(post => post.id !== postToDelete.id));
        toast.success('Xóa bài viết thành công');

        // Nếu đang xem chi tiết bài viết bị xóa, đóng modal
        if (selectedPost && selectedPost.id === postToDelete.id) {
          setShowPostDetail(false);
          setSelectedPost(null);
        }
      } else {
        throw new Error(response.message || 'Không thể xóa bài viết');
      }
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

  const handleToggleVisibility = async (post) => {
    dispatch(setLoading(true));
    try {
      // Gọi API để thay đổi trạng thái hiển thị bài viết
      const response = await updatePostVisibility(post.id, !post.visible);

      if (response.status === 'success') {
        // Cập nhật state
        setPosts(posts.map(p =>
          p.id === post.id ? { ...p, visible: !p.visible } : p
        ));

        // Nếu đang xem chi tiết bài viết, cập nhật trạng thái
        if (selectedPost && selectedPost.id === post.id) {
          setSelectedPost({ ...selectedPost, visible: !selectedPost.visible });
        }

        toast.success(post.visible ? 'Đã ẩn bài viết' : 'Đã hiện bài viết');
      } else {
        throw new Error(response.message || 'Không thể thay đổi trạng thái bài viết');
      }
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

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPagination({...pagination, currentPage: 0}); // Reset về trang đầu tiên khi tìm kiếm
  };

  const handleUserFilter = (userId) => {
    setSelectedUserId(userId);
    setPagination({...pagination, currentPage: 0}); // Reset về trang đầu tiên khi lọc
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPagination({...pagination, currentPage: newPage});
    }
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
              {selectedPost?.visible === false && (
                <span className="text-red-500"><i className="bi bi-eye-slash mr-1"></i> Đã ẩn</span>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <div>
              <button
                onClick={() => handleToggleVisibility(selectedPost)}
                className={`px-4 py-2 rounded-lg mr-3 ${
                  selectedPost?.visible === false
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                <i className={`bi ${selectedPost?.visible === false ? 'bi-eye' : 'bi-eye-slash'} mr-2`}></i>
                {selectedPost?.visible === false ? 'Hiện bài viết' : 'Ẩn bài viết'}
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
        <div>
          {/* Thanh tìm kiếm và lọc */}
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <div className="flex-grow max-w-md relative">
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>

            <div className="w-64">
              <select
                className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedUserId || ''}
                onChange={(e) => handleUserFilter(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Tất cả người dùng</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} (@{user.username})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <PostTable
            posts={posts}
            onView={handleViewPost}
            onToggleVisibility={handleToggleVisibility}
            onDelete={handleDeletePost}
          />

          {/* Phân trang */}
          {pagination.totalPages > 0 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center">
                <button
                  onClick={() => handlePageChange(Math.max(0, pagination.currentPage - 1))}
                  disabled={pagination.currentPage === 0}
                  className={`px-3 py-1 rounded-l-md border ${
                    pagination.currentPage === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>

                {[...Array(pagination.totalPages).keys()].map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 border-t border-b ${
                      pagination.currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {page + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(Math.min(pagination.totalPages - 1, pagination.currentPage + 1))}
                  disabled={pagination.currentPage === pagination.totalPages - 1}
                  className={`px-3 py-1 rounded-r-md border ${
                    pagination.currentPage === pagination.totalPages - 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </nav>
            </div>
          )}
        </div>
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
