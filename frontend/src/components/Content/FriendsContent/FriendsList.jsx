import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import FriendCard from './FriendCard';

const FriendsList = ({ friends, onRemoveFriend }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Lọc bạn bè theo tên
  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm bạn bè"
            className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="bi bi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      {filteredFriends.length === 0 ? (
        <div className="text-center py-10">
          <i className="bi bi-people text-5xl text-gray-300"></i>
          <p className="mt-2 text-gray-500">
            {searchTerm ? 'Không tìm thấy bạn bè phù hợp với tìm kiếm.' : 'Bạn chưa có bạn bè nào.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFriends.map(friend => (
            <FriendCard
              key={friend.id}
              friend={friend}
              onRemove={onRemoveFriend}
            />
          ))}
        </div>
      )}
    </div>
  );
};

FriendsList.propTypes = {
  friends: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string,
      mutualFriends: PropTypes.number
    })
  ).isRequired,
  onRemoveFriend: PropTypes.func.isRequired
};

export default FriendsList; 