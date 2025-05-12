import React, { useState, useRef, useEffect } from 'react';
import { getAvatarUrl, handleImageError } from '~/utils/avatarUtils';
import { getCurrentUser } from '~/services/authService';
import { sendMessage, getRoomMessagesPaginated } from '~/services/chatRoomMessageService';
import websocketService from '../../services/websocketService';

const ChatRoomWindow = ({ conversation, onClose, index = 0, isOldest = false }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [minimized, setMinimized] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const loggedInUser = getCurrentUser();
    const loggedInUserId = loggedInUser?.id;
    const PAGE_SIZE = 20;

    console.log('Room id: ', conversation);
    useEffect(() => {
        const connectWebSocket = async () => {
            try {
                await websocketService.connect(() => {
                    console.log('WebSocket connected');

                    // Subscribe to room-specific topic
                    const roomTopic = `/topic/chat-rooms/${conversation.id}`;
                    websocketService.subscribe(roomTopic, (message) => {
                        console.log('Received room message:', message);
                        setMessages((prevMessages) => {
                            // Kiểm tra xem tin nhắn đã tồn tại chưa
                            const messageExists = prevMessages.some(
                                (msg) =>
                                    msg.id === message.id ||
                                    (msg.pending &&
                                        msg.content === message.content &&
                                        msg.senderId === message.senderId),
                            );

                            if (messageExists) {
                                // Cập nhật tin nhắn nếu đã tồn tại
                                return prevMessages.map((msg) =>
                                    msg.id === message.id ||
                                    (msg.pending &&
                                        msg.content === message.content &&
                                        msg.senderId === message.senderId)
                                        ? {
                                              ...msg,
                                              id: message.id,
                                              pending: false,
                                              timestamp: formatMessageTime(message.createdAt),
                                              createdAt: message.createdAt,
                                          }
                                        : msg,
                                );
                            } else {
                                // Thêm tin nhắn mới
                                return [
                                    ...prevMessages,
                                    {
                                        id: message.id,
                                        senderId: message.senderId,
                                        senderName: message.senderName,
                                        content: message.content,
                                        messageType: message.messageType,
                                        timestamp: formatMessageTime(message.createdAt),
                                        createdAt: message.createdAt,
                                    },
                                ];
                            }
                        });
                    });
                });
            } catch (error) {
                console.error('Failed to connect to WebSocket:', error);
            }
        };

        connectWebSocket();

        return () => {
            websocketService.unsubscribe(`/topic/chat-rooms/${conversation.id}`);
        };
    }, [conversation.id]);

    // Fetch messages when the conversation changes
    useEffect(() => {
        if (conversation && loggedInUserId) {
            fetchMessages();
        }
    }, [conversation, loggedInUserId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (!isLoading) {
            scrollToBottom();
        }
    }, [messages, isLoading]);

    const fetchMessages = async (page = 0) => {
        try {
            setIsLoading(true);
            const response = await getRoomMessagesPaginated(conversation.id, page, PAGE_SIZE);
            console.log('Message trong chat room: ', response);

            const formattedMessages = response.content
                .slice()
                .reverse()
                .map((msg) => ({
                    id: msg.id,
                    senderId: msg.sender.id,
                    senderName: `${msg.sender.firstName} ${msg.sender.lastName}`,
                    senderAvatar: msg.sender.avatar,
                    content: msg.content,
                    messageType: msg.messageType,
                    timestamp: formatMessageTime(msg.createdAt),
                    createdAt: msg.createdAt,
                }));

            if (page === 0) {
                setMessages(formattedMessages);
            } else {
                setMessages((prev) => [...formattedMessages, ...prev]);
            }

            setHasMore(!response.last);
            setCurrentPage(page);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (!isLoading && hasMore) {
            fetchMessages(currentPage + 1);
        }
    };

    const handleScroll = () => {
        if (messagesContainerRef.current) {
            const { scrollTop } = messagesContainerRef.current;
            if (scrollTop === 0 && hasMore && !isLoading) {
                handleLoadMore();
            }
        }
    };

    const formatMessageTime = (timestamp) => {
        if (!timestamp) return '';

        try {
            const date = new Date(timestamp.replace(' ', 'T'));
            if (isNaN(date.getTime())) {
                console.error('Invalid date:', timestamp);
                return timestamp;
            }

            return date.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (e) {
            console.error('Error formatting timestamp:', e);
            return timestamp;
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        try {
            setIsSending(true);
            // Gọi API để lưu tin nhắn vào database
            const sentMessage = await sendMessage(conversation.id, loggedInUser.id, newMessage.trim(), 'TEXT');

            // Thêm tin nhắn mới vào danh sách
            const newMsg = {
                id: sentMessage.id,
                senderId: loggedInUser.id,
                senderName: `${loggedInUser.firstName} ${loggedInUser.lastName}`,
                senderAvatar: loggedInUser.avatar,
                content: newMessage.trim(),
                messageType: 'TEXT',
                timestamp: formatMessageTime(sentMessage.createdAt),
                createdAt: sentMessage.createdAt,
            };

            setMessages((prev) => [...prev, newMsg]);
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const toggleMinimize = () => {
        setMinimized(!minimized);
    };

    return (
        <div
            className={`bg-white rounded-t-lg shadow-lg border border-gray-300 z-40 flex flex-col transition-all duration-200 ease-in-out w-[328px] ${
                minimized ? 'h-[40px]' : 'h-[455px]'
            }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b bg-white rounded-t-lg">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <img
                            src={getAvatarUrl(conversation.avatar)}
                            alt={conversation.name}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={handleImageError}
                        />
                    </div>
                    <div className="font-semibold text-sm">
                        <span className="text-blue-600">[CHAT-ROOM]</span> {conversation.name}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!minimized && (
                        <>
                            <i className="bi bi-people text-gray-600 cursor-pointer hover:text-gray-800"></i>
                            <i className="bi bi-info-circle text-gray-600 cursor-pointer hover:text-gray-800"></i>
                        </>
                    )}
                    <i
                        className="bi bi-dash text-gray-600 cursor-pointer hover:text-gray-800"
                        onClick={toggleMinimize}
                    ></i>
                    <i className="bi bi-x text-gray-600 cursor-pointer hover:text-gray-800" onClick={onClose}></i>
                </div>
            </div>

            {/* Messages Container */}
            {!minimized && (
                <>
                    <div
                        ref={messagesContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 p-3 overflow-y-auto bg-gray-100"
                    >
                        {isLoading && currentPage === 0 ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <i className="bi bi-chat-text text-3xl mb-2"></i>
                                <p className="text-sm">Chưa có tin nhắn nào</p>
                                <p className="text-xs">Hãy bắt đầu cuộc trò chuyện</p>
                            </div>
                        ) : (
                            <>
                                {hasMore && (
                                    <div className="flex justify-center mb-2">
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={isLoading}
                                            className="text-sm text-blue-500 hover:text-blue-700 disabled:text-gray-400"
                                        >
                                            {isLoading ? 'Đang tải...' : 'Tải thêm tin nhắn'}
                                        </button>
                                    </div>
                                )}
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex mb-2 ${
                                            message.senderId === loggedInUser.id ? 'justify-end' : 'justify-start'
                                        }`}
                                    >
                                        {/* Avatar của người khác */}
                                        {message.senderId !== loggedInUser.id ? (
                                            <div className="flex flex-col justify-center mr-2">
                                                <img
                                                    src={getAvatarUrl(message.senderAvatar)}
                                                    alt=""
                                                    className="w-8 h-8 rounded-full"
                                                    onError={handleImageError}
                                                />
                                            </div>
                                        ) : null}
                                        <div className="flex flex-col max-w-[70%] mr-2">
                                            {/* Tên người gửi */}
                                            {message.senderId !== loggedInUser.id && (
                                                <span className="text-xs font-semibold mb-0.5 text-gray-700 text-left">
                                                    {message.senderName}
                                                </span>
                                            )}
                                            {/* Bubble tin nhắn */}
                                            <div
                                                className={`p-2 rounded-lg ${
                                                    message.senderId === loggedInUser.id
                                                        ? 'bg-blue-500 text-white rounded-br-none'
                                                        : 'bg-gray-800 text-white rounded-bl-none'
                                                }`}
                                            >
                                                <p className="text-sm">{message.content}</p>
                                            </div>
                                            {/* Thời gian */}
                                            <span
                                                className={`text-xs opacity-70 mt-1 ${
                                                    message.senderId === loggedInUser.id ? 'text-right' : 'text-left'
                                                }`}
                                            >
                                                {message.timestamp}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} className="p-2 border-t flex items-center gap-2 bg-white">
                        <i className="bi bi-plus-circle text-xl text-gray-600 cursor-pointer"></i>
                        <i className="bi bi-image text-xl text-gray-600 cursor-pointer"></i>
                        <i className="bi bi-emoji-smile text-xl text-gray-600 cursor-pointer"></i>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 py-1 px-3 rounded-full bg-gray-100 outline-none"
                            placeholder="Aa"
                            disabled={isSending || isLoading}
                        />
                        <i
                            className={`bi bi-send${newMessage.trim() ? '-fill' : ''} text-xl ${
                                newMessage.trim() && !isSending && !isLoading
                                    ? 'text-blue-500 cursor-pointer'
                                    : 'text-gray-400'
                            }`}
                            onClick={newMessage.trim() && !isSending && !isLoading ? handleSendMessage : undefined}
                        ></i>
                    </form>
                </>
            )}
        </div>
    );
};

export default ChatRoomWindow;
