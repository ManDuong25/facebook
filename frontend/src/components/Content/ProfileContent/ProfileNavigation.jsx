import React from 'react';
import PropTypes from 'prop-types';

const ProfileNavigation = ({ activeTab, onTabChange, isOwnProfile }) => {
    const tabs = [
        { id: 'posts', label: 'Bài viết' },
        { id: 'about', label: 'Giới thiệu' },
        { id: 'friends', label: 'Bạn bè' },
        { id: 'photos', label: 'Ảnh' },
        { id: 'videos', label: 'Video' },
        { id: 'checkins', label: 'Check in' },
    ];

    // Lọc các tab chỉ hiển thị cho chủ tài khoản nếu cần
    const visibleTabs = isOwnProfile
        ? tabs
        : tabs.filter((tab) => ['posts', 'about', 'friends', 'photos'].includes(tab.id));

    return (
        <div className="flex items-center gap-4 py-2">
            {visibleTabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-4 py-2 text-gray-700 font-medium ${
                        activeTab === tab.id ? 'border-b-2 border-blue-500 text-blue-500' : 'hover:bg-gray-100'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
            {isOwnProfile && (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => console.log('Open more options')}
                        className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100"
                    >
                        Xem thêm
                    </button>
                    <i className="bi bi-chevron-down text-gray-600"></i>
                </div>
            )}
        </div>
    );
};

ProfileNavigation.propTypes = {
    activeTab: PropTypes.string.isRequired,
    onTabChange: PropTypes.func.isRequired,
    isOwnProfile: PropTypes.bool,
};

ProfileNavigation.defaultProps = {
    isOwnProfile: false,
};

export default ProfileNavigation;
