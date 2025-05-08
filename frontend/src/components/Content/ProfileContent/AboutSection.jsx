import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../../../services/profileService';

const AboutSection = ({ userId }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        bio: '',
        dob: '',
        gender: '',
        work: '',
        education: '',
        location: '',
        hometown: '',
    });

    // Lấy thông tin profile khi component được mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Nếu không có userId, không gọi API
                if (!userId) {
                    setProfile({
                        name: 'Người dùng',
                        email: 'user@example.com',
                        bio: 'Thông tin giới thiệu đang được cập nhật',
                        dob: '',
                        gender: '',
                        work: 'Chưa cập nhật',
                        education: 'Chưa cập nhật',
                        location: 'Chưa cập nhật',
                        hometown: '',
                    });
                    return;
                }

                const data = await getProfile(userId);
                // Kiểm tra nếu data là null hoặc undefined
                if (data) {
                    setProfile(data);
                } else {
                    // Sử dụng dữ liệu mặc định nếu không có dữ liệu từ API
                    setProfile({
                        name: 'Người dùng',
                        email: 'user@example.com',
                        bio: 'Thông tin giới thiệu đang được cập nhật',
                        dob: '',
                        gender: '',
                        work: 'Chưa cập nhật',
                        education: 'Chưa cập nhật',
                        location: 'Chưa cập nhật',
                        hometown: '',
                    });
                }
            } catch (error) {
                console.error('Failed to load profile:', error);
                // Sử dụng dữ liệu mặc định nếu có lỗi
                setProfile({
                    name: 'Người dùng',
                    email: 'user@example.com',
                    bio: 'Thông tin giới thiệu đang được cập nhật',
                    dob: '',
                    gender: '',
                    work: 'Chưa cập nhật',
                    education: 'Chưa cập nhật',
                    location: 'Chưa cập nhật',
                    hometown: '',
                });
            }
        };
        fetchProfile();
    }, [userId]);

    // Xử lý thay đổi input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile({ ...profile, [name]: value });
    };

    // Lưu thông tin đã chỉnh sửa
    const handleSave = async () => {
        try {
            const updatedProfile = await updateProfile(userId, profile);
            setProfile(updatedProfile);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save profile:', error.message, error.response?.data);
            alert('Không thể lưu thông tin. Vui lòng thử lại!');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Giới thiệu</h2>
                <button
                    className="text-blue-500 hover:bg-gray-100 px-2 py-1 rounded transition"
                    onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                >
                    {isEditing ? 'Lưu' : 'Chỉnh sửa'}
                </button>
            </div>

            <div className="space-y-4">
                {/* Tên */}
                <div className="flex items-center">
                    <i className="bi bi-person text-gray-500 mr-2"></i>
                    {isEditing ? (
                        <input name="name" value={profile.name} onChange={handleInputChange} className="border p-1" />
                    ) : (
                        <span>{profile.name}</span>
                    )}
                </div>

                {/* Email */}
                <div className="flex items-center">
                    <i className="bi bi-envelope text-gray-500 mr-2"></i>
                    {isEditing ? (
                        <input
                            name="email"
                            value={profile.email}
                            onChange={handleInputChange}
                            className="border p-1 bg-gray-100"
                            disabled
                            readOnly
                        />
                    ) : (
                        <span>{profile.email}</span>
                    )}
                </div>

                {/* Bio */}
                <div className="flex items-center">
                    <i className="bi bi-chat text-gray-500 mr-2"></i>
                    {isEditing ? (
                        <textarea
                            name="bio"
                            value={profile.bio}
                            onChange={handleInputChange}
                            className="border p-1 w-full"
                        />
                    ) : (
                        <span>{profile.bio}</span>
                    )}
                </div>

                {/* Thông tin chi tiết */}
                {showDetails && (
                    <div className="space-y-4">
                        {/* Ngày sinh */}
                        <div className="flex items-center">
                            <i className="bi bi-calendar text-gray-500 mr-2"></i>
                            {isEditing ? (
                                <input
                                    type="date"
                                    name="dob"
                                    value={profile.dob}
                                    onChange={handleInputChange}
                                    className="border p-1"
                                />
                            ) : (
                                <span>{profile.dob || 'Chưa cập nhật'}</span>
                            )}
                        </div>

                        {/* Giới tính */}
                        <div className="flex items-center">
                            <i className="bi bi-gender-ambiguous text-gray-500 mr-2"></i>
                            {isEditing ? (
                                <select
                                    name="gender"
                                    value={profile.gender}
                                    onChange={handleInputChange}
                                    className="border p-1"
                                >
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            ) : (
                                <span>{profile.gender || 'Chưa cập nhật'}</span>
                            )}
                        </div>

                        {/* Công việc */}
                        <div>
                            <h3 className="font-semibold text-[15px] mb-2">Công việc</h3>
                            <div className="flex items-center">
                                <i className="bi bi-briefcase text-gray-500 mr-2"></i>
                                {isEditing ? (
                                    <input
                                        name="work"
                                        value={profile.work}
                                        onChange={handleInputChange}
                                        className="border p-1"
                                    />
                                ) : (
                                    <span>{profile.work || 'Chưa cập nhật'}</span>
                                )}
                            </div>
                        </div>

                        {/* Học vấn */}
                        <div>
                            <h3 className="font-semibold text-[15px] mb-2">Học vấn</h3>
                            <div className="flex items-center">
                                <i className="bi bi-mortarboard text-gray-500 mr-2"></i>
                                {isEditing ? (
                                    <input
                                        name="education"
                                        value={profile.education}
                                        onChange={handleInputChange}
                                        className="border p-1"
                                    />
                                ) : (
                                    <span>{profile.education || 'Chưa cập nhật'}</span>
                                )}
                            </div>
                        </div>

                        {/* Nơi sống hiện tại */}
                        <div>
                            <h3 className="font-semibold text-[15px] mb-2">Nơi sống hiện tại</h3>
                            <div className="flex items-center">
                                <i className="bi bi-geo-alt text-gray-500 mr-2"></i>
                                {isEditing ? (
                                    <input
                                        name="location"
                                        value={profile.location}
                                        onChange={handleInputChange}
                                        className="border p-1"
                                    />
                                ) : (
                                    <span>{profile.location || 'Chưa cập nhật'}</span>
                                )}
                            </div>
                        </div>

                        {/* Quê quán */}
                        <div>
                            <h3 className="font-semibold text-[15px] mb-2">Quê quán</h3>
                            <div className="flex items-center">
                                <i className="bi bi-house text-gray-500 mr-2"></i>
                                {isEditing ? (
                                    <input
                                        name="hometown"
                                        value={profile.hometown}
                                        onChange={handleInputChange}
                                        className="border p-1"
                                    />
                                ) : (
                                    <span>{profile.hometown || 'Chưa cập nhật'}</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <button className="text-blue-500 hover:underline" onClick={() => setShowDetails(!showDetails)}>
                    {showDetails ? 'Thu gọn' : 'Xem thêm'}
                </button>
            </div>
        </div>
    );
};

export default AboutSection;
