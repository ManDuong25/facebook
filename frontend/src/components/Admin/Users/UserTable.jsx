import React, { useState } from 'react';
import { getAvatarUrl } from '../../../utils/avatarUtils';

const UserTable = ({ users, onEdit, onDelete, onBlock }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Lọc người dùng theo từ khóa tìm kiếm
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Thanh tìm kiếm */}
      <div className="p-4 border-b">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
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
                      onClick={() => onEdit(user)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
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
                    >
                      <i className={`bi ${user.isBlocked ? 'bi-unlock' : 'bi-lock'}`}></i>
                    </button>
                    <button
                      onClick={() => onDelete(user)}
                      className="text-red-600 hover:text-red-900"
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

      {/* Phân trang */}
      <div className="px-6 py-3 flex items-center justify-between border-t">
        <div className="text-sm text-gray-700">
          Hiển thị <span className="font-medium">{filteredUsers.length}</span> trong tổng số <span className="font-medium">{users.length}</span> người dùng
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

export default UserTable;
