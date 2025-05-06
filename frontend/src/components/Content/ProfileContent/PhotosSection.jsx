import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../assets/images'; // Import images giống Profile.jsx

const PhotosSection = ({ isOwnProfile }) => {
    const staticPhotos = [
        { id: '1', url: images.avatarJpg },
        { id: '2', url: images.avatarJpg },
        { id: '3', url: images.avatarJpg },
        { id: '4', url: images.avatarJpg },
        { id: '5', url: images.avatarJpg },
        { id: '6', url: images.avatarJpg },
    ];
    return (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-bold">Ảnh</h2>
                    <p className="text-sm text-gray-500">6 ảnh</p>
                </div>
                <div className="flex gap-2">
                    {isOwnProfile && (
                        <button className="text-blue-500 hover:bg-gray-100 px-2 py-1 rounded transition flex items-center gap-1">
                            <i className="bi bi-plus-lg"></i>
                            <span>Thêm ảnh</span>
                        </button>
                    )}
                    <button className="text-blue-500 hover:bg-gray-100 px-2 py-1 rounded transition">Xem tất cả</button>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {staticPhotos.map((photo) => (
                    <div key={photo.id} className="relative">
                        <a href={photo.url} className="block" target="_blank" rel="noopener noreferrer">
                            <div className="relative pb-[100%]">
                                <img
                                    src={photo.url}
                                    alt={`Photo ${photo.id}`}
                                    className="absolute inset-0 w-full h-full object-cover rounded-lg hover:opacity-95 transition"
                                />
                            </div>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

PhotosSection.propTypes = {
    isOwnProfile: PropTypes.bool,
};

PhotosSection.defaultProps = {
    isOwnProfile: false,
};

export default PhotosSection;
