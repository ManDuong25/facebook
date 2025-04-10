import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getAvatarUrl, handleImageError as globalHandleImageError } from '../../../utils/avatarUtils';
import { searchUsers, sendFriendRequest, checkFriendshipStatusBatch } from '../../../services/friendService';

const FindFriends = ({ suggestions: initialSuggestions, onSendRequest }) => {
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Xử lý tìm kiếm người dùng
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setError(null);
    setIsSearching(true);
    setSearchPerformed(true);
    
    try {
      console.log("Đang tìm kiếm với từ khóa:", searchTerm);
      
      // Lấy ID người dùng từ Redux thay vì localStorage
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const currentUserId = currentUser?.id;
      
      if (!currentUserId) {
        console.error("Không tìm thấy ID người dùng hiện tại");
        setError("Không thể xác định người dùng hiện tại. Vui lòng đăng nhập lại.");
        setSearchResults([]);
        setLoading(false);
        return;
      }
      
      console.log("ID người dùng hiện tại:", currentUserId);
      const results = await searchUsers(searchTerm);
      
      console.log("Kết quả tìm kiếm gốc từ API:", results);
      
      if (results && results.length > 0) {
        console.log("Tìm thấy kết quả:", results.length);
        
        // Xử lý dữ liệu trước khi kiểm tra trạng thái kết bạn
        const formattedResults = results.map(user => {
          // Định dạng tên hiển thị từ firstName và lastName
          const displayName = user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}`.trim() 
            : user.username || 'Người dùng không tên';
          
          console.log(`Người dùng: ${user.id}, Tên: ${displayName}, firstName: ${user.firstName}, lastName: ${user.lastName}`);
          
          return {
            ...user,
            name: displayName // Đảm bảo thuộc tính name được đặt đúng
          };
        });
        
        // Kiểm tra trạng thái kết bạn với mỗi người dùng trong kết quả tìm kiếm
        const userIds = formattedResults.map(user => user.id);
        console.log("Danh sách ID cần kiểm tra:", userIds);
        
        try {
          // Chuyển đổi currentUserId thành số nếu đang là chuỗi
          const userId = typeof currentUserId === 'string' ? parseInt(currentUserId, 10) : currentUserId;
          
          const statusResults = await checkFriendshipStatusBatch(userId, userIds);
          console.log("Kết quả trạng thái kết bạn:", statusResults);
          
          // Kết hợp thông tin trạng thái vào kết quả tìm kiếm
          const enhancedResults = formattedResults.map(user => {
            const status = statusResults.find(s => s.targetUserId === user.id);
            console.log(`Trạng thái kết bạn của user ${user.id} (${user.name}):`, status);
            
            return {
              ...user,
              requestSent: status?.status === 'PENDING',
              isFriend: status?.status === 'ACCEPTED',
              receivedRequest: status?.status === 'RECEIVED'
            };
          });
          
          console.log("Kết quả cuối cùng để hiển thị:", enhancedResults);
          setSearchResults(enhancedResults);
        } catch (statusError) {
          console.error("Lỗi khi kiểm tra trạng thái kết bạn:", statusError);
          // Vẫn hiển thị kết quả tìm kiếm nhưng không có thông tin trạng thái
          setSearchResults(formattedResults.map(user => ({
            ...user,
            requestSent: false,
            isFriend: false,
            receivedRequest: false
          })));
        }
      } else {
        console.log("Không tìm thấy kết quả nào");
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Có lỗi xảy ra khi tìm kiếm người dùng: ' + (err.response?.data?.message || err.message));
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý gửi lời mời kết bạn
  const handleSendRequest = async (userId) => {
    // Lấy ID người dùng từ Redux thay vì localStorage
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const currentUserId = currentUser?.id;
    
    if (!currentUserId) {
      console.error("Không tìm thấy ID người dùng hiện tại");
      alert("Không thể xác định người dùng hiện tại. Vui lòng đăng nhập lại.");
      return;
    }
    
    try {
      await sendFriendRequest(currentUserId, userId);
      
      // Cập nhật trạng thái sau khi gửi lời mời
      if (isSearching) {
        setSearchResults(prev => 
          prev.map(user => 
            user.id === userId ? { ...user, requestSent: true } : user
          )
        );
      } else {
        setSuggestions(prev => 
          prev.map(user => 
            user.id === userId ? { ...user, requestSent: true } : user
          )
        );
      }
      
      // Gọi callback từ prop
      if (onSendRequest) {
        onSendRequest(userId);
      }
    } catch (err) {
      console.error('Error sending friend request:', err);
      alert('Không thể gửi lời mời kết bạn');
    }
  };

  // Xử lý khi bỏ tìm kiếm và quay lại gợi ý
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setIsSearching(false);
    setSearchPerformed(false);
    setError(null);
  };
  
  // Render kết quả tìm kiếm hoặc gợi ý bạn bè
  const renderUsers = (users, isSearchResult = false) => {
    if (users.length === 0) {
      return (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <i className={`bi ${isSearchResult ? 'bi-search' : 'bi-person-plus-fill'} text-3xl mb-3 block text-gray-400`}></i>
          {isSearchResult ? (
            <div>
              <p className="text-gray-600 font-medium mb-2">Không tìm thấy người dùng nào</p>
              <p className="text-gray-500 text-sm mb-2">Từ khóa tìm kiếm: <span className="font-medium">"{searchTerm}"</span></p>
              <div className="text-gray-500 text-sm px-6">
                <p className="mb-2">Bạn có thể thử:</p>
                <ul className="list-disc text-left inline-block">
                  <li>Kiểm tra chính tả</li>
                  <li>Thử tìm kiếm với từ khóa khác</li>
                  <li>Tìm kiếm với tên đầy đủ hoặc tên đăng nhập</li>
                </ul>
              </div>
            </div>
          ) : (
            <p>Không có gợi ý bạn bè nào</p>
          )}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map((user) => (
          <div 
            key={user.id} 
            className="border border-gray-200 rounded-lg p-4 flex items-start hover:bg-gray-50 transition-colors"
          >
            <img 
              src={getAvatarUrl(user.avatar)} 
              alt={user.name} 
              className="w-16 h-16 rounded-lg object-cover mr-4"
              onError={(e) => globalHandleImageError(e)}
            />
            <div className="flex-1">
              <h4 className="font-semibold text-base">{user.name}</h4>
              {user.mutualFriends > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  <i className="bi bi-people mr-1"></i>
                  {user.mutualFriends} bạn chung
                </p>
              )}
              {user.workPlace && (
                <p className="text-sm text-gray-500 mt-1">
                  <i className="bi bi-briefcase mr-1"></i>
                  {user.workPlace}
                </p>
              )}
              {user.education && (
                <p className="text-sm text-gray-500 mt-1">
                  <i className="bi bi-book mr-1"></i>
                  {user.education}
                </p>
              )}
              <div className="mt-3">
                {user.isFriend ? (
                  <button
                    className="w-full py-2 text-sm text-gray-500 bg-gray-100 rounded-md flex items-center justify-center cursor-default"
                    disabled
                  >
                    <i className="bi bi-person-check mr-2"></i>
                    Bạn bè
                  </button>
                ) : user.requestSent ? (
                  <button
                    className="w-full py-2 text-sm text-gray-500 bg-gray-100 rounded-md flex items-center justify-center cursor-default"
                    disabled
                  >
                    <i className="bi bi-check-lg mr-2"></i>
                    Đã gửi lời mời
                  </button>
                ) : user.receivedRequest ? (
                  <button
                    className="w-full py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-md transition flex items-center justify-center"
                    onClick={() => onSendRequest(user.id)}
                  >
                    <i className="bi bi-check-lg mr-2"></i>
                    Đồng ý kết bạn
                  </button>
                ) : (
                  <button
                    onClick={() => handleSendRequest(user.id)}
                    className="w-full py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-md transition flex items-center justify-center"
                  >
                    <i className="bi bi-person-plus mr-2"></i>
                    Thêm bạn bè
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tìm kiếm theo tên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
          <button 
            type="submit" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
            disabled={loading}
          >
            {loading ? <i className="bi bi-hourglass-split animate-spin"></i> : 'Tìm kiếm'}
          </button>
          {isSearching && (
            <button 
              type="button" 
              onClick={handleClearSearch}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition"
            >
              Quay lại
            </button>
          )}
        </form>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p className="flex items-center"><i className="bi bi-exclamation-triangle mr-2"></i> {error}</p>
        </div>
      )}
      
      {/* Content Section */}
      <div>
        {isSearching ? (
          <>
            <h3 className="text-lg font-semibold mb-4">Kết quả tìm kiếm</h3>
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-3 text-gray-600">Đang tìm kiếm...</p>
              </div>
            ) : (
              renderUsers(searchResults, true)
            )}
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-4">Những người bạn có thể biết</h3>
            {renderUsers(suggestions)}
          </>
        )}
      </div>
      
      {!isSearching && (
        <div className="bg-gray-50 p-4 rounded-lg mt-8">
          <h4 className="font-medium text-lg mb-2">Tìm thêm bạn bè</h4>
          <p className="text-gray-600 text-sm mb-4">
            Mở rộng mạng lưới bạn bè và kết nối với những người có cùng sở thích, trường học hoặc nơi làm việc.
          </p>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 hover:bg-gray-50 rounded-full transition">
              <i className="bi bi-mortarboard mr-1"></i>
              Cùng trường học
            </button>
            <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 hover:bg-gray-50 rounded-full transition">
              <i className="bi bi-building mr-1"></i>
              Cùng công ty
            </button>
            <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 hover:bg-gray-50 rounded-full transition">
              <i className="bi bi-geo-alt mr-1"></i>
              Cùng địa điểm
            </button>
            <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 hover:bg-gray-50 rounded-full transition">
              <i className="bi bi-heart mr-1"></i>
              Cùng sở thích
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

FindFriends.propTypes = {
  suggestions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string,
      mutualFriends: PropTypes.number,
      requestSent: PropTypes.bool,
      workPlace: PropTypes.string,
      education: PropTypes.string
    })
  ).isRequired,
  onSendRequest: PropTypes.func.isRequired
};

export default FindFriends; 