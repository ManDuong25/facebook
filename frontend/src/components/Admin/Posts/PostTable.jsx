import React, { useState } from 'react';
import { getAvatarUrl, getImageUrl } from '../../../utils/avatarUtils';

const PostTable = ({ posts, onView, onEdit, onDelete, onToggleVisibility }) => {
  const [filter, setFilter] = useState('all'); // all, hidden, visible

  // Lọc bài viết theo trạng thái
  const filteredPosts = posts.filter(post => {
    // Lọc theo trạng thái
    let matchesFilter = true;
    if (filter === 'hidden') {
      matchesFilter = post.visible === false;
    } else if (filter === 'visible') {
      matchesFilter = post.visible === true;
    }

    return matchesFilter;
  });

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Bộ lọc trạng thái */}
      <div className="p-4 border-b flex flex-wrap gap-4 items-center justify-end">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Lọc theo trạng thái:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="visible">Đang hiển thị</option>
            <option value="hidden">Đã ẩn</option>
          </select>
        </div>
      </div>

      {/* Bảng bài viết */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Người đăng
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nội dung
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày đăng
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={getAvatarUrl(post.user?.avatar)}
                          alt={post.user?.username}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {post.user?.firstName} {post.user?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{post.user?.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 line-clamp-2">
                      {post.content ?
                        (post.content.length > 100 ?
                          post.content.substring(0, 100) + '...' :
                          post.content) :
                        'Không có nội dung'}
                    </div>
                    <div className="mt-1 flex space-x-2">
                      {post.imageUrl && (
                        <span className="text-xs text-blue-600">
                          <i className="bi bi-image mr-1"></i>
                          Hình ảnh
                        </span>
                      )}
                      {post.videoUrl && (
                        <span className="text-xs text-purple-600">
                          <i className="bi bi-camera-video mr-1"></i>
                          Video
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleTimeString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {post.visible === false && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Đã ẩn
                        </span>
                      )}
                      {post.visible === true && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Đang hiển thị
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onView(post)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Xem chi tiết"
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                    <button
                      onClick={() => onToggleVisibility(post)}
                      className={`${post.visible ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'} mr-3`}
                      title={post.visible ? 'Ẩn bài viết' : 'Hiện bài viết'}
                    >
                      <i className={`bi ${post.visible ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                    <button
                      onClick={() => onDelete(post)}
                      className="text-red-600 hover:text-red-900"
                      title="Xóa"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  Không tìm thấy bài viết nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang được xử lý ở component cha (PostManagementPage) */}
    </div>
  );
};

export default PostTable;
