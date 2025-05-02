import React, { useState, useEffect } from 'react';
import { getAvatarUrl } from '../../../utils/avatarUtils';
import { searchUsers } from '../../../services/adminService';
import { toast } from 'react-toastify';

const UserTable = ({ users, onEdit, onDelete, onBlock, onSearch, onViewDetail }) => {
  const [searchInput, setSearchInput] = useState('');

  // Sử dụng danh sách người dùng từ props
  const filteredUsers = users;

  // Hàm xử lý khi nhấn nút tìm kiếm
  const handleSearch = () => {
    onSearch && onSearch(searchInput);
  };

  // Hàm xử lý khi nhấn Enter trong ô tìm kiếm
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Thanh tìm kiếm */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>

          {/* Nút tìm kiếm */}
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Tìm kiếm
          </button>

          {/* Nút tải lại */}
          <button
            onClick={() => {
              setSearchInput('');
              onSearch && onSearch('');
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center"
            title="Tải lại danh sách"
          >
            <i className="bi bi-arrow-clockwise mr-1"></i>
            Tải lại
          </button>
        </div>
      </div>

      {/* Bảng người dùng */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Người dùng
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày đăng ký
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
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={getAvatarUrl(user.avatar)}
                          alt={user.username}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isBlocked
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.isBlocked ? 'Đã khóa' : 'Hoạt động'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onViewDetail(user.id)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      title="Xem chi tiết"
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                    <button
                      onClick={() => onEdit(user)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Chỉnh sửa"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      onClick={() => onBlock(user)}
                      className={`${
                        user.isBlocked
                          ? 'text-green-600 hover:text-green-900'
                          : 'text-orange-600 hover:text-orange-900'
                      } mr-3`}
                      title={user.isBlocked ? "Mở khóa" : "Khóa"}
                    >
                      <i className={`bi ${user.isBlocked ? 'bi-unlock' : 'bi-lock'}`}></i>
                    </button>
                    <button
                      onClick={() => onDelete(user)}
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
                  Không tìm thấy người dùng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
