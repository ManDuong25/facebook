import React, { useState, useEffect } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import images from '../../assets/images';
import api from '../../services/apiConfig';
import { getAvatarUrl, handleImageError as globalHandleImageError } from '../../utils/avatarUtils';
import { useSelector } from 'react-redux';

// Define the constant directly here
const MAX_CHAT_WINDOWS = 4;

const ChatSidebar = ({
    right,
    onSelectConversation,
    selectedConversation,
    activeConversationsCount = 0,
    onMaxChatWindowsChange = () => {},
}) => {
    const [conversations, setConversations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const user = useSelector((state) => state.auth.user);

    useEffect(() => {
        const fetchChats = async () => {
            if (!user?.id) return;

            setLoading(true);
            try {
                // Fetch all conversations for the current user
                const response = await api.get(`http://localhost:8080/api/messages/conversations/${user.id}`);

                if (response.data && response.data.data) {
                    // Transform the data to match our conversation format
                    const formattedConversations = response.data.data.map((conv) => ({
                        id: conv.id,
                        name: conv.name,
                        avatar: conv.avatar,
                        message: conv.lastMessage?.content || '',
                        time: conv.lastMessage?.createdAt
                            ? new Date(conv.lastMessage.createdAt).toLocaleTimeString()
                            : '',
                        online: conv.online || false,
                        userId: conv.userId,
                    }));

                    setConversations(formattedConversations);
                }
            } catch (error) {
                console.error('Lỗi khi kết nối đến API:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, [user?.id]);

    // Filter conversations based on search term
    const filteredConversations = conversations.filter((conv) =>
        conv.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
        <div
            className="fixed top-14 w-[360px] h-[90vh] bg-white shadow-lg border-l border-r border-gray-300 z-50 flex flex-col"
            style={{ right: `${right}px` }}
        >
            <div className="flex items-center justify-between px-3 py-2 border-b">
                <h2 className="text-lg font-semibold">Đoạn chat</h2>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">
                        {activeConversationsCount}/{MAX_CHAT_WINDOWS} đang mở
                    </span>
                    <i className="bi bi-arrows-fullscreen text-xl cursor-pointer"></i>
                    <i className="bi bi-pencil-square text-xl cursor-pointer"></i>
                </div>
            </div>

            <div className="p-3 border-b">
                <div className="relative">
                    <i className="bi bi-search absolute left-3 top-2.5 text-gray-400"></i>
                    <input
                        type="text"
                        className="w-full pl-10 pr-3 py-2 rounded-full bg-gray-100 outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Tìm kiếm trên Messenger"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="px-3 py-2 flex items-center border-b">
                <button className="font-bold text-sm text-[#1877F2] px-3 py-1 bg-white rounded-full transition-colors duration-200 hover:bg-[#f0f2f5]">
                    Hộp thư
                </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Không tìm thấy cuộc trò chuyện nào
                    </div>
                ) : (
                    filteredConversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => onSelectConversation && onSelectConversation(conv)}
                            className={`flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer ${
                                selectedConversation?.id === conv.id ? 'bg-gray-200' : ''
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10">
                                    <img
                                        src={getAvatarUrl(conv.avatar)}
                                        alt={conv.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                        onError={(e) => globalHandleImageError(e)}
                                    />
                                    {conv.online && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold leading-5">{conv.name}</span>
                                    {conv.message && (
                                        <span className="text-xs text-gray-500 leading-4">{conv.message}</span>
                                    )}
                                </div>
                            </div>
                            <span className="text-xs text-gray-400">{conv.time}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChatSidebar;
