import React, { useState, useRef, useEffect } from 'react';
import { getAvatarUrl, handleImageError } from '~/utils/avatarUtils';
import { getCurrentUser } from '~/services/authService';
import { sendMessage, getRoomMessagesPaginated } from '~/services/chatRoomMessageService';
import { addMember } from '~/services/chatRoomMemberService';
import websocketService from '../../services/websocketService';
import AddMembersModal from '../Modals/AddMembersModal';

const ChatRoomWindow = ({ conversation, onClose, index = 0, isOldest = false }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [minimized, setMinimized] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [showAddMembersModal, setShowAddMembersModal] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const loggedInUser = getCurrentUser();
    const loggedInUserId = loggedInUser?.id;
    const PAGE_SIZE = 20;

    console.log('Room id: ', conversation);
    useEffect(() => {
        const connectWebSocket = async () => {
            try {
                console.log('[WebSocket] Attempting to connect to WebSocket...');
                await websocketService.connect(() => {
                    console.log('[WebSocket] Successfully connected to WebSocket');

                    // Subscribe to room-specific topic
                    const roomTopic = `/topic/chat-rooms/${conversation.id}`;
                    console.log('[WebSocket] Subscribing to topic:', roomTopic);

                    // Unsubscribe from previous topic if exists
                    websocketService.unsubscribe(roomTopic);

                    // Add a small delay before subscribing to ensure unsubscribe is complete
                    setTimeout(() => {
                        websocketService.subscribe(roomTopic, (message) => {
                            console.log('[WebSocket] Received message in room:', message);
                            console.log('[WebSocket] Message type:', typeof message);
                            console.log('[WebSocket] Message content:', message.content);
                            console.log('[WebSocket] Message sender:', message.sender);
                            console.log('[WebSocket] Message room:', message.room);

                            setMessages((prevMessages) => {
                                // Kiểm tra xem tin nhắn đã tồn tại chưa (dựa vào pending message)
                                const existingMessageIndex = prevMessages.findIndex(
                                    (msg) =>
                                        (msg.pending &&
                                            msg.content === message.content &&
                                            msg.senderId === message.sender.id) ||
                                        msg.id === message.id, // Thêm kiểm tra ID để tránh duplicate
                                );

                                console.log('[WebSocket] Existing message index:', existingMessageIndex);

                                if (existingMessageIndex !== -1) {
                                    // Cập nhật tin nhắn pending thành tin nhắn thật
                                    const updatedMessages = [...prevMessages];
                                    updatedMessages[existingMessageIndex] = {
                                        id: message.id,
                                        senderId: message.sender.id,
                                        senderName: `${message.sender.firstName} ${message.sender.lastName}`,
                                        senderAvatar: message.sender.avatar,
                                        content: message.content,
                                        messageType: message.messageType,
                                        timestamp: formatMessageTime(message.createdAt),
                                        createdAt: message.createdAt,
                                        pending: false,
                                    };
                                    console.log(
                                        '[WebSocket] Updated pending message:',
                                        updatedMessages[existingMessageIndex],
                                    );
                                    return updatedMessages;
                                } else {
                                    // Thêm tin nhắn mới từ người khác
                                    const newMessage = {
                                        id: message.id,
                                        senderId: message.sender.id,
                                        senderName: `${message.sender.firstName} ${message.sender.lastName}`,
                                        senderAvatar: message.sender.avatar,
                                        content: message.content,
                                        messageType: message.messageType,
                                        timestamp: formatMessageTime(message.createdAt),
                                        createdAt: message.createdAt,
                                        pending: false,
                                    };
                                    console.log('[WebSocket] Adding new message:', newMessage);
                                    return [...prevMessages, newMessage];
                                }
                            });
                        });
                    }, 100);
                });
            } catch (error) {
                console.error('[WebSocket] Failed to connect to WebSocket:', error);
            }
        };

        if (conversation && conversation.id) {
            console.log('[WebSocket] Connecting to WebSocket for room:', conversation.id);
            connectWebSocket();
        }

        return () => {
            if (conversation && conversation.id) {
                const roomTopic = `/topic/chat-rooms/${conversation.id}`;
                console.log('[WebSocket] Unsubscribing from topic:', roomTopic);
                websocketService.unsubscribe(roomTopic);
            }
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
            console.log('[Chat] Sending message:', newMessage.trim());

            // Tạo tin nhắn tạm thời
            const tempMessage = {
                id: `temp-${Date.now()}`,
                senderId: loggedInUser.id,
                senderName: `${loggedInUser.firstName} ${loggedInUser.lastName}`,
                senderAvatar: loggedInUser.avatar,
                content: newMessage.trim(),
                messageType: 'TEXT',
                timestamp: formatMessageTime(new Date().toISOString()),
                createdAt: new Date().toISOString(),
                pending: true,
            };

            console.log('[Chat] Created temporary message:', tempMessage);

            // Thêm tin nhắn tạm thời vào danh sách
            setMessages((prev) => [...prev, tempMessage]);

            // Gửi tin nhắn qua WebSocket
            const messageToSend = {
                room: { id: conversation.id },
                sender: { id: loggedInUser.id },
                content: newMessage.trim(),
                messageType: 'TEXT',
            };
            console.log('[WebSocket] Sending message:', messageToSend);
            websocketService.send('/app/chat-rooms', messageToSend);

            setNewMessage('');
        } catch (error) {
            console.error('[Chat] Failed to send message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const toggleMinimize = () => {
        setMinimized(!minimized);
    };

    const handleAddMembers = async (selectedUsers) => {
        try {
            console.log('Selected users to add:', selectedUsers);
            // Thêm từng thành viên một vào phòng chat
            for (const user of selectedUsers) {
                await addMember(conversation.id, user.id);
            }
            setShowAddMembersModal(false);
        } catch (error) {
            console.error('Error adding members:', error);
            // TODO: Hiển thị thông báo lỗi cho người dùng
        }
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
                            <i
                                className="bi bi-people text-gray-600 cursor-pointer hover:text-gray-800"
                                onClick={() => setShowAddMembersModal(true)}
                            ></i>
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
                                        key={message.id || `temp-${message.createdAt}`}
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

            {/* Add Members Modal */}
            <AddMembersModal
                isOpen={showAddMembersModal}
                onClose={() => setShowAddMembersModal(false)}
                onComplete={handleAddMembers}
                roomId={conversation.id}
            />
        </div>
    );
};

export default ChatRoomWindow;
