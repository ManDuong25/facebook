import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getFriends } from '../../../services/friendService';
import { getAvatarUrl, handleImageError as globalHandleImageError } from '../../../utils/avatarUtils';

const FriendsSection = ({ preview = true, userId }) => {
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      setError(null);
      try {
        console.log('Fetching friends for user ID:', userId);
        const data = await getFriends(userId);
        console.log('FriendsSection - Fetched friends:', data);
        
        // Xử lý dữ liệu từ API
        if (Array.isArray(data)) {
          const processedFriends = data.map(friend => ({
            id: friend.id,
            name: friend.firstName && friend.lastName ? 
                 `${friend.firstName} ${friend.lastName}`.trim() : 
                 (friend.username || 'Người dùng'),
            avatar: friend.avatar
          }));
          setFriends(processedFriends);
        } else {
          console.log('Invalid data format returned from API');
          setError('Định dạng dữ liệu không hợp lệ');
          setFriends([]);
        }
      } catch (err) {
        console.error('Error fetching friends:', err);
        setError('Không thể tải danh sách bạn bè');
        setFriends([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriends();
  }, [userId]);
  
  // Chỉ hiển thị 6 bạn bè trong chế độ xem trước
  const displayFriends = preview ? friends.slice(0, 6) : friends;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Bạn bè</h2>
          <p className="text-sm text-gray-500">{friends.length} người bạn</p>
        </div>
        {preview && (
          <Link to="/friends" className="text-blue-500 hover:bg-gray-100 px-2 py-1 rounded transition">
            Xem tất cả bạn bè
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-4">
          <span className="text-gray-500">Đang tải danh sách bạn bè...</span>
        </div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">{error}</div>
      ) : displayFriends.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {displayFriends.map((friend) => (
            <div key={friend.id} className="relative">
              <Link to={`/profile/${friend.id}`} className="block">
                <div className="relative pb-[100%]">
                  <img
                    src={getAvatarUrl(friend.avatar)}
                    alt={friend.name}
                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                    onError={(e) => globalHandleImageError(e)}
                  />
                </div>
                <p className="mt-1 text-sm font-medium truncate">{friend.name}</p>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          <i className="bi bi-people text-3xl mb-2 block"></i>
          <p>Chưa có bạn bè nào</p>
          
          <div className="mt-4">
            <Link 
              to="/friends?tab=suggestions" 
              className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
            >
              <i className="bi bi-person-plus mr-2"></i>
              Tìm bạn mới
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

FriendsSection.propTypes = {
  preview: PropTypes.bool,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default FriendsSection;