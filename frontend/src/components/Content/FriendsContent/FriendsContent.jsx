import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import images from '../../../assets/images';
import FriendsList from './FriendsList';
import FriendRequests from './FriendRequests';
import FindFriends from './FindFriends';
import { 
  getFriends, 
  getFriendRequests, 
  getFriendSuggestions, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  sendFriendRequest, 
  removeFriend 
} from '../../../services/friendService';
import { getAvatarUrl } from '../../../utils/avatarUtils';

const FriendsContent = ({ userId }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  
  const currentUser = useSelector(state => state.auth.user);
  const [activeTab, setActiveTab] = useState(tabParam || 'all');
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiCallsCompleted, setApiCallsCompleted] = useState({
    friends: false,
    requests: false,
    suggestions: false
  });

  // Theo dõi URL params để cập nhật active tab
  useEffect(() => {
    if (tabParam && ['all', 'requests', 'suggestions'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Cập nhật URL khi tab thay đổi
  useEffect(() => {
    const currentParams = new URLSearchParams(location.search);
    currentParams.set('tab', activeTab);
    navigate(`${location.pathname}?${currentParams.toString()}`, { replace: true });
  }, [activeTab, location.pathname, navigate]);

  useEffect(() => {
    // Sử dụng ID người dùng từ Redux nếu không có prop
    const currentUserId = userId || currentUser?.id;
    if (!currentUserId) return;

    fetchData(currentUserId);
  }, [userId, currentUser]);

  // Lấy dữ liệu từ API
  const fetchData = async (userId) => {
    setIsLoading(true);
    setError(null);
    // Khởi tạo trạng thái API chưa gọi xong
    setApiCallsCompleted({
      friends: false,
      requests: false,
      suggestions: false
    });

    try {
      console.log('Fetching friends data for user ID:', userId);
      
      // Lấy danh sách bạn bè
      try {
        const friendsData = await getFriends(userId);
        console.log('Fetched friends:', friendsData);
        
        if (Array.isArray(friendsData)) {
          const formattedFriends = friendsData.map(user => ({
            id: user.id,
            name: user.firstName && user.lastName ? 
                 `${user.firstName} ${user.lastName}`.trim() : 
                 (user.username || 'Người dùng'),
            avatar: user.avatar,
            mutualFriends: 0, // API có thể không trả về thông tin này
          }));
          setFriends(formattedFriends);
        } else {
          // Nếu API trả về dữ liệu không hợp lệ, hiển thị mảng rỗng
          console.log('Invalid friends data format returned');
          setFriends([]);
        }
      } catch (friendErr) {
        console.error('Error fetching friends list:', friendErr);
        setFriends([]);
      } finally {
        setApiCallsCompleted(prev => ({...prev, friends: true}));
      }

      // Lấy danh sách lời mời kết bạn
      try {
        const requestsData = await getFriendRequests(userId);
        console.log('Fetched friend requests:', requestsData);
        
        if (Array.isArray(requestsData)) {
          const formattedRequests = requestsData.map(request => ({
            id: request.id,
            userId: request.sender?.id,
            name: request.sender ? 
                 `${request.sender.firstName || ''} ${request.sender.lastName || ''}`.trim() :
                 'Người dùng',
            avatar: request.sender?.avatar,
            mutualFriends: 0,
            sentAt: request.createdAt, // Thời gian tạo lời mời
          }));
          setFriendRequests(formattedRequests);
        } else {
          console.log('Invalid requests data format returned');
          setFriendRequests([]);
        }
      } catch (requestErr) {
        console.error('Error fetching friend requests:', requestErr);
        setFriendRequests([]);
      } finally {
        setApiCallsCompleted(prev => ({...prev, requests: true}));
      }

      // Lấy danh sách gợi ý kết bạn
      try {
        const suggestionsData = await getFriendSuggestions(userId);
        console.log('Fetched friend suggestions:', suggestionsData);
        
        if (Array.isArray(suggestionsData)) {
          const formattedSuggestions = suggestionsData.map(user => ({
            id: user.id,
            name: user.firstName && user.lastName ? 
                 `${user.firstName} ${user.lastName}`.trim() : 
                 (user.username || 'Người dùng'),
            avatar: user.avatar,
            mutualFriends: 0,
          }));
          setSuggestedFriends(formattedSuggestions);
        } else {
          console.log('Invalid suggestions data format returned');
          setSuggestedFriends([]);
        }
      } catch (suggestErr) {
        console.error('Error fetching friend suggestions:', suggestErr);
        setSuggestedFriends([]);
      } finally {
        setApiCallsCompleted(prev => ({...prev, suggestions: true}));
      }
    } catch (err) {
      console.error('General error fetching friends data:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      setFriends([]);
      setFriendRequests([]);
      setSuggestedFriends([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý chấp nhận lời mời kết bạn
  const handleAcceptRequest = async (requestId) => {
    try {
      setIsLoading(true);
      
      await acceptFriendRequest(requestId);
      
      // Cập nhật UI - tìm yêu cầu được chấp nhận
      const request = friendRequests.find(req => req.id === requestId);
      if (request) {
        // Thêm vào danh sách bạn bè
        setFriends(prev => [...prev, { 
          id: request.userId,
          name: request.name,
          avatar: request.avatar,
          mutualFriends: request.mutualFriends
        }]);
        // Xóa khỏi danh sách yêu cầu
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert('Không thể chấp nhận lời mời kết bạn. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý từ chối lời mời kết bạn
  const handleDeclineRequest = async (requestId) => {
    try {
      setIsLoading(true);
      
      await rejectFriendRequest(requestId);
      
      // Cập nhật UI
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error declining friend request:', error);
      alert('Không thể từ chối lời mời kết bạn. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý gửi lời mời kết bạn
  const handleSendRequest = async (receiverId) => {
    try {
      setIsLoading(true);
      const currentUserId = userId || currentUser?.id;
      
      await sendFriendRequest(currentUserId, receiverId);
      
      // Cập nhật UI
      setSuggestedFriends(prev => prev.map(user => 
        user.id === receiverId ? { ...user, requestSent: true } : user
      ));
      
      // Cập nhật lại danh sách gợi ý sau khi gửi lời mời
      fetchData(currentUserId);
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Không thể gửi lời mời kết bạn. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý hủy kết bạn
  const handleRemoveFriend = async (friendId) => {
    try {
      setIsLoading(true);
      const currentUserId = userId || currentUser?.id;
      
      await removeFriend(currentUserId, friendId);
      
      // Cập nhật UI
      setFriends(prev => prev.filter(friend => friend.id !== friendId));
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('Không thể hủy kết bạn. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Làm mới dữ liệu
  const handleRefresh = () => {
    const currentUserId = userId || currentUser?.id;
    if (currentUserId) {
      fetchData(currentUserId);
    }
  };

  // Hiển thị nội dung trống khi không có dữ liệu
  const renderEmptyContent = (tab) => {
    // Kiểm tra xem API đã gọi xong chưa
    const apiDone = apiCallsCompleted[tab === 'all' ? 'friends' : (tab === 'requests' ? 'requests' : 'suggestions')];
    
    if (!apiDone) {
      return null; // Vẫn đang tải, không hiển thị gì
    }
    
    let icon = 'bi-people';
    let message = 'Không có dữ liệu';
    
    switch (tab) {
      case 'all':
        message = 'Bạn chưa có bạn bè nào';
        break;
      case 'requests':
        icon = 'bi-envelope';
        message = 'Không có lời mời kết bạn nào';
        break;
      case 'suggestions':
        icon = 'bi-person-plus';
        message = 'Không có gợi ý kết bạn nào';
        break;
      default:
        break;
    }
    
    return (
      <div className="text-center py-12">
        <i className={`bi ${icon} text-4xl text-gray-400 mb-3 block`}></i>
        <p className="text-gray-500">{message}</p>
        
        {tab === 'all' && (
          <Link 
            to="/friends?tab=suggestions" 
            className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition mt-4"
            onClick={() => setActiveTab('suggestions')}
          >
            <i className="bi bi-person-plus mr-2"></i>
            Tìm bạn mới
          </Link>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Bạn bè</h1>
          </div>
          <button 
            onClick={handleRefresh}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center text-sm"
            disabled={isLoading}
          >
            <i className="bi bi-arrow-clockwise mr-2"></i>
            Làm mới
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`py-3 px-4 font-medium ${
              activeTab === 'all' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('all')}
          >
            Tất cả bạn bè
          </button>
          <button
            className={`py-3 px-4 font-medium ${
              activeTab === 'requests' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('requests')}
          >
            Lời mời kết bạn
            {friendRequests.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                {friendRequests.length}
              </span>
            )}
          </button>
          <button
            className={`py-3 px-4 font-medium ${
              activeTab === 'suggestions' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('suggestions')}
          >
            Gợi ý
          </button>
        </div>

        {/* Content based on active tab */}
        <div className="p-4">
          {isLoading && apiCallsCompleted.friends === false && apiCallsCompleted.requests === false && apiCallsCompleted.suggestions === false ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'all' && (
                friends.length > 0 ? (
                  <FriendsList 
                    friends={friends} 
                    onRemoveFriend={handleRemoveFriend} 
                  />
                ) : renderEmptyContent('all')
              )}
              
              {activeTab === 'requests' && (
                friendRequests.length > 0 ? (
                  <FriendRequests 
                    requests={friendRequests} 
                    onAccept={handleAcceptRequest} 
                    onDecline={handleDeclineRequest} 
                  />
                ) : renderEmptyContent('requests')
              )}
              
              {activeTab === 'suggestions' && (
                <FindFriends 
                  suggestions={suggestedFriends} 
                  onSendRequest={handleSendRequest} 
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

FriendsContent.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default FriendsContent; 