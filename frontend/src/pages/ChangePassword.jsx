import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../services/authService';
import { getCurrentUser } from '../services/authService';

const ChangePassword = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate passwords
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Mật khẩu mới và xác nhận mật khẩu không khớp');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        try {
            const user = getCurrentUser();
            if (!user || !user.id) {
                setError('Không tìm thấy thông tin người dùng');
                return;
            }

            const response = await changePassword(user.id, formData.currentPassword, formData.newPassword);

            setSuccess('Đổi mật khẩu thành công!');
            // Clear form fields
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            // Redirect to home page after 2 seconds
            setTimeout(() => {
                navigate('/');
            }, 1000);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Đổi mật khẩu</h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div
                                className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                                role="alert"
                            >
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}
                        {success && (
                            <div
                                className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative"
                                role="alert"
                            >
                                <span className="block sm:inline">{success}</span>
                            </div>
                        )}

                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                                Mật khẩu hiện tại
                            </label>
                            <div className="mt-1">
                                <input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type="password"
                                    required
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                Mật khẩu mới
                            </label>
                            <div className="mt-1">
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    required
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Xác nhận mật khẩu mới
                            </label>
                            <div className="mt-1">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col space-y-4">
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Đổi mật khẩu
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                className="w-full text-sm text-gray-600 hover:text-gray-900 py-2"
                            >
                                Quay lại
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
