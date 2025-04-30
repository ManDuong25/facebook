import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogout } from '../../../redux/features/adminSlice';

const AdminHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const adminUser = useSelector((state) => state.admin.adminUser);

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate('/admin/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg z-50 h-16">
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/admin" className="flex items-center">
            <i className="bi bi-facebook text-2xl mr-2"></i>
            <span className="text-xl font-bold tracking-wide">Facebook Admin</span>
          </Link>
        </div>

        <div className="flex items-center space-x-5">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center mr-2">
              <i className="bi bi-person-fill text-white"></i>
            </div>
            <span className="font-medium">
              {adminUser?.username || 'Admin'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-1.5 rounded-full text-sm font-medium transition flex items-center"
          >
            <i className="bi bi-box-arrow-right mr-1.5"></i>
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
