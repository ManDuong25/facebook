import React, { useState } from 'react';
import { getAvatarUrl, getImageUrl } from '../../../utils/avatarUtils';

const PostTable = ({ posts, onView, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, reported, hidden

  // Lọc bài viết theo từ khóa tìm kiếm và bộ lọc
  const filteredPosts = posts.filter(post => {
    // Lọc theo từ khóa
    const matchesSearch =
      post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${post.user?.firstName} ${post.user?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());

    // Lọc theo trạng thái
    let matchesFilter = true;
    if (filter === 'reported') {
      matchesFilter = post.reportCount > 0;
    } else if (filter === 'hidden') {
      matchesFilter = post.isHidden;
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Thanh tìm kiếm và bộ lọc */}
      <div className="p-4 border-b flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Lọc:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="reported">Bị báo cáo</option>
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
                      {post.content || 'Không có nội dung'}
                    </div>
                    {post.imageUrl && (
                      <div className="mt-1">
                        <span className="text-xs text-blue-600">
                          <i className="bi bi-image mr-1"></i>
                          Có hình ảnh
                        </span>
                      </div>
                    )}
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
                      {post.isHidden && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Đã ẩn
                        </span>
                      )}
                      {post.reportCount > 0 && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {post.reportCount} báo cáo
                        </span>
                      )}
                      {!post.isHidden && post.reportCount === 0 && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Bình thường
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
                      onClick={() => onEdit(post)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Chỉnh sửa"
                    >
                      <i className="bi bi-pencil"></i>
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

      {/* Phân trang */}
      <div className="px-6 py-3 flex items-center justify-between border-t">
        <div className="text-sm text-gray-700">
          Hiển thị <span className="font-medium">{filteredPosts.length}</span> trong tổng số <span className="font-medium">{posts.length}</span> bài viết
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border rounded text-sm disabled:opacity-50">
            Trước
          </button>
          <button className="px-3 py-1 border rounded bg-blue-600 text-white text-sm">
            1
          </button>
          <button className="px-3 py-1 border rounded text-sm">
            2
          </button>
          <button className="px-3 py-1 border rounded text-sm">
            Sau
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostTable;
