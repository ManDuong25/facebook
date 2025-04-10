import React from 'react';
import PropTypes from 'prop-types';

const ProfileActions = ({ isOwnProfile, onAddToStory, onEditProfile }) => {
  return (
    <div className="flex flex-col items-end gap-1">
      {isOwnProfile && (
        <>
          <div className="flex items-center gap-2 flex-nowrap">
            <button
              onClick={onAddToStory}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 whitespace-nowrap"
            >
              <i className="bi bi-plus-lg"></i>
              Thêm vào tin
            </button>
            <button
              onClick={onEditProfile}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md flex items-center gap-2 whitespace-nowrap"
            >
              <i className="bi bi-pencil"></i>
              Chỉnh sửa trang cá nhân
            </button>
          </div>
          <button
            onClick={() => console.log('Open dropdown menu')}
            className="bg-gray-200 hover:bg-gray-300 px-2 py-2 rounded-md flex items-center"
          >
          <i className="bi bi-chevron-down text-gray-600"></i>
          </button>
        </>
      )}
    </div>
  );
};

// ProfileActions.propTypes = {
//   isOwnProfile: PropTypes.bool,
//   onAddToStory: PropTypes.func,
//   onEditProfile: PropTypes.func
// };

export default ProfileActions;