import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import images from '../../../assets/images';
import { getAvatarUrl, handleImageError as globalHandleImageError } from '../../../utils/avatarUtils';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const FriendRequests = ({ requests, onAccept, onDecline }) => {
  // Hàm format thời gian
  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div>
      <h2 className="font-semibold text-lg mb-4">Lời mời kết bạn ({requests.length})</h2>
      {requests.length === 0 ? (
        <div className="text-center py-10">
          <i className="bi bi-people text-5xl text-gray-300"></i>
          <p className="mt-2 text-gray-500">Bạn không có lời mời kết bạn nào.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(request => (
            <div 
              key={request.id} 
              className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex items-center">
                <Link to={`/profile/${request.userId}`}>
                  <img 
                    src={getAvatarUrl(request.avatar)} 
                    alt={request.name} 
                    className="w-16 h-16 rounded-full object-cover mr-3"
                    onError={(e) => globalHandleImageError(e)}
                  />
                </Link>
                <div>
                  <Link to={`/profile/${request.userId}`} className="font-semibold text-lg hover:underline">
                    {request.name}
                  </Link>
                  <div className="text-sm text-gray-500 flex items-center">
                    {request.mutualFriends > 0 && (
                      <span className="mr-2">{request.mutualFriends} bạn chung</span>
                    )}
                    <span className="text-xs">• {formatTime(request.sentAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                <button 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex-1 sm:w-32"
                  onClick={() => onAccept(request.id)}
                >
                  Xác nhận
                </button>
                <button 
                  className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded-md flex-1 sm:w-32"
                  onClick={() => onDecline(request.id)}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

FriendRequests.propTypes = {
  requests: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string,
      mutualFriends: PropTypes.number,
      sentAt: PropTypes.string
    })
  ).isRequired,
  onAccept: PropTypes.func.isRequired,
  onDecline: PropTypes.func.isRequired
};

export default FriendRequests; 