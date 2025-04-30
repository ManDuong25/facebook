import React from 'react';
import AdminHeader from '../../components/Admin/Header/AdminHeader';
import AdminSidebar from '../../components/Admin/Sidebar/AdminSidebar';

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AdminHeader />
      <div className="flex flex-1 pt-16">
        <AdminSidebar />
        <main className="flex-1 p-6 ml-64">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
