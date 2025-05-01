import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setError } from '../../redux/features/adminSlice';
import UserTable from '../../components/Admin/Users/UserTable';
import UserForm from '../../components/Admin/Users/UserForm';
import { toast } from 'react-toastify';
import {
  getAllUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  toggleUserStatus,
  createUser
} from '../../services/adminService';

const UserManagementPage = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.admin);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Dữ liệu mẫu cho demo
  const mockUsers = [
    {
      id: 1,
      username: 'johndoe',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      avatar: null,
      createdAt: '2023-01-15T08:30:00',
      role: 'user',
      isBlocked: false
    },
    {
      id: 2,
      username: 'janedoe',
      email: 'jane.doe@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
      avatar: null,
      createdAt: '2023-02-20T10:15:00',
      role: 'user',
      isBlocked: false
    },
    {
      id: 3,
      username: 'admin',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      avatar: null,
      createdAt: '2022-12-01T09:00:00',
      role: 'admin',
      isBlocked: false
    },
    {
      id: 4,
      username: 'blockeduser',
      email: 'blocked@example.com',
      firstName: 'Blocked',
      lastName: 'User',
      avatar: null,
      createdAt: '2023-03-10T14:20:00',
      role: 'user',
      isBlocked: true
    }
  ];

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Hàm lấy danh sách người dùng
  const fetchUsers = async (page = currentPage) => {
    dispatch(setLoading(true));
    try {
      const response = await getAllUsers(page, pageSize);

      if (response.status === 'success') {
        // Chuyển đổi dữ liệu từ API để phù hợp với cấu trúc component
        const formattedUsers = response.data.users.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          createdAt: user.createdAt,
          role: user.isAdmin ? 'admin' : 'user',
          isBlocked: user.isBlocked || false
        }));

        setUsers(formattedUsers);
        setCurrentPage(response.data.currentPage);
        setTotalPages(response.data.totalPages);
      } else {
        throw new Error(response.message || 'Không thể lấy danh sách người dùng');
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
      dispatch(setError(error.message || 'Không thể lấy danh sách người dùng'));
      toast.error('Không thể lấy danh sách người dùng');

      // Sử dụng dữ liệu mẫu nếu API gặp lỗi (chỉ trong môi trường phát triển)
      if (process.env.NODE_ENV === 'development') {
        setUsers(mockUsers);
        console.warn('Sử dụng dữ liệu mẫu do API gặp lỗi');
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchUsers(newPage);
  };

  useEffect(() => {
    fetchUsers();
  }, [dispatch, pageSize]);

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    dispatch(setLoading(true));
    try {
      const response = await deleteUser(userToDelete.id);

      if (response.status === 'success') {
        // Cập nhật state
        setUsers(users.filter(user => user.id !== userToDelete.id));
        toast.success('Xóa người dùng thành công');
      } else {
        throw new Error(response.message || 'Không thể xóa người dùng');
      }
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
      dispatch(setError(error.message || 'Không thể xóa người dùng'));
      toast.error('Không thể xóa người dùng');
    } finally {
      dispatch(setLoading(false));
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  const handleBlockUser = async (user) => {
    dispatch(setLoading(true));
    try {
      const response = await toggleUserStatus(user.id, !user.isBlocked);

      if (response.status === 'success') {
        // Cập nhật state
        setUsers(users.map(u =>
          u.id === user.id ? { ...u, isBlocked: !u.isBlocked } : u
        ));

        toast.success(user.isBlocked ? 'Đã mở khóa người dùng' : 'Đã khóa người dùng');
      } else {
        throw new Error(response.message || 'Không thể thay đổi trạng thái người dùng');
      }
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái người dùng:', error);
      dispatch(setError(error.message || 'Không thể thay đổi trạng thái người dùng'));
      toast.error('Không thể thay đổi trạng thái người dùng');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleFormSubmit = async (formData) => {
    dispatch(setLoading(true));
    try {
      if (selectedUser) {
        // Cập nhật người dùng
        const response = await updateUser(selectedUser.id, formData);

        if (response.status === 'success') {
          // Cập nhật state
          setUsers(users.map(user =>
            user.id === selectedUser.id ? { ...user, ...formData } : user
          ));

          toast.success('Cập nhật người dùng thành công');
        } else {
          throw new Error(response.message || 'Không thể cập nhật thông tin người dùng');
        }
      } else {
        // Thêm người dùng mới
        const userData = {
          ...formData,
          isAdmin: formData.role === 'admin'
        };

        // Gọi API tạo người dùng mới
        const response = await createUser(userData);

        if (response.status === 'success') {
          toast.success('Thêm người dùng mới thành công');
          await fetchUsers(0); // Tải lại trang đầu tiên
        } else {
          throw new Error(response.message || 'Không thể tạo người dùng mới');
        }
      }
    } catch (error) {
      console.error('Lỗi khi lưu người dùng:', error);
      dispatch(setError(error.message || 'Không thể lưu thông tin người dùng'));
      toast.error('Không thể lưu thông tin người dùng');
    } finally {
      dispatch(setLoading(false));
      setShowForm(false);
      setSelectedUser(null);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setSelectedUser(null);
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <button
          onClick={handleAddUser}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
        >
          <i className="bi bi-plus-lg mr-2"></i>
          Thêm người dùng
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {showForm ? (
        <UserForm
          user={selectedUser}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelForm}
        />
      ) : (
        <>
          <UserTable
            users={users}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onBlock={handleBlockUser}
          />

          {/* Phân trang */}
          {totalPages > 0 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center">
                <button
                  onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className={`px-3 py-1 rounded-l-md border ${
                    currentPage === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>

                {[...Array(totalPages).keys()].map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 border-t border-b ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {page + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className={`px-3 py-1 rounded-r-md border ${
                    currentPage === totalPages - 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Modal xác nhận xóa */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Xác nhận xóa</h3>
            <p className="mb-6">
              Bạn có chắc chắn muốn xóa người dùng <span className="font-semibold">{userToDelete?.username}</span>?
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteUser}
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

export default UserManagementPage;
