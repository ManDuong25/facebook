import React from 'react';
import { NavLink } from 'react-router-dom';

const menuItems = [
  { path: '/admin', icon: 'bi-speedometer2', label: 'Tổng quan' },
  { path: '/admin/users', icon: 'bi-people-fill', label: 'Quản lý người dùng' },
  { path: '/admin/posts', icon: 'bi-file-post-fill', label: 'Quản lý bài viết' },
];

const AdminSidebar = () => {
  return (
    <div className="fixed left-0 top-16 bottom-0 w-64 bg-white text-gray-800 shadow-md overflow-y-auto border-r border-gray-200">
      <div className="p-5">
        <h2 className="text-lg font-semibold mb-5 text-gray-700 flex items-center">
          <i className="bi bi-list text-blue-600 mr-2"></i>
          Menu quản trị
        </h2>
        <nav>
          <ul className="space-y-3">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center p-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-medium shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-500'
                    }`
                  }
                  end={item.path === '/admin'}
                >
                  <i className={`bi ${item.icon} mr-3 text-xl ${isActive => isActive ? 'text-blue-500' : ''}`}></i>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
