import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getAvatarUrl, handleImageError as globalHandleImageError } from '../../../utils/avatarUtils';
import {
    searchUsers,
    sendFriendRequest,
    checkFriendshipStatusBatch,
    getMutualFriendDetails,
    acceptFriendRequest,
    findFriendRequestId,
} from '../../../services/friendService';
import { toast } from 'react-toastify';

const FindFriends = ({ suggestions: initialSuggestions }) => {
    const [suggestions, setSuggestions] = useState(initialSuggestions);
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mutualFriends, setMutualFriends] = useState({});
    const [searchTimeout, setSearchTimeout] = useState(null);

    // Kiểm tra trạng thái kết bạn ngay khi component được tải
    useEffect(() => {
        const checkInitialFriendshipStatus = async () => {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const currentUserId = currentUser?.id;

            if (!currentUserId || !initialSuggestions || initialSuggestions.length === 0) {
                return;
            }

            // Chuẩn hóa tên cho suggestions
            const formattedSuggestions = initialSuggestions.map((user) => {
                // Đảm bảo mỗi user có thuộc tính name
                if (!user.name) {
                    return {
                        ...user,
                        name:
                            user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`.trim()
                                : user.username || 'Người dùng không tên',
                    };
                }
                return user;
            });

            // Lấy danh sách ID từ suggestions
            const userIds = formattedSuggestions.map((user) => user.id);

            try {
                // Chuyển đổi currentUserId thành số nếu đang là chuỗi
                const userId = typeof currentUserId === 'string' ? parseInt(currentUserId, 10) : currentUserId;

                // Gọi API kiểm tra trạng thái kết bạn hàng loạt
                const statusResults = await checkFriendshipStatusBatch(userId, userIds);

                if (statusResults && statusResults.length > 0) {
                    // Cập nhật trạng thái kết bạn cho suggestions
                    const updatedSuggestions = formattedSuggestions.map((user) => {
                        const status = statusResults.find((s) => s.targetUserId === user.id);

                        return {
                            ...user,
                            requestSent: status?.status === 'PENDING',
                            isFriend: status?.status === 'ACCEPTED',
                            receivedRequest: status?.status === 'RECEIVED',
                        };
                    });

                    // Cập nhật state với suggestions đã cập nhật trạng thái
                    setSuggestions(updatedSuggestions);
                } else {
                    // Nếu không có kết quả trạng thái, vẫn cập nhật tên đã được chuẩn hóa
                    setSuggestions(formattedSuggestions);
                }
            } catch (error) {
                console.error('Lỗi khi kiểm tra trạng thái kết bạn ban đầu:', error);
                // Nếu có lỗi, vẫn cập nhật tên đã được chuẩn hóa
                setSuggestions(formattedSuggestions);
            }
        };

        checkInitialFriendshipStatus();
    }, [initialSuggestions]);

    // Cleanup function for debounce
    useEffect(() => {
        // Cleanup function to clear timeout when component unmounts
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    useEffect(() => {
        // Fetch mutual friends for initial suggestions
        const fetchMutualFriends = async () => {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const currentUserId = currentUser?.id;

            if (!currentUserId || !suggestions || suggestions.length === 0) {
                return;
            }

            const mutualFriendsData = { ...mutualFriends };

            for (const user of suggestions) {
                try {
                    if (!mutualFriendsData[user.id]) {
                        const response = await getMutualFriendDetails(currentUserId, user.id);
                        if (response && response.data && response.data.data) {
                            mutualFriendsData[user.id] = response.data.data;
                        } else if (response && response.data) {
                            mutualFriendsData[user.id] = response.data;
                        } else {
                            mutualFriendsData[user.id] = [];
                        }
                    }
                } catch (err) {
                    console.error(`Error fetching mutual friends for user ${user.id}:`, err);
                    mutualFriendsData[user.id] = [];
                }
            }

            setMutualFriends(mutualFriendsData);
        };

        fetchMutualFriends();
    }, [suggestions]); // Chạy lại khi suggestions thay đổi

    // Debounced search function
    const debouncedSearch = useCallback(
        async (term) => {
            if (!term.trim()) {
                // Nếu search term rỗng và đang ở chế độ tìm kiếm, quay lại gợi ý
                if (isSearching) {
                    handleClearSearch();
                }
                return;
            }

            setLoading(true);
            setError(null);
            setIsSearching(true);
            setSearchPerformed(true);

            try {
                // Lấy ID người dùng từ localStorage
                const currentUser = JSON.parse(localStorage.getItem('user'));
                const currentUserId = currentUser?.id;

                if (!currentUserId) {
                    console.error('Không tìm thấy ID người dùng hiện tại');
                    setError('Không thể xác định người dùng hiện tại. Vui lòng đăng nhập lại.');
                    setSearchResults([]);
                    setLoading(false);
                    return;
                }

                // Đảm bảo không tìm kiếm chính mình
                const results = await searchUsers(term, false);

                if (results && results.length > 0) {
                    // Xử lý dữ liệu trước khi kiểm tra trạng thái kết bạn
                    const formattedResults = results
                        .filter((user) => user.id !== currentUserId) // Loại bỏ người dùng hiện tại
                        .map((user) => {
                            // Định dạng tên hiển thị từ firstName và lastName
                            const displayName =
                                user.firstName && user.lastName
                                    ? `${user.firstName} ${user.lastName}`.trim()
                                    : user.username || 'Người dùng không tên';

                            return {
                                ...user,
                                name: displayName, // Đảm bảo thuộc tính name được đặt đúng
                            };
                        });

                    // Kiểm tra trạng thái kết bạn với mỗi người dùng trong kết quả tìm kiếm
                    const userIds = formattedResults.map((user) => user.id);

                    try {
                        // Chuyển đổi currentUserId thành số nếu đang là chuỗi
                        const userId = typeof currentUserId === 'string' ? parseInt(currentUserId, 10) : currentUserId;

                        const statusResults = await checkFriendshipStatusBatch(userId, userIds);

                        // Kết hợp thông tin trạng thái vào kết quả tìm kiếm
                        const enhancedResults = formattedResults.map((user) => {
                            const status = statusResults.find((s) => s.targetUserId === user.id);

                            return {
                                ...user,
                                requestSent: status?.status === 'PENDING',
                                isFriend: status?.status === 'ACCEPTED',
                                receivedRequest: status?.status === 'RECEIVED',
                            };
                        });

                        // Fetch mutual friends for search results
                        await fetchMutualFriendsForSearchResults(enhancedResults);
                        setSearchResults(enhancedResults);
                    } catch (statusError) {
                        console.error('Lỗi khi kiểm tra trạng thái kết bạn:', statusError);
                        // Vẫn hiển thị kết quả tìm kiếm nhưng không có thông tin trạng thái
                        const resultsWithoutStatus = formattedResults.map((user) => ({
                            ...user,
                            requestSent: false,
                            isFriend: false,
                            receivedRequest: false,
                        }));

                        // Fetch mutual friends for search results
                        await fetchMutualFriendsForSearchResults(resultsWithoutStatus);
                        setSearchResults(resultsWithoutStatus);
                    }
                } else {
                    setSearchResults([]);
                }
            } catch (err) {
                console.error('Error searching users:', err);
                setError('Có lỗi xảy ra khi tìm kiếm người dùng: ' + (err.response?.data?.message || err.message));
                setSearchResults([]);
            } finally {
                setLoading(false);
            }
        },
        [isSearching],
    );

    // Handle search input change with debounce
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set new timeout
        const timeout = setTimeout(() => {
            debouncedSearch(value);
        }, 500); // 1 second delay

        setSearchTimeout(timeout);
    };

    // Xử lý tìm kiếm người dùng (khi nhấn nút tìm kiếm)
    const handleSearch = async (e) => {
        e.preventDefault();

        // Clear any pending timeout to prevent duplicate searches
        if (searchTimeout) {
            clearTimeout(searchTimeout);
            setSearchTimeout(null);
        }

        // Perform search immediately
        if (searchTerm.trim()) {
            debouncedSearch(searchTerm);
        }
    };

    // Xử lý gửi lời mời kết bạn
    const handleSendRequest = async (userId) => {
        // Lấy ID người dùng từ Redux thay vì localStorage
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const currentUserId = currentUser?.id;

        if (!currentUserId) {
            console.error('Không tìm thấy ID người dùng hiện tại');
            alert('Không thể xác định người dùng hiện tại. Vui lòng đăng nhập lại.');
            return;
        }

        try {
            const res = await sendFriendRequest(currentUserId, userId);
            // Cập nhật trạng thái sau khi gửi lời mời
            if (isSearching) {
                setSearchResults((prev) =>
                    prev.map((user) => (user.id === userId ? { ...user, requestSent: true } : user)),
                );
            } else {
                setSuggestions((prev) =>
                    prev.map((user) => (user.id === userId ? { ...user, requestSent: true } : user)),
                );
            }
        } catch (err) {
            console.error('Error sending friend request:', err);
            alert('Không thể gửi lời mời kết bạn');
        }
    };

    // Xử lý chấp nhận lời mời kết bạn
    const handleAcceptRequest = async (userId) => {
        // Lấy ID người dùng từ localStorage
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const currentUserId = currentUser?.id;

        if (!currentUserId) {
            console.error('Không tìm thấy ID người dùng hiện tại');
            alert('Không thể xác định người dùng hiện tại. Vui lòng đăng nhập lại.');
            return;
        }

        try {
            const resFriendRequest = await findFriendRequestId(userId, currentUserId);

            if (resFriendRequest) {
                const requestId = resFriendRequest.id;
                const res = await acceptFriendRequest(requestId);
                if (res && res.EC === 0) {
                    toast.success('Chấp nhận lời mời kết bạn thành công!');
                    // Cập nhật trạng thái sau khi chấp nhận lời mời
                    if (isSearching) {
                        setSearchResults((prev) =>
                            prev.map((user) =>
                                user.id === userId ? { ...user, isFriend: true, receivedRequest: false } : user,
                            ),
                        );
                    } else {
                        setSuggestions((prev) =>
                            prev.map((user) =>
                                user.id === userId ? { ...user, isFriend: true, receivedRequest: false } : user,
                            ),
                        );
                    }
                } else {
                    toast.error('Chấp nhận lời mời kết bạn thất bại, lỗi hệ thống!');
                }
            } else {
                console.error('Không tìm thấy lời mời kết bạn');
                toast.error('Không thể tìm thấy lời mời kết bạn. Vui lòng thử lại sau.');
                return;
            }
        } catch (err) {
            console.error('Error accepting friend request:', err);
            toast.error('Không thể chấp nhận lời mời kết bạn: ' + err.message);
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

    // Add function to fetch mutual friends for search results
    const fetchMutualFriendsForSearchResults = async (users) => {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const currentUserId = currentUser?.id;

        if (!currentUserId || !users || users.length === 0) {
            return users;
        }

        // Ensure all users have a 'name' property
        const formattedUsers = users.map((user) => {
            if (!user.name) {
                return {
                    ...user,
                    name:
                        user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`.trim()
                            : user.username || 'Người dùng không tên',
                };
            }
            return user;
        });

        const mutualFriendsData = { ...mutualFriends };

        for (const user of formattedUsers) {
            try {
                if (!mutualFriendsData[user.id]) {
                    const response = await getMutualFriendDetails(currentUserId, user.id);
                    if (response && response.data && response.data.data) {
                        mutualFriendsData[user.id] = response.data.data;
                    } else if (response && response.data) {
                        mutualFriendsData[user.id] = response.data;
                    } else {
                        mutualFriendsData[user.id] = [];
                    }
                }
            } catch (err) {
                console.error(`Error fetching mutual friends for user ${user.id}:`, err);
                mutualFriendsData[user.id] = [];
            }
        }

        setMutualFriends(mutualFriendsData);
        return formattedUsers;
    };

    // Render kết quả tìm kiếm hoặc gợi ý bạn bè
    const renderUsers = (users, isSearchResult = false) => {
        if (!users || users.length === 0) {
            return (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <i
                        className={`bi ${
                            isSearchResult ? 'bi-search' : 'bi-person-plus-fill'
                        } text-3xl mb-3 block text-gray-400`}
                    ></i>
                    {isSearchResult ? (
                        <div>
                            <p className="text-gray-600 font-medium mb-2">Không tìm thấy người dùng nào</p>
                            <p className="text-gray-500 text-sm mb-2">
                                Từ khóa tìm kiếm: <span className="font-medium">"{searchTerm}"</span>
                            </p>
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
                        className="border border-gray-200 rounded-lg p-4 flex items-center hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex-shrink-0">
                            <img
                                src={getAvatarUrl(user.avatar)}
                                alt={user.name || `${user.firstName} ${user.lastName}`.trim() || user.username}
                                className="w-16 h-16 rounded-lg object-cover"
                                onError={(e) => globalHandleImageError(e)}
                            />
                        </div>
                        <div className="flex-1 ml-4 flex flex-col min-h-[100px] justify-between">
                            <div>
                                <h4 className="font-semibold text-base">
                                    {user.name || `${user.firstName} ${user.lastName}`.trim() || user.username}
                                </h4>
                                {mutualFriends[user.id] && mutualFriends[user.id].length > 0 ? (
                                    <p className="text-sm text-gray-500 mt-1">
                                        <i className="bi bi-people mr-1"></i>
                                        {mutualFriends[user.id].length} bạn chung
                                    </p>
                                ) : (
                                    user.mutualFriends > 0 && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            <i className="bi bi-people mr-1"></i>
                                            {user.mutualFriends} bạn chung
                                        </p>
                                    )
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
                            </div>
                            <div className="mt-auto pt-3">
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
                                        onClick={() => handleAcceptRequest(user.id)}
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
                            onChange={handleSearchChange}
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
                    <p className="flex items-center">
                        <i className="bi bi-exclamation-triangle mr-2"></i> {error}
                    </p>
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
                        {suggestions && suggestions.length > 0 ? (
                            renderUsers(suggestions)
                        ) : (
                            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                                <div className="flex flex-col items-center">
                                    <i className="bi bi-people text-5xl text-gray-300 mb-3"></i>
                                    <h4 className="text-xl font-medium text-gray-700 mb-2">Không có gợi ý bạn bè</h4>
                                    <p className="text-gray-500 mb-4">
                                        Hiện tại chúng tôi không có gợi ý bạn bè nào cho bạn.
                                    </p>
                                    <p className="text-gray-600 mb-3">
                                        Bạn có thể tìm kiếm bạn bè bằng cách sử dụng thanh tìm kiếm ở trên.
                                    </p>
                                    <div className="bg-blue-50 rounded-lg p-4 w-full max-w-md">
                                        <p className="text-blue-700 font-medium mb-2 flex items-center">
                                            <i className="bi bi-lightbulb mr-2"></i>
                                            Mẹo tìm kiếm bạn bè
                                        </p>
                                        <ul className="text-blue-600 text-sm text-left list-disc pl-5">
                                            <li className="mb-1">Tìm theo tên đầy đủ hoặc tên đăng nhập</li>
                                            <li className="mb-1">Tìm theo email nếu bạn biết</li>
                                            <li className="mb-1">Thử tìm bạn học cùng hoặc đồng nghiệp</li>
                                            <li>Tham gia các nhóm có cùng sở thích</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {!isSearching && (
                <div className="bg-gray-50 p-4 rounded-lg mt-8">
                    <h4 className="font-medium text-lg mb-2">Tìm thêm bạn bè</h4>
                    <p className="text-gray-600 text-sm mb-4">
                        Mở rộng mạng lưới bạn bè và kết nối với những người có cùng sở thích, trường học hoặc nơi làm
                        việc.
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
            education: PropTypes.string,
        }),
    ).isRequired,
};

FindFriends.defaultProps = {};

export default FindFriends;
